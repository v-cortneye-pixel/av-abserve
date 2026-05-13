# AV Observe

**Zillow Group's Audio-Visual Infrastructure Observability Platform**

AV Observe is a comprehensive monitoring and alerting system that provides real-time visibility into Zillow's global AV infrastructure. The platform integrates with multiple services including Zoom, Q-SYS, Domotz, and network infrastructure to deliver automated daily reports, real-time alerts, and comprehensive analytics.

## Architecture Overview

This monorepo contains three main applications:

### 1. [av-daily-update](./apps/av-daily-update/) - *Primary Application*
The flagship application that orchestrates comprehensive daily monitoring across all AV systems. This is the heart of the observability platform.

**Key Features:**
- **Multi-Service Data Collection**: Aggregates data from Zoom, Q-SYS, Domotz, IP schedules, and Microsoft calendars
- **Intelligent Monitoring**: Performs health checks, script error detection, and automatic remediation
- **Slack Integration**: Generates rich daily reports with actionable insights
- **Splunk Analytics**: Pushes structured data for long-term analysis and trending
- **Network Validation**: Validates critical infrastructure connectivity before data collection
- **Error Tracking**: Maintains a knowledge base of common AV issues and solutions

### 2. [av-alerts-api](./apps/av-alerts-api/) - *Real-time Webhook Handler*
An AWS Lambda function that serves as an elegant traffic director for real-time webhooks from various AV systems.

**Key Features:**
- **Multi-Vendor Webhook Support**: Handles webhooks from Q-SYS, Zoom, and Domotz
- **Intelligent Routing**: Validates webhook sources and routes to appropriate handlers
- **Real-time Processing**: Enriches webhook data with additional context from APIs
- **Dual Logging**: Logs both raw and processed events to Splunk for analysis
- **Slack Alerting**: Sends immediate notifications for critical system events

### 3. [av-docker](./apps/av-docker/) - *Deprecated Metrics Exporter*
A containerized Prometheus metrics exporter for Q-SYS systems. **Note: This application is deprecated** in favor of the more comprehensive av-daily-update approach.

## Quick Start

### Prerequisites
- Node.js 18+ with ES modules support
- AWS CLI configured (for alerts-api deployment)
- Docker Desktop (for deprecated av-docker)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd av-observe

# Install dependencies
npm install

# Set up environment variables (see Configuration section)
cp .env.example .env
```

### Running Applications
```bash
# Daily update (full monitoring run)
npm run app:daily-update

# Daily update in test mode
npm run test:daily-update

# Splunk-only mode (no Slack reports)
npm run splunk-only

# Deploy alerts API to AWS Lambda
npm run script:deploy-alerts
```

## Configuration

### Required Environment Variables
Create a `.env` file in the root directory with the following variables:

#### Zoom API
```bash
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
```

#### Q-SYS APIs
```bash
# Q-SYS HTTP API
QSYS_USERNAME=your_qsys_username
QSYS_PASSWORD=your_qsys_password

# Q-SYS Remote Control (QRC)
QRC_USERNAME=your_qrc_username
QRC_PIN=your_qrc_pin

# Q-SYS Reflect API
QSYS_TOKEN=your_qsys_reflect_token
```

#### Slack Integration
```bash
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
```

#### Splunk HTTP Event Collector
```bash
SPLUNK_TOKEN=your_splunk_hec_token
```

#### Domotz API
```bash
DOMOTZ_KEY=your_domotz_api_key
```

#### Google Sheets API (for IP schedules and error tracking)
```bash
GOOGLE_KEY=your_google_service_account_private_key
GOOGLE_CLIENT_EMAIL=your_service_account_email
```

#### Microsoft Graph API (for calendar integration)
```bash
MICROSOFT_SECRET_VALUE=your_azure_app_client_secret
```

#### Juniper Switch Management
```bash
JUNIPER_USERNAME=your_juniper_username
JUNIPER_PASSWORD=your_juniper_password
```

### Optional Environment Variables
```bash
# Testing and debugging
mode=testing                    # Run in test mode
slim=true                      # Skip resource-intensive operations
SIMULATE_OUTAGES=true          # Simulate Q-SYS outages for testing
splunk_only=true              # Skip Slack reports, only update Splunk

# CI/CD
CI=true                       # Use .data directory instead of .ignore
GITLAB_CI=true               # GitLab CI environment flag
```

## Shared Modules

The platform includes a comprehensive set of shared modules located in `./shared/modules/`:

### Core Service Integrations
- **`Zoom.js`** - Zoom API client for room management and device monitoring
- **`qrc.js` (Core)** - Q-SYS Core direct communication via QRC protocol
- **`qHttp.js` (QHTTP)** - Q-SYS HTTP API client for metrics and diagnostics
- **`qReflect.js` (QREM)** - Q-SYS Reflect cloud API client
- **`Domotz.js`** - Domotz network monitoring API client
- **`Microsoft.js`** - Microsoft Graph API client for calendar integration

### Infrastructure & Networking
- **`NetworkValidator.js`** - Network connectivity validation for critical infrastructure
- **`Juniper.js`** - Juniper switch management and IP schedule validation
- **`ipSchedule.js`** - IP address scheduling and validation logic

### Communication & Analytics
- **`Slack.js`** - Slack Bot API client with rich formatting and interactive features
- **`Splunk.js`** - Splunk HTTP Event Collector client for data ingestion
- **`Google.js`** - Google Sheets API client for configuration and error tracking

### Webhook Handlers
- **`qsysWebhooks.js`** - Q-SYS webhook processing and enrichment
- **`zoomWebhooks.js`** - Zoom webhook processing and validation

### Utilities
- **`ErrorSync.js`** - Error knowledge base synchronization with Google Sheets

## Data Flow

### Daily Update Workflow
1. **Network Validation** - Validates connectivity to critical infrastructure
2. **Data Collection** - Parallel collection from all integrated services
3. **Processing & Analysis** - Analyzes data for issues, performs auto-remediation
4. **Report Generation** - Creates comprehensive Slack reports with actionable insights
5. **Data Storage** - Saves structured data to local files and Splunk
6. **Error Tracking** - Updates error knowledge base with new issues

### Real-time Alert Flow
1. **Webhook Reception** - AWS Lambda receives webhook from AV system
2. **Source Validation** - Validates webhook authenticity and source
3. **Data Enrichment** - Enriches webhook data with additional context
4. **Processing** - Routes to appropriate handler based on source system
5. **Alerting** - Sends immediate Slack notifications for critical issues
6. **Logging** - Stores both raw and processed events in Splunk

## Monitoring & Analytics

### Splunk Integration
The platform pushes structured data to Splunk for:
- **Long-term trending** of system performance metrics
- **Capacity planning** based on usage patterns
- **Root cause analysis** of recurring issues
- **Custom dashboards** and alerting rules

### Key Metrics Tracked
- **Zoom**: Room device status, app versions, connectivity issues
- **Q-SYS**: Core diagnostics, script errors, memory usage, temperature
- **Network**: Switch connectivity, IP schedule compliance
- **Domotz**: Agent status, speed test results, device inventory

## Testing

```bash
# Run interactive test suite
npm test

# Test specific components
npm run test:zoom
npm run test:daily-update
npm run test:daily-update:outages
npm run test:daily-update:slim

# Test Lambda function
npm run test:lambda
```

## Deployment

### Daily Update
The daily update runs automatically via scheduled jobs. For manual deployment:
```bash
# Production run
npm run app:daily-update

# Test run (sends to test channel)
mode=testing npm run app:daily-update
```

### Alerts API (AWS Lambda)
```bash
# Package and deploy to AWS Lambda
npm run script:deploy-alerts

# Manual steps
npm run script:package-alerts  # Creates code.zip
npm run script:upload-alerts   # Uploads to AWS Lambda
```

### Docker (Deprecated)
```bash
npm run app:docker
npm run script:reboot-docker
```

## Development

### Project Structure
```
av-observe/
├── apps/
│   ├── av-daily-update/     # Main monitoring application
│   ├── av-alerts-api/       # AWS Lambda webhook handler
│   └── av-docker/           # Deprecated Prometheus exporter
├── shared/
│   ├── modules/             # Shared service clients and utilities
│   └── config.json          # Shared configuration
└── test/                    # Test suites and scenarios
```

### Adding New Integrations
1. Create a new module in `shared/modules/`
2. Add the module to `shared/modules/index.js`
3. Integrate into the daily update workflow
4. Add webhook support to alerts-api if needed
5. Update documentation

## Contributing

1. Follow the existing code patterns and naming conventions
2. Prefer simple, clear, and robust solutions over complex implementations
3. Add comprehensive error handling and logging
4. Update documentation for any new features or changes
5. Test thoroughly in test mode before production deployment

## License

Internal Zillow Group project - All rights reserved.

---

For detailed information about each application, see their respective README files:
- [av-daily-update README](./apps/av-daily-update/README.md)
- [av-alerts-api README](./apps/av-alerts-api/README.md)
- [av-docker README](./apps/av-docker/README.md)
