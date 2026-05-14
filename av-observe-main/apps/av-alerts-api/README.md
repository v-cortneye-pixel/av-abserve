# AV Alerts API

**Real-time Webhook Processing via AWS Lambda**

The av-alerts-api is an elegant AWS Lambda function that serves as a centralized traffic director for real-time webhooks from various AV systems. It provides intelligent webhook validation, data enrichment, immediate alerting, and comprehensive logging for all incoming events.

> **Documentation status.** The inline code snippets in this README describe
> intent and architecture; **`index.mjs` (and the modules under
> `shared/modules/`, e.g. `qsysWebhooks.js`, `zoomWebhooks.js`) are the source
> of truth.** Some snippets here may show an earlier inline-handler shape and
> have not been re-flowed since the handlers were extracted into shared
> modules. When in doubt, trust the source.

## Overview

This serverless application acts as the real-time counterpart to the daily monitoring system, processing webhooks as they occur and providing immediate response to critical system events. It's designed to handle high-frequency webhook traffic with minimal latency while maintaining comprehensive logging and alerting capabilities.

## Architecture

### Lambda Function Flow
```
Webhook → API Gateway → Lambda Function → [Validation] → [Processing] → [Alerting] → Response
                                    ↓
                              [Splunk Logging]
```

### Core Components
1. **Source Validation**: Identifies and validates webhook sources
2. **Webhook Handlers**: Specialized processors for each vendor
3. **Data Enrichment**: API calls to gather additional context
4. **Logging Pipeline**: Structured logging to Splunk for analysis
5. **Alert Engine**: Real-time Slack notifications for critical events

## Webhook Processing Workflow

### Phase 1: Initial Reception & Raw Logging
```javascript
export const handler = async (event) => {
  // Initialize encrypted credentials
  await decodeCloudCredentials();
  
  // Log raw webhook immediately for forensics
  await splunk.push(event, 'zgav_nonprod', 'alerts-api-raw');
```

**What happens:**
- AWS Lambda receives webhook via API Gateway
- Decrypts stored credentials using AWS KMS
- Logs complete raw webhook to Splunk for forensic analysis
- Initializes service clients (Splunk, Slack, Q-SYS APIs)

### Phase 2: Source Validation & Authentication
```javascript
const validateSender = (headers) => {
  // Q-SYS webhook validation
  if (headers['x-qsc-attempt'] && headers['x-qsc-hook-uuid']) return 'qsys';
  
  // Zoom webhook validation  
  if (headers['x-zm-request-id'] && headers['x-zm-request-timestamp']) return 'zoom';
  
  // Domotz webhook validation
  if (headers['customwebhooksource'] === 'domotzWebhook') return 'domotz';
  
  // Development/testing
  if (headers['user-agent'].includes('curl')) return 'curl';
  
  return null; // Unknown source
};
```

**Validation Methods:**
- **Q-SYS**: Validates `x-qsc-attempt` and `x-qsc-hook-uuid` headers
- **Zoom**: Validates `x-zm-request-id` and `x-zm-request-timestamp` headers  
- **Domotz**: Validates `customwebhooksource` header
- **Development**: Allows curl for testing

### Phase 3: Vendor-Specific Processing

#### Q-SYS Webhook Handling
```javascript
const handleQsysWebhook = async (webhookBody, defaultResponse) => {
  const qsysData = JSON.parse(webhookBody);
  const qrem = new QREM();
  
  // Enrich webhook with additional system context
  const [coreInfo, systemInfo] = await Promise.all([
    qrem.getCoreById(qsysData.alert.coreId),
    qrem.getSystemById(qsysData.alert.systemId)
  ]);
  
  qsysData.coreInfo = coreInfo;
  qsysData.systemInfo = systemInfo;
  
  // Critical alert detection
  if (coreInfo.status?.message !== "Running") {
    const alertMessage = `:warning: System Outage detected on ${qsysData.alert.systemName}:\n` +
                        `Message: ${qsysData.alert.message}\n` +
                        `${coreInfo.name} is offline!`;
    
    await slack.sendMessage(alertMessage, slack.testChannelId);
  }
  
  return {
    serverResponse: { statusCode: 200, body: "Q-SYS webhook processed" },
    Details: qsysData
  };
};
```

**Q-SYS Processing:**
- Parses webhook payload containing alert information
- Enriches data with core and system details from Q-SYS Reflect API
- Detects critical system outages (core not running)
- Sends immediate Slack alerts for system outages
- Returns enriched data for Splunk logging

#### Zoom Webhook Handling
```javascript
const handleZoomWebhook = async (event, defaultResponse) => {
  const { headers, body } = event;
  
  // Handle Zoom webhook validation challenge
  if (body && JSON.parse(body).event === 'endpoint.url_validation') {
    const challenge = JSON.parse(body);
    return {
      serverResponse: {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plainToken: challenge.payload.plainToken,
          encryptedToken: challenge.payload.encryptedToken
        })
      },
      Details: { validationChallenge: true, ...challenge }
    };
  }
  
  // Process actual webhook events
  const zoomEvent = JSON.parse(body);
  
  // Add processing logic for different Zoom event types
  return {
    serverResponse: { statusCode: 200, body: "Zoom webhook processed" },
    Details: zoomEvent
  };
};
```

**Zoom Processing:**
- Handles Zoom's webhook validation challenges automatically
- Processes various Zoom event types (room status, device changes, etc.)
- Validates webhook authenticity using Zoom headers
- Supports both validation and operational webhooks

#### Domotz Webhook Handling
```javascript
// Future implementation for Domotz network monitoring alerts
const handleDomotzWebhook = async (webhookBody, defaultResponse) => {
  const domotzEvent = JSON.parse(webhookBody);
  
  // Process network device alerts, connectivity issues, etc.
  return {
    serverResponse: { statusCode: 200, body: "Domotz webhook processed" },
    Details: domotzEvent
  };
};
```

### Phase 4: Processed Event Logging
```javascript
if (Details) {
  const processedPayload = {
    source,
    originalEvent: event,
    Details
  };
  
  await splunk.push(processedPayload, 'zgav_nonprod', 'alerts-api');
}
```

**Structured Logging:**
- Combines original webhook with processed/enriched data
- Maintains traceability from raw webhook to final processing
- Enables comprehensive analysis and debugging in Splunk
- Separates raw logs (`alerts-api-raw`) from processed logs (`alerts-api`)

## Deployment & Configuration

### AWS Lambda Setup

#### Function Configuration
```json
{
  "FunctionName": "av-alerts-api",
  "Runtime": "nodejs18.x",
  "Handler": "index.handler",
  "Role": "arn:aws:iam::account:role/av-alerts-lambda-role",
  "Environment": {
    "Variables": {
      "KMS_KEY_ID": "arn:aws:kms:us-west-2:account:key/key-id"
    }
  },
  "Timeout": 30,
  "MemorySize": 256
}
```

#### Required IAM Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt"
      ],
      "Resource": "arn:aws:kms:us-west-2:*:key/*"
    },
    {
      "Effect": "Allow", 
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### Deployment Process

#### Automated Deployment
```bash
# Package and deploy in one command
npm run script:deploy-alerts

# Manual step-by-step
npm run script:package-alerts  # Creates code.zip
npm run script:upload-alerts   # Uploads to AWS Lambda
```

#### Manual Deployment Steps
```bash
# 1. Navigate to alerts-api directory
cd apps/av-alerts-api

# 2. Package Lambda function
bash package-lambda.sh

# 3. Upload to AWS Lambda
aws lambda update-function-code \
  --function-name av-alerts-api \
  --zip-file fileb://code.zip \
  --region us-west-2
```

### Credential Management

#### Encrypted Credentials Storage
```javascript
// Credentials are encrypted using AWS KMS and stored in the Lambda package
const decodeCloudCredentials = async () => {
  const kms = new KMSClient({ region: 'us-west-2' });
  
  // Decrypt each credential using KMS
  for (const [key, encryptedValue] of Object.entries(encryptedCredentials)) {
    const decryptCommand = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedValue, 'base64')
    });
    
    const decryptedResult = await kms.send(decryptCommand);
    process.env[key] = Buffer.from(decryptedResult.Plaintext).toString('utf-8');
  }
};
```

#### Required Encrypted Credentials
- `QSYS_REFLECT_USERNAME` - Q-SYS Reflect API username
- `QSYS_REFLECT_PASSWORD` - Q-SYS Reflect API password  
- `SLACK_BOT_TOKEN` - Slack Bot API token
- `SPLUNK_HEC_TOKEN` - Splunk HTTP Event Collector token
- `SPLUNK_HEC_URL` - Splunk HEC endpoint URL

### API Gateway Configuration

#### Function URL (Recommended)
```bash
# Create Lambda Function URL for direct webhook access
aws lambda create-function-url-config \
  --function-name av-alerts-api \
  --auth-type NONE \
  --cors '{
    "AllowCredentials": false,
    "AllowHeaders": ["*"],
    "AllowMethods": ["POST"],
    "AllowOrigins": ["*"],
    "MaxAge": 86400
  }'
```

**Function URL Format:**
```
https://x2bzkdfz2skxnzbsi4thtn6x4y0lbaml.lambda-url.us-west-2.on.aws/
```

## Monitoring & Observability

### CloudWatch Metrics
- **Invocations**: Total webhook processing count
- **Duration**: Processing time per webhook
- **Errors**: Failed webhook processing attempts
- **Throttles**: Rate limiting occurrences

### Splunk Analytics

#### Raw Webhook Analysis
```splunk
index="zgav_nonprod" sourcetype="AV" "alerts-api-raw"
| stats count by headers.user-agent
| sort -count
```

#### Processed Event Analysis  
```splunk
index="zgav_nonprod" sourcetype="AV" "alerts-api"
| stats count by source
| sort -count
```

#### Q-SYS Outage Detection
```splunk
index="zgav_nonprod" sourcetype="AV" "alerts-api" source="qsys"
| spath path=Details.coreInfo.status.message output=coreStatus
| where coreStatus!="Running"
| table _time, Details.alert.systemName, coreStatus, Details.alert.message
```

### Error Handling & Debugging

#### Common Issues & Solutions

**KMS Decryption Failures:**
```javascript
// Check IAM permissions for KMS key access
// Verify KMS key ID in environment variables
// Ensure encrypted credentials are properly base64 encoded
```

**Webhook Validation Failures:**
```javascript
// Verify webhook source headers are correctly configured
// Check vendor webhook configuration for proper header inclusion
// Test with curl to validate header processing
```

**Splunk Logging Failures:**
```javascript
// Verify HEC token and URL configuration
// Check network connectivity from Lambda to Splunk
// Monitor CloudWatch logs for detailed error messages
```

## Testing & Development

### Local Testing
```bash
# Test Lambda function locally
npm run test:lambda

# Manual webhook testing with curl
curl -X POST https://function-url.lambda-url.region.on.aws/ \
  -H 'Content-Type: application/json' \
  -H 'x-qsc-attempt: 1' \
  -H 'x-qsc-hook-uuid: test-uuid' \
  -d '{"alert": {"systemName": "Test System", "message": "Test alert"}}'
```

### Webhook Source Testing

#### Q-SYS Webhook Test
```bash
curl -X POST $LAMBDA_URL \
  -H 'Content-Type: application/json' \
  -H 'x-qsc-attempt: 1' \
  -H 'x-qsc-hook-uuid: test-12345' \
  -d '{
    "alert": {
      "coreId": "core-123",
      "systemId": "system-456", 
      "systemName": "Test System",
      "message": "Test outage alert"
    }
  }'
```

#### Zoom Webhook Validation Test
```bash
curl -X POST $LAMBDA_URL \
  -H 'Content-Type: application/json' \
  -H 'x-zm-request-id: req-123' \
  -H 'x-zm-request-timestamp: 1234567890' \
  -d '{
    "event": "endpoint.url_validation",
    "payload": {
      "plainToken": "test-token",
      "encryptedToken": "encrypted-test-token"
    }
  }'
```

### Development Workflow
1. **Local Development**: Test webhook handlers with mock data
2. **Package & Deploy**: Use automated deployment scripts
3. **Integration Testing**: Test with actual webhook sources
4. **Monitor Logs**: Check CloudWatch and Splunk for proper processing
5. **Validate Alerts**: Confirm Slack notifications work correctly

## Performance & Scaling

### Lambda Performance Characteristics
- **Cold Start**: ~500ms for credential decryption
- **Warm Execution**: ~50-100ms per webhook
- **Memory Usage**: 128-256MB typical
- **Concurrent Executions**: Auto-scales to 1000+ concurrent webhooks

### Cost Optimization
- **Function URL**: No API Gateway costs
- **Minimal Memory**: 256MB sufficient for most webhooks
- **Short Timeout**: 30 seconds maximum
- **Efficient Logging**: Structured payloads minimize Splunk ingestion costs

### Scaling Considerations
- **Rate Limiting**: Lambda auto-scales but consider vendor rate limits
- **Error Handling**: Implement exponential backoff for API calls
- **Monitoring**: Set up CloudWatch alarms for error rates and duration

## Future Enhancements

### Planned Features
1. **Enhanced Domotz Integration**: Network device alert processing
2. **Webhook Replay**: Ability to replay failed webhooks for debugging
3. **Custom Alert Rules**: Configurable alerting logic per webhook type
4. **Webhook Analytics**: Real-time dashboard for webhook processing metrics
5. **Multi-Region Deployment**: Geographic redundancy for high availability

### Integration Opportunities
1. **PagerDuty Integration**: Escalate critical alerts to on-call teams
2. **ServiceNow Integration**: Automatic ticket creation for system outages
3. **Microsoft Teams**: Alternative notification channel
4. **Grafana Dashboards**: Real-time webhook processing visualization

---

The av-alerts-api represents a modern, serverless approach to real-time AV system monitoring. By leveraging AWS Lambda's auto-scaling capabilities and maintaining comprehensive logging, it provides a robust foundation for immediate response to critical infrastructure events while supporting future expansion and integration opportunities.
