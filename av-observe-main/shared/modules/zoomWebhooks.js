import crypto from 'crypto';
import { decodeCloudCredentials } from '../cloud-credentials.js';
import Zoom from './Zoom.js';
import Slack from './Slack.js';

// SYNC: Fast Zoom webhook handler - handles auth challenges and immediate response
export const handleZoomWebhookSync = async (event, defaultReturnBody) => {
    let payload;
    try {
        payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (error) {
        return { 
            response: defaultReturnBody,
            consoleMessage: `Zoom: Failed to parse event body - ${error.message}`,
            needsAsyncProcessing: false
        };
    }
    
    // Check if this is a retry webhook
    const retryNum = event.headers['x-zoom-retry-num'];
    const isRetry = retryNum && parseInt(retryNum) > 0;
    
    // Route based on event type
    switch (payload.event) {
        case 'endpoint.url_validation':
            // Auth challenges must be processed synchronously
            const authResult = await handleZoomAuthChallengeInternal(payload, defaultReturnBody);
            return {
                response: authResult.serverResponse,
                consoleMessage: authResult.consoleMessage,
                needsAsyncProcessing: false
            };
        default:
            // All other events can be processed asynchronously
            const immediateMessage = isRetry 
                ? `Zoom ${payload.event}: retry received - processing in background`
                : `Zoom ${payload.event}: received - processing in background`;
            
            return {
                response: defaultReturnBody,
                consoleMessage: immediateMessage,
                needsAsyncProcessing: true,
                payload: { ...payload, isRetry }
            };
    }
};

// ASYNC: Heavy Zoom webhook processing - runs after response sent
export const handleZoomWebhookAsync = async (payloadWithRetry) => {
    const { isRetry, ...payload } = payloadWithRetry;
    return await handleZoomEvents(payload, null, isRetry);
};

// Handle Zoom auth challenge (URL validation)
const handleZoomAuthChallengeInternal = async (payload, defaultReturnBody) => {
    
    const hashForValidate = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN)
        .update(payload.payload.plainToken)
        .digest('hex');

    // Auth challenges need special server response format, no processing needed
    return {
        serverResponse: {
            ...defaultReturnBody,
            statusCode: 200,
            body: JSON.stringify({
                "plainToken": payload.payload.plainToken,
                "encryptedToken": hashForValidate
            })
        },
        Details: {
            event: 'endpoint.url_validation',
            plainToken: payload.payload.plainToken,
            encryptedToken: hashForValidate
        },
        consoleMessage: 'Zoom: URL validation challenge processed'
    };
};

// Handle actual Zoom webhook events
const handleZoomEvents = async (body, defaultReturnBody, isRetry = false) => {
    const { event, payload } = body;
    let Details = {};
    let apiErrors = [];
    
    // Mark as retry for Splunk tracking
    if (isRetry) {
        Details.isRetry = true;
        Details.retryProcessing = 'skipped_slack_notifications';
    }
    
    // Handle meeting events that need host validation and details
    if (['meeting.started', 'meeting.ended'].includes(event)) {
        try {
            const zoom = new Zoom();
            const { host_id: hostId, id: meetingId } = payload.object;
            
            // Get meeting type (Room or User) using cached validation
            Details.meetingType = await zoom.validateHostId(hostId);
            
            // Get meeting details for started meetings
            if (event === 'meeting.started') {
                const meetingDetails = await zoom.getMeetingDetails(meetingId);
                if (meetingDetails.error) {
                    apiErrors.push(`getMeetingDetails: ${meetingDetails.message}`);
                }
                Details.meetingDetails = meetingDetails;
                Details.currentMeetings = await zoom.requestData("metrics/meetings", {getLengthOnly: true});
            }
            
            // If it's a room, get additional room details and create special event
            if (Details.meetingType.type === 'Room') {
                Details.roomInfo = await zoom.getZoomRoomDetails(hostId);
                
                // Handle roomsInMeeting with proper error handling
                try {
                    const roomsInMeeting = await zoom.getRoomsInMeeting();
                    Details.roomsInMeeting = Array.isArray(roomsInMeeting) ? roomsInMeeting : [];
                } catch (error) {
                    apiErrors.push(`getRoomsInMeeting: ${error.message}`);
                    Details.roomsInMeeting = [];
                }
                
                Details.eventType = event === 'meeting.started' ? 'zoomroom.started' : 'zoomroom.ended';
            } else {
                // For user meetings, keep the original event name
                Details.eventType = event;
            }
            
        } catch (error) {
            apiErrors.push(`meeting processing: ${error.message}`);
            Details.error = error.message;
        }
    }
    // Handle zoom room alerts
    else if (event === 'zoomroom.alert') {
        Details.eventType = event;
        Details.roomAlert = {
            roomName: payload.object.room_name,
            issue: payload.object.issue,
            component: payload.object.component,
            alertKind: payload.object.alert_kind,
            alertType: payload.object.alert_type
        };
        
        // Send Slack notification for online/offline alerts (skip for retries)
        let slackSent = false;
        if (!isRetry && payload.object.issue && (payload.object.issue.includes('offline') || payload.object.issue.includes('online'))) {
            try {
                const slack = new Slack();
                let channelId, message;
                
                // Special handling for Olympic Board Room
                if (payload.object.room_name === "Olympic Board Room") {
                    channelId = slack.olympicChannelId;
                    message = `${payload.object.room_name} reports: ${payload.object.issue}\n[note: Expect updates on weekends]`;
                    Details.specialAlert = true;
                } else {
                    channelId = slack.liveAlertsChannelId;
                    message = `${payload.object.room_name} - ${payload.object.issue}`;
                }
                
                const msgResult = await slack.sendMessage(message, channelId);
                slackSent = true;
                Details.slackSent = true;
                Details.slackMessage = message;
                
            } catch (error) {
                apiErrors.push(`Slack notification: ${error.message}`);
                Details.slackSent = false;
            }
        } else if (isRetry && payload.object.issue && (payload.object.issue.includes('offline') || payload.object.issue.includes('online'))) {
            // Log that we skipped Slack for retry
            Details.slackSkipped = true;
            Details.slackSkipReason = 'retry_webhook';
        }
        
        // Get room telemetry for all zoom room alerts (from old app logic)
        try {
            const zoom = new Zoom();
            const roomData = await zoom.getOfflineRooms({ includeTotalCount: true });
            const roomDetails = await zoom.getZoomRoomDetails(payload.object.id);
            Details.offlineRooms = roomData.offlineRooms;
            Details.totalRooms = roomData.totalRooms;
            Details.roomDetails = roomDetails;
        } catch (error) {
            apiErrors.push(`getOfflineRooms: ${error.message}`);
            Details.errors = error.message;
        }
        
    
    }
    // Handle meeting alerts
    else if (event === 'meeting.alert') {
        Details.eventType=event;
        Details.meetingAlert = payload.object.issues;
    }
    // Handle sensor data (but don't log to console due to volume)
    else if (event === 'zoomroom.sensor_data') {
        Details.eventType = event;
        Details.sensorData = {
            roomName: payload.object.room_name,
            roomId: payload.object.id,
            deviceId: payload.object.device_id,
            timestamp: payload.event_ts,
            // Extract sensor readings from the array
            sensors: payload.object.sensor_data || []
        };
        // Don't console.log sensor data due to high volume
    }
    
    // Add API errors to Details for Splunk filtering and create console message
    let consoleMessage;
    if (apiErrors.length > 0) {
        Details.apiErrors = apiErrors;
        const meetingInfo = payload?.object ? `(Meeting ID: ${payload.object.id}, Host: ${payload.object.host_id})` : '';
        consoleMessage = `Zoom ${event}: API errors ${meetingInfo} - ${apiErrors.join(', ')}`;
    } else {
        // Create appropriate console message based on event type and Slack status
        if (event === 'zoomroom.alert' && payload.object) {
            const roomName = payload.object.room_name;
            const issue = payload.object.issue;
            let slackStatus = '';
            if (Details.slackSent) {
                slackStatus = '(Slack sent)';
            } else if (Details.slackSkipped) {
                slackStatus = '(retry - Slack skipped)';
            }
            consoleMessage = `Zoom Room Alert: ${roomName} - ${issue} ${slackStatus}`.trim();
        } else {
            const meetingInfo = payload?.object ? `(Meeting ID: ${payload.object.id})` : '';
            const retryInfo = isRetry ? ' (retry)' : '';
            consoleMessage = `Zoom ${event}: processed successfully ${meetingInfo}${retryInfo}`;
        }
    }
    
    return {
        serverResponse: defaultReturnBody,
        Details,
        consoleMessage
    };
};

