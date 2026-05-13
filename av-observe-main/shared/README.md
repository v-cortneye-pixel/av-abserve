# Shared Modules

**Comprehensive Service Integration Library for AV Observe**

The shared modules provide a unified interface to all external services and systems used by the AV Observe platform. These modules handle authentication, API communication, data processing, and error handling for seamless integration across all applications.

## Module Overview

### Core Service Integrations
- **[Zoom.js](#zoomjs)** - Zoom API client for room management and device monitoring
- **[qrc.js (Core)](#qrcjs-core)** - Q-SYS Core direct communication via QRC protocol
- **[qHttp.js (QHTTP)](#qhttpjs-qhttp)** - Q-SYS HTTP API client for metrics and diagnostics
- **[qReflect.js (QREM)](#qreflectjs-qrem)** - Q-SYS Reflect cloud API client
- **[Domotz.js](#domotzjs)** - Domotz network monitoring API client
- **[Microsoft.js](#microsoftjs)** - Microsoft Graph API client for calendar integration

### Infrastructure & Networking
- **[NetworkValidator.js](#networkvalidatorjs)** - Network connectivity validation for critical infrastructure
- **[Juniper.js](#juniperjs)** - Juniper switch management and IP schedule validation
- **[ipSchedule.js](#ipschedulejs)** - IP address scheduling and validation logic

### Communication & Analytics
- **[Slack.js](#slackjs)** - Slack Bot API client with rich formatting and interactive features
- **[Splunk.js](#splunkjs)** - Splunk HTTP Event Collector client for data ingestion
- **[Google.js](#googlejs)** - Google Sheets API client for configuration and error tracking

### Webhook Handlers
- **[qsysWebhooks.js](#qsyswebhooksjs)** - Q-SYS webhook processing and enrichment
- **[zoomWebhooks.js](#zoomwebhooksjs)** - Zoom webhook processing and validation

### Utilities
- **[ErrorSync.js](#errorsyncjs)** - Error knowledge base synchronization with Google Sheets

---

## Core Service Integrations

### Zoom.js

**Purpose**: Complete Zoom API integration for room management, device monitoring, and usage analytics.

#### Key Methods
```javascript
import { Zoom } from '@av-observe/shared/modules/index.js';
const zoom = new Zoom();

// Daily monitoring workflow
const dailyData = await zoom.dailyUpdate();
// Returns: { fullData, slackRooms, roomDevices }

// Get room device information
const devices = await zoom.getRoomDevices(roomId);

// Get offline rooms for alerting
const offlineRooms = await zoom.getOfflineRooms();

// Get usage analytics (20 days)
const reportData = await zoom.getDailyReportData();
```

#### Required Environment Variables
```bash
ZOOM_ACCOUNT_ID=your_zoom_account_id    # Zoom Account ID
ZOOM_CLIENT_ID=your_zoom_client_id      # OAuth Server-to-Server App Client ID
ZOOM_CLIENT_SECRET=your_zoom_client_secret # OAuth Server-to-Server App Client Secret
```

#### Dependencies
- `axios` - HTTP client for API requests
- `crypto` - OAuth signature generation

#### Data Structures
```javascript
// Room Device Structure
{
  roomId: "gt5EbkOLTmad6VORf_W4mA",
  roomName: "AV DEV 1", 
  locationId: "GE9Ss3d9TTONigL-hSG_aQ",
  devices: [
    {
      id: "neat-NA12144002511",
      device_type: "Scheduling Display",
      app_version: "6.5.5 (3902)",
      status: "Online",
      ip_address: "192.168.1.62",
      device_manufacturer: "Neat",
      device_model: "Neat Pad"
    }
  ]
}
```

---

### qrc.js (Core)

**Purpose**: Direct communication with Q-SYS Cores using the QRC (Q-SYS Remote Control) protocol for real-time monitoring and control.

#### Key Methods
```javascript
import { Core } from '@av-observe/shared/modules/index.js';
const qrc = new Core('192.168.1.100', { systemName: 'IRV-Core-1' });

// Get core diagnostics (temperature, fan speeds, etc.)
const diagnostics = await qrc.getCoreDiagnostics();

// Script error detection and remediation
const scriptResults = await qrc.processScriptIssues(systemName, site, ip);

// Get script errors
const errors = await qrc.getScriptErrors();

// Get script status issues  
const statuses = await qrc.getScriptStatuses();

// Restart failed scripts
const restarted = await qrc.restartScript(componentName);
```

#### Required Configuration
- Direct network access to Q-SYS Cores
- QRC protocol enabled on Q-SYS systems (default port varies)

#### Dependencies
- `net` - TCP socket communication
- Built-in JSON parsing with null terminator handling

#### Key Features
- **Auto-Remediation**: Automatically restarts failed scripts and validates resolution
- **Consolidated Events**: Creates single events per component with boolean flags
- **Error Correlation**: Correlates script errors with status issues
- **Temperature Monitoring**: Real-time core temperature and fan speed monitoring

---

### qHttp.js (QHTTP)

**Purpose**: Q-SYS HTTP API client for system metrics, memory usage, and performance monitoring.

#### Key Methods
```javascript
import { QHTTP } from '@av-observe/shared/modules/index.js';
const qhttp = new QHTTP('192.168.1.100');

// Get comprehensive system metrics
const metrics = await qhttp.getSystemMetrics();

// Get memory usage information
const memory = await qhttp.getMemory();

// Get network interface statistics
const network = await qhttp.getNetworkStats();
```

#### Required Configuration
- Q-SYS HTTP API enabled on cores
- Network access to Q-SYS systems on HTTP port (typically 80/443)

#### Dependencies
- `axios` - HTTP client for API requests

#### Data Structures
```javascript
// System Metrics Response
{
  cpu: { usage: 25.4 },
  memory: { usage: 42.1, available: 1024 },
  temperature: {
    processor: 45.2,
    system: 38.1
  },
  network: {
    interfaces: [...]
  }
}
```

---

### qReflect.js (QREM)

**Purpose**: Q-SYS Reflect cloud platform integration for system inventory and status monitoring.

#### Key Methods
```javascript
import { QREM } from '@av-observe/shared/modules/index.js';
const qrem = new QREM();

// Daily system status update
const systemsBySite = await qrem.dailyUpdate();

// Get specific core information
const coreInfo = await qrem.getCoreById(coreId);

// Get system details
const systemInfo = await qrem.getSystemById(systemId);
```

#### Required Environment Variables
```bash
QSYS_TOKEN=your_qsys_reflect_token    # Q-SYS Reflect API access token
```

#### Dependencies
- `axios` - HTTP client for API requests
- Authentication token management

---

### Domotz.js

**Purpose**: Domotz network monitoring integration for agent status, speed tests, and device inventory.

#### Key Methods
```javascript
import { Domotz } from '@av-observe/shared/modules/index.js';
const domotz = new Domotz();

// Get agents organized by site
const agentsBySite = await domotz.getAgentsBySite();

// Get agents with speed test results
const agentsWithSpeedTests = await domotz.getAgentsWithSpeedTests();

// Get device inventory for specific agent
const devices = await domotz.getDevices(agentId);
```

#### Required Environment Variables
```bash
DOMOTZ_KEY=your_domotz_api_key    # Domotz API key from portal
```

#### Dependencies
- `axios` - HTTP client for API requests

#### Data Structures
```javascript
// Agent with Speed Test
{
  id: 12345,
  display_name: "IRV-Agent-1",
  status: "online",
  speedtest: {
    download_speed: 847.2,
    upload_speed: 45.8,
    latency: 12.3,
    timestamp: "2025-10-21T10:00:00Z"
  }
}
```

---

### Microsoft.js

**Purpose**: Microsoft Graph API integration for calendar data and meeting room utilization.

#### Key Methods
```javascript
import { Microsoft } from '@av-observe/shared/modules/index.js';
const ms = new Microsoft();

// Get calendar data organized by site
const calendarsBySite = await ms.getCalendarsBySite();

// Get specific room calendar
const calendar = await ms.getRoomCalendar(roomEmail);
```

#### Required Environment Variables
```bash
MICROSOFT_SECRET_VALUE=your_azure_app_client_secret # Azure App Registration Client Secret
```

#### Dependencies
- `axios` - HTTP client for API requests
- OAuth 2.0 client credentials flow

---

## Infrastructure & Networking

### NetworkValidator.js

**Purpose**: Validates network connectivity to critical infrastructure before data collection operations.

#### Key Methods
```javascript
import { NetworkValidator } from '@av-observe/shared/modules/index.js';
const validator = new NetworkValidator();

// Validate all critical infrastructure
const results = await validator.validateCriticalInfrastructure();

// Generate Slack report
const slackReport = validator.generateSlackReport(results);

// Generate Splunk data
const splunkData = validator.generateSplunkData(results);
```

#### Configuration
- Validates gateways, switches, and critical network endpoints
- Configurable timeout and retry settings
- Performance threshold monitoring

#### Dependencies
- `net` - TCP connectivity testing
- Built-in ping functionality

---

### Juniper.js

**Purpose**: Juniper switch management for IP schedule validation and network configuration.

#### Key Methods
```javascript
import { Juniper } from '@av-observe/shared/modules/index.js';
const juniper = new Juniper();

// Connect to switch via SSH
await juniper.connect(hostname, username, password);

// Get ARP table for device tracking
const arpTable = await juniper.getArpTable();

// Get MAC address table
const macTable = await juniper.getMacTable();

// Validate IP schedules
const validation = await juniper.validateIpSchedules();
```

#### Dependencies
- `ssh2` - SSH client for switch communication
- Network access to Juniper switches

---

### ipSchedule.js

**Purpose**: IP address scheduling logic and validation against network configurations.

#### Key Methods
```javascript
import { IpSchedule } from '@av-observe/shared/modules/index.js';
const ipSchedule = new IpSchedule();

// Load IP schedule from Google Sheets
const schedule = await ipSchedule.loadIpSchedule(config);

// Validate current assignments
const validation = await ipSchedule.validateSchedules();
```

#### Dependencies
- Google Sheets API for schedule data
- Network validation utilities

---

## Communication & Analytics

### Slack.js

**Purpose**: Comprehensive Slack Bot integration with rich formatting, interactive features, and multi-channel support.

#### Key Methods
```javascript
import { Slack } from '@av-observe/shared/modules/index.js';
const slack = new Slack();

// Send formatted message
await slack.sendMessage(message, channelId);

// Send message with blocks/attachments
await slack.sendRichMessage(blocks, channelId);

// Handle interactive components
await slack.handleBlockActions(payload);

// Handle modal submissions
await slack.handleModalSubmission(payload);
```

#### Required Environment Variables
```bash
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token      # Slack Bot User OAuth Token
```

#### Dependencies
- `@slack/web-api` - Official Slack Web API client

#### Features
- Rich message formatting with blocks and attachments
- Interactive buttons and modals
- File uploads and threading
- Error handling with fallback channels

---

### Splunk.js

**Purpose**: Splunk HTTP Event Collector (HEC) client for structured data ingestion and analytics.

#### Key Methods
```javascript
import { Splunk } from '@av-observe/shared/modules/index.js';
const splunk = new Splunk();

// Push structured data to Splunk
await splunk.push(data, index, sourcetype);

// Push with custom metadata
await splunk.push(data, 'zgav_nonprod', 'av.daily.update');
```

#### Required Environment Variables
```bash
SPLUNK_TOKEN=your_splunk_hec_token    # HEC token from Splunk
```

#### Dependencies
- `axios` - HTTP client for HEC requests

#### Data Structure
```javascript
// Splunk Event Structure
{
  index: "zgav_nonprod",
  sourcetype: "AV", 
  event: {
    timestamp: "2025-10-21T10:00:00.000Z",
    event: "av.daily.update",
    data: { ... }
  }
}
```

---

### Google.js

**Purpose**: Google Sheets API client for configuration management and error knowledge base.

#### Key Methods
```javascript
import { Google } from '@av-observe/shared/modules/index.js';
const google = new Google();

// Read spreadsheet data
const data = await google.readSheet(spreadsheetId, range);

// Write data to spreadsheet
await google.writeSheet(spreadsheetId, range, values);

// Append data to spreadsheet
await google.appendSheet(spreadsheetId, range, values);
```

#### Required Environment Variables
```bash
GOOGLE_KEY="-----BEGIN PRIVATE KEY-----\n..."    # Service account private key
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com    # Service account email
```

#### Dependencies
- `googleapis` - Official Google APIs client library

---

## Webhook Handlers

### qsysWebhooks.js

**Purpose**: Processes Q-SYS webhooks with data enrichment and intelligent alerting.

#### Key Methods
```javascript
import { handleQsysWebhook } from '@av-observe/shared/modules/qsysWebhooks.js';

// Process Q-SYS webhook
const result = await handleQsysWebhook(webhookBody, defaultResponse);
```

#### Features
- Webhook payload validation
- Data enrichment with Q-SYS Reflect API
- Critical alert detection (system outages)
- Structured logging for analysis

---

### zoomWebhooks.js

**Purpose**: Handles Zoom webhooks including validation challenges and event processing.

#### Key Methods
```javascript
import { handleZoomWebhook } from '@av-observe/shared/modules/zoomWebhooks.js';

// Process Zoom webhook
const result = await handleZoomWebhook(event, defaultResponse);
```

#### Features
- Automatic validation challenge responses
- Event type routing and processing
- Header validation for security
- Support for various Zoom event types

---

## Utilities

### ErrorSync.js

**Purpose**: Synchronizes error knowledge base between local data and Google Sheets for documentation and analysis.

#### Key Methods
```javascript
import { ErrorSync } from '@av-observe/shared/modules/index.js';
const errorSync = new ErrorSync();

// Load local error types
const localErrors = errorSync.loadLocalErrorTypes();

// Sync with Google Sheets
await errorSync.syncErrorTypes(dataDir);
```

#### Dependencies
- Google Sheets API for knowledge base storage
- File system access for local error data

---

## Configuration

### Shared Configuration (`shared/config.json`)
```json
{
  "errorKnowledgeBase": {
    "spreadsheetId": "1h57WezGBw0MSdFIZmpaV7zZc330Fla7wunTy8N5vlXQ",
    "tab": "Error Types"
  },
  "ipScheduleSpreadsheet": {
    "spreadsheetId": "1efvIfN1IBDRdrE0u9jkAHjUefbzwfaptvF8rHNCPIE8", 
    "tab": "IP Schedule"
  },
  "zoom": {
    "filterRules": {
      "excludeOfflineRooms": ["AV DEV", "Test Room"],
      "siteMappings": {
        "SFO": "San Francisco",
        "IRV": "Irvine", 
        "SEA": "Seattle",
        "NYC": "New York",
        "DEN": "Denver"
      }
    }
  },
  "qsys": {
    "temperatureThresholds": {
      "processor": { "warning": 60, "critical": 70 },
      "system": { "warning": 50, "critical": 60 }
    },
    "memoryThresholds": {
      "warning": 80,
      "critical": 90
    }
  }
}
```

### Environment Variables Summary
```bash
# Zoom API (OAuth Server-to-Server)
ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=

# Q-SYS APIs
QSYS_USERNAME=          # Q-SYS HTTP API
QSYS_PASSWORD=          # Q-SYS HTTP API
QRC_USERNAME=           # Q-SYS Remote Control
QRC_PIN=                # Q-SYS Remote Control
QSYS_TOKEN=             # Q-SYS Reflect Cloud Platform

# Slack Bot Integration
SLACK_BOT_TOKEN=

# Splunk HTTP Event Collector
SPLUNK_TOKEN=

# Domotz Network Monitoring
DOMOTZ_KEY=

# Google Sheets API (Service Account)
GOOGLE_KEY=
GOOGLE_CLIENT_EMAIL=

# Microsoft Graph API (Azure App)
MICROSOFT_SECRET_VALUE=

# Juniper Switch Management
JUNIPER_USERNAME=
JUNIPER_PASSWORD=
```

## Usage Patterns

### Basic Service Integration
```javascript
import { 
  Zoom, Slack, Splunk, Domotz, Microsoft, 
  Core, QHTTP, QREM, NetworkValidator 
} from '@av-observe/shared/modules/index.js';

// Initialize services
const zoom = new Zoom();
const slack = new Slack();
const splunk = new Splunk();

// Collect data
const zoomData = await zoom.dailyUpdate();
const networkResults = await new NetworkValidator().validateCriticalInfrastructure();

// Process and alert
const report = generateReport(data);
await slack.sendMessage(report, slack.channelId);
await splunk.push(data, 'zgav_nonprod', 'av.daily.update');
```

### Error Handling Pattern
```javascript
try {
  const data = await service.getData();
  return data;
} catch (error) {
  console.error(`Failed to get data from ${service.name}:`, error.message);
  
  // Fallback or graceful degradation
  return { error: true, message: error.message, data: [] };
}
```

### Parallel Processing Pattern
```javascript
// Efficient parallel data collection
const [zoomData, qsysData, domotzData] = await Promise.all([
  zoom.dailyUpdate().catch(e => ({ error: e.message })),
  qrem.dailyUpdate().catch(e => ({ error: e.message })),
  domotz.getAgentsBySite().catch(e => ({ error: e.message }))
]);
```

## Troubleshooting

### Common Issues

#### Authentication Failures
```bash
# Check environment variables
echo $ZOOM_API_KEY
echo $SLACK_BOT_TOKEN

# Verify API credentials in respective portals
# Zoom: https://marketplace.zoom.us/
# Slack: https://api.slack.com/apps
```

#### Network Connectivity
```bash
# Test Q-SYS connectivity
telnet qsys-core-ip 1710

# Test HTTP APIs
curl -I https://api.zoom.us/v2/users/me

# Check firewall rules and VPN connections
```

#### Rate Limiting
- Zoom: 1-second delays implemented between device requests
- Slack: Built-in rate limiting in SDK
- Splunk: Batch processing for large datasets

### Performance Optimization
- Use `Promise.all()` for parallel API calls
- Implement caching for frequently accessed data
- Use connection pooling for database-like services
- Monitor API usage and implement backoff strategies

---

This comprehensive module library provides the foundation for all AV Observe functionality, enabling seamless integration with diverse systems while maintaining consistent error handling, logging, and performance characteristics across the entire platform.
