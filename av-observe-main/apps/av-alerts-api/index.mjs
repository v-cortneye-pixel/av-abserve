// Import only what's actually needed for the Lambda
import Splunk from './shared/modules/Splunk.js';
import { decodeCloudCredentials } from './shared/cloud-credentials.js';
import { handleQsysWebhook } from './shared/modules/qsysWebhooks.js';
import { handleZoomWebhookSync, handleZoomWebhookAsync } from './shared/modules/zoomWebhooks.js';


// Global instances - initialized after credential decryption
let splunk;
const splunkInstance = 'zgav_nonprod';

const validateSender = (headers) => {
  // Q-Sys validation
  if (headers['x-qsc-attempt'] && headers['x-qsc-hook-uuid']) return 'qsys';
  if (headers['user-agent'].includes('curl')) return 'curl';
  // Zoom validation - both auth challenges and webhooks have these headers
  if (headers['x-zm-request-id'] && headers['x-zm-request-timestamp']) return 'zoom';
  // Domotz validation
  if (headers['customwebhooksource'] === 'domotzWebhook') return 'domotz';
  
  console.log(`> Unknown sender, headers:`, Object.keys(headers));
  // Add other webhook sources here
  return null;
};


// PHASE 1: Fast synchronous processing - must complete before response
const processSynchronously = async (event) => {
  // Initialize credentials (required for all processing)
  await decodeCloudCredentials();
  
  // Initialize service instances
  if (!splunk) splunk = new Splunk();
  
  // Log RAW webhook to Splunk (fast operation)
  try {
    await splunk.push(event, splunkInstance, 'alerts-api-raw');
  } catch (error) {
    console.error('> Splunk raw logging failed:', error.message);
  }
  
  // Validate sender (fast operation)
  const source = validateSender(event.headers);
  
  const defaultReturnBody = { 
    source, 
    statusCode: source ? 200 : 401, 
    body: source ? "AV's Observability Lambda!" : "Unknown Source!"
  };
  
  // Handle webhooks that need immediate processing
  let response = defaultReturnBody;
  let syncData = { source, needsAsyncProcessing: false };
  
  switch(source) {
    case 'qsys':
      // Q-SYS can be fully processed synchronously (fast)
      const qsysResult = await handleQsysWebhook(event.body, defaultReturnBody);
      response = qsysResult.serverResponse || qsysResult;
      syncData.Details = qsysResult.Details;
      syncData.consoleMessage = qsysResult.consoleMessage;
      break;
      
    case 'zoom':
      // Zoom needs special handling - auth challenges sync, events async
      const zoomSyncResult = await handleZoomWebhookSync(event, defaultReturnBody);
      response = zoomSyncResult.response;
      syncData.consoleMessage = zoomSyncResult.consoleMessage;
      syncData.needsAsyncProcessing = zoomSyncResult.needsAsyncProcessing;
      syncData.zoomPayload = zoomSyncResult.payload;
      break;
      
    default: 
      syncData.consoleMessage = 'No handler written for this event';
  }
  
  // Log immediate console message
  if (syncData.consoleMessage) {
    console.log(syncData.consoleMessage);
  }
  
  return { response, syncData };
};

// PHASE 3: Asynchronous processing - runs after response sent
const processAsynchronously = async (event, syncResult) => {
  const { syncData } = syncResult;
  
  if (!syncData.needsAsyncProcessing) {
    // Handle non-Zoom webhooks that were fully processed synchronously
    if (syncData.Details) {
      console.log(`Background: Logging ${syncData.source} webhook to Splunk with Details`);
      await logToSplunk(event, syncData.source, syncData.Details);
    } else {
      console.log(`Background: No Details to log for ${syncData.source} webhook`);
    }
    return;
  }
  
  // Handle Zoom webhooks that need heavy API processing
  if (syncData.source === 'zoom') {
    const asyncResult = await handleZoomWebhookAsync(syncData.zoomPayload);
    
    // Log async completion
    if (asyncResult.consoleMessage) {
      console.log(asyncResult.consoleMessage);
    }
    
    // Log to Splunk with full details
    if (asyncResult.Details) {
      await logToSplunk(event, 'zoom', asyncResult.Details);
    }
  }
};

// Helper function for Splunk logging
const logToSplunk = async (event, source, Details) => {
  try {
    const processedEvent = { ...event };
    if (typeof event.body === 'string') {
      try {
        processedEvent.body = JSON.parse(event.body);
      } catch (parseError) {
        console.warn('Could not parse event body as JSON:', parseError.message);
      }
    }
    
    const processedPayload = {
      source,
      originalEvent: processedEvent,
      Details
    };
    
    await splunk.push(processedPayload, splunkInstance, 'alerts-api');
  } catch (error) {
    console.error(`Splunk logging failed for ${source}:`, error.message);
  }
};

// MAIN HANDLER: Entry point for all webhook processing
export const handler = async (event, context) => {
  // Allow Lambda to return response before background processes complete
  context.callbackWaitsForEmptyEventLoop = false;
  
  // PHASE 1: Synchronous processing (must complete before response)
  const syncResult = await processSynchronously(event);
  
  // PHASE 2: Return response immediately to client
  const response = syncResult.response;
  
  // PHASE 3: Asynchronous processing (continues after response sent)
  processAsynchronously(event, syncResult).catch(error => {
    console.error('Background processing failed:', error.message);
  });
  
  return response;
};
