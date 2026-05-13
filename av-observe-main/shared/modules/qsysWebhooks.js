import QREM from './qReflect.js';
import Slack from './Slack.js';

export const handleQsysWebhook = async (data, defaultReturnBody) => {
  try {
    let qsysData = JSON.parse(data);
    const qrem = new QREM();
    const slack = new Slack();
    
    // Run both API calls in parallel (handle missing systemId)
    const apiCalls = [qrem.getCoreById(qsysData.alert.coreId)];
    
    if (qsysData.alert.systemId) {
      apiCalls.push(qrem.getSystemById(qsysData.alert.systemId));
    } else {
      console.log(`Q-SYS: No systemId in payload for ${qsysData.alert.systemName}, skipping getSystemById`);
      apiCalls.push(Promise.resolve({ note: 'systemId not provided in webhook payload' }));
    }
    
    const [coreInfo, systemInfo] = await Promise.all(apiCalls);
    
    qsysData.coreInfo = coreInfo;
    qsysData.systemInfo = systemInfo;

    // Send to Slack if core is not running
    if (coreInfo.status?.message !== "Running") {
      const msg = `:warning: System Outage detected on ${qsysData.alert.systemName}:\nMessage: ${qsysData.alert.message}\n${coreInfo.name} is offline!`;
      const msgSent = await slack.sendMessage(msg, slack.testChannelId);
      
      return {
        serverResponse: {
          ...defaultReturnBody,
          slackMessage: { sent: true, result: msgSent }
        },
        Details: {
          eventType: 'qsys.core.offline',
          systemAlert: {
            systemName: qsysData.alert.systemName,
            message: qsysData.alert.message,
            severity: qsysData.alert.severity,
            siteName: qsysData.alert.siteName,
            coreId: qsysData.alert.coreId,
            systemId: qsysData.alert.systemId
          },
          coreInfo,
          systemInfo,
          slackSent: true
        },
        consoleMessage: `Q-SYS: ${qsysData.alert.systemName} core offline, Slack sent`
      };
    }

    // Core is running - return processed data without Slack alert
    return {
      serverResponse: defaultReturnBody,
      Details: {
        eventType: 'qsys.system.alert',
        systemAlert: {
          systemName: qsysData.alert.systemName,
          message: qsysData.alert.message,
          severity: qsysData.alert.severity,
          siteName: qsysData.alert.siteName,
          coreId: qsysData.alert.coreId,
          systemId: qsysData.alert.systemId
        },
        coreInfo,
        systemInfo,
        slackSent: false
      },
      consoleMessage: `Q-SYS: ${qsysData.alert.systemName} alert processed, core running`
    };

  } catch (error) {
    return {
      serverResponse: {
        ...defaultReturnBody,
        error: error.message
      },
      Details: null, // Explicitly return null Details so we know it failed
      consoleMessage: `Q-SYS webhook processing failed: ${error.message}`
    };
  }
};
