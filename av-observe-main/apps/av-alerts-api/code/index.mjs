// Import only what's actually needed for the Lambda
import QREM from './shared/modules/qReflect.js';
import Splunk from './shared/modules/Splunk.js';
import Slack from './shared/modules/Slack.js';
import { cloudCredentials } from './cloud-credentials.js';

// Global instances - initialized after credential decryption
let splunk, slack;
const splunkInstance = 'zgav_nonprod';

const validateSender = (headers) => {
  // Q-Sys validation
  if (headers['x-qsc-attempt'] && headers['x-qsc-hook-uuid']) return 'qsys';
  if (headers['user-agent'].includes('curl')) return 'curl';
  // Add other webhook sources here
  return null;
};

const handleQsys = async (data, returnBody) => {
  try {
    let qsysData = JSON.parse(data);
    const qrem = new QREM();
    
    // Run both API calls in parallel
    const [coreInfo, systemInfo] = await Promise.all([
      qrem.getCoreById(qsysData.alert.coreId),
      qrem.getSystemById(qsysData.alert.systemId)
    ]);
    
    qsysData.coreInfo = coreInfo;
    qsysData.systemInfo = systemInfo;
    
    // Log to Splunk
    await splunk.push(qsysData, splunkInstance, 'qsys_webhook');

    // Send to Slack if core is not running
    if (coreInfo.status?.message !== "Running") {
      const msg = `:warning: System Outage detected on ${qsysData.alert.systemName}:\nMessage: ${qsysData.alert.message}\n${coreInfo.name} is offline!`;
      const msgSent = await slack.sendMessage(msg, slack.testChannelId);
      returnBody.slackMessage = { sent: true, result: msgSent };
    }
  } catch (error) {
    console.error('Error with Qsys webhook:', error.message);
    returnBody.error = error.message;
  }
};

export const handler = async (event) => {
  
  //Initialize credentials
  await cloudCredentials();
  
  // Initialize service instances after credential decryption
  if (!splunk) splunk = new Splunk();
  if (!slack) slack = new Slack();
  
  // Log all events to Splunk
  try {
    await splunk.push(event, splunkInstance, 'lambda_webhook_raw');
  } catch (error) {
    console.error('Splunk logging failed:', error.message);
  }

  const source = validateSender(event.headers);

  console.log(`> Recieved message from sender ${source}`);
  
  const returnBody = { 
    source, 
    statusCode: source ? 200 : 401, 
    body: source ? "AV's Observability Lambda!" : "Unknown Source!"
  };

  // Handle different webhook sources
  switch(source) {
    case 'qsys':
      await handleQsys(event.body, returnBody);
      break;
    default: 
      // No specific handling for unknown sources
  }

  return returnBody;
};
