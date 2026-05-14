# AV Daily Update

**Comprehensive Daily Monitoring and Reporting for Zillow's AV Infrastructure**

The av-daily-update application is the flagship component of the AV Observe platform, orchestrating comprehensive daily monitoring across Zillow's global audio-visual infrastructure. It collects data from multiple services, performs intelligent analysis, executes automated remediation, and delivers actionable insights through Slack reports and Splunk analytics.

## Overview

This app is meant to provide a daily picture of the health of the AV landscape at Zillow. From Q-Sys Reflect, Zoom, Outlook, Domotz....it even logs into each network switch and cross references the switch's arp and mac tables with our IP schedule. Actionable alerts are forwarded to Splunk, and a more robust data object is forwarded to Splunk


## Complete Workflow

### Phase 1: Test Communication
```javascript
// Network connectivity validation before data collection
const networkValidator = new NetworkValidator();
const networkResults = await networkValidator.validateCriticalInfrastructure();
```

**What happens:**
- Validates connectivity to critical infrastructure (gateways, switches)
- Tests response times and identifies slow connections
- Logs network issues that could affect data collection
- Provides early warning of infrastructure problems

### Phase 2: Multi-Service Data Collection

#### 2.1 Zoom Data Collection
```javascript
const zoomData = await zoom.dailyUpdate();
```

**Collects:**
- **Daily Reports**: Meeting statistics, user counts, usage metrics (20 days)
- **Room Devices**: All Zoom room devices across 228+ rooms including:
  - Device status (Online/Offline)
  - App versions and firmware
  - Hardware details (manufacturer, model, serial numbers)
  - Network information (IP addresses, MAC addresses)
  - Device types (Zoom Rooms Computer, Controller, Scheduling Display)

**Processing:**
- Groups offline rooms by city/site for targeted reporting
- Applies intelligent filters to exclude expected offline rooms
- Collects device information with rate limiting (1 second between requests)

#### 2.2 Q-SYS Data Collection & Analysis
```javascript
const qsysBySite = await qrem.dailyUpdate();
```

**Multi-layered Q-SYS monitoring:**

1. **Q-SYS Reflect API** (`qrem.dailyUpdate()`):
   - System inventory and basic status from cloud platform
   - Identifies systems with reported issues
   - **Core firmware tracking**: Collects version, model, serial, and health status for all cores
   - Returns both site-organized data and enriched cores array for Splunk analytics

2. **Direct Core Communication** (`qrc.processScriptIssues()`):
   - Real-time script error detection
   - Script status monitoring
   - **Automated remediation**: Restarts failed scripts/components
   - Post-restart validation to confirm resolution

3. **HTTP API Metrics** (`qhttp.getSystemMetrics()`):
   - Core diagnostics (processor temperature, system temperature, fan speeds)
   - Memory usage monitoring
   - Performance metrics

**Intelligent Script Remediation:**
```javascript
// Consolidated event creation per component
const event = {
  system: "IRV-1250 zRetreat",
  site: "IRV",
  component: "Disp_2",
  hasErrors: true,
  hasStatusIssues: true,
  restartSuccessful: true,
  errors: [...],
  statusIssues: [...]
};
```

#### 2.3 Domotz Network Monitoring
```javascript
const domotzBySite = await new Domotz().getAgentsBySite();
const agentsWithSpeedTests = await new Domotz().getAgentsWithSpeedTests();
```

**Collects:**
- Network agent status across all sites
- Internet speed test results
- Device inventory and connectivity status
- Network performance metrics

#### 2.4 IP Schedule Validation
```javascript
const ipScheduleValidator = new IpSchedule();
await ipScheduleValidator.validateSchedules();
```

**Validates:**
- IP address assignments against scheduled configurations
- Switch connectivity and VLAN configurations
- Network compliance across 13+ managed switches
- ARP table analysis for device tracking

#### 2.5 Microsoft Calendar Integration
```javascript
const microsoftBySite = await ms.getCalendarsBySite();
```

**Collects:**
- Meeting room calendar data
- Booking patterns and utilization metrics
- Integration status with AV systems

### Phase 3: Data Processing & Site Organization

**Intelligent Site Grouping:**
```javascript
// Organize all data by site for comprehensive reporting
for (const site of allSites) {
  dailyData.sites[site] = {
    qsys: [],      // Q-SYS systems with detailed metrics
    zoom: [],      // Zoom rooms grouped by status
    domotz: [],    // Network agents and speed tests
    ipSchedule: [], // IP validation results
    microsoft: []   // Calendar integration status
  };
}
```

**Advanced Q-SYS Processing:**
- Parallel execution of metrics collection for performance
- Intelligent error correlation across multiple data sources
- Memory usage trending and leak detection
- Temperature monitoring with threshold alerting

### Phase 4: Report Generation & Slack Integration

**Rich Slack Report Creation:**
```javascript
const report = generateReport(dailyData);
```

**Report Structure:**
1. **Header**: Quick links to all monitoring dashboards
2. **Service Status**: Q-SYS Reflect, network validation results
3. **Site-by-Site Breakdown**:
   - Q-SYS systems with error counts and memory usage
   - Zoom offline rooms with device details
   - Domotz agent status and speed test results
   - IP schedule compliance issues
4. **Summary Statistics**: Total counts and health metrics

**Intelligent Alerting:**
- Filters out expected offline rooms (maintenance, decommissioned)
- Highlights persistent issues requiring attention
- Provides direct links to relevant dashboards and tools
- Groups related issues for efficient troubleshooting

### Phase 5: Data Storage & Analytics

#### 5.1 Local Data Files
```javascript
await saveDailyDataFiles(dailyData, report, slackChannel);
```

**Saves:**
- `.ignore/dailyData.json` or `.data/dailyData.json`: Complete dataset for analysis and debugging
- `.ignore/slackData.txt` or `.data/slackData.txt`: Formatted Slack report for reference
- `.ignore/splunkData.json` or `.data/splunkData.json`: Structured payload matching Splunk ingestion format

**Data Output:**

The application also writes `data-output.json` into the same data directory
(`.ignore/` locally, `.data/` in CI):

- `data-output.json`: Complete dataset with `lastUpdated` timestamp

**Key Features:**
- File is overwritten each run (no accumulation of old files)
- Includes a `lastUpdated` field with ISO 8601 timestamp
- Contains all collected data including Splunk payload structure
- **Not tracked in Git** (matches `.gitignore`); use CI artifacts if you need archival

#### 5.2 Splunk Integration
```javascript
const payload = {
  timestamp: new Date().toISOString(),
  event: 'av.daily.update',
  data: {
    zoomReports: [...],
    zoomRoomDevices: [...],
    qsysMetrics: [...],
    qsysScriptEvents: [...],  // Consolidated events per component
    qsysCores: [...],          // Core firmware and hardware information
    domotzAgents: [...],
    ipScheduleValidation: [...],
    networkValidation: [...]
  }
};
```

**Analytics Benefits:**
- Long-term trending of system performance
- Firmware version tracking and upgrade planning
- Hardware inventory management
- Capacity planning based on usage patterns
- Root cause analysis of recurring issues
- Custom dashboard creation and alerting

### Phase 6: Error Knowledge Base Management

```javascript
await trackErrorTypes(dailyData);
```

**Automated Error Documentation:**
- Extracts new error types from Q-SYS systems
- Updates Google Sheets knowledge base
- Categorizes errors by system and component
- Maintains historical error patterns for analysis

### Phase 7: Site-Specific Alerting

```javascript
await sendSiteSpecificAlerts(dailyData);
```

**Targeted Notifications:**
- Site-specific Slack channels for local issues
- Integration with Microsoft calendar data
- Customized alert thresholds per location
- Escalation paths for critical issues

## Execution Modes

### Production Mode
```bash
npm run app:daily-update
```
- Full data collection and processing
- Sends reports to production Slack channels
- Updates Splunk with complete dataset
- Executes all remediation actions

### Test Mode
```bash
npm run test:daily-update
```
- Complete workflow execution
- Sends reports to test Slack channel only
- Skips Splunk updates to prevent test data pollution
- Safe for development and validation

### Slim Mode
```bash
npm run test:daily-update:slim
```
- Lightweight execution skipping resource-intensive operations
- Network validation only
- No Q-SYS metrics collection or script remediation
- Faster execution for basic connectivity testing

### Splunk-Only Mode
```bash
npm run splunk-only
```
- Data collection and Splunk ingestion only
- No Slack reports generated
- Optimized for analytics pipeline updates
- Includes success notification to test channel

## Configuration

### Environment Variables

#### Required API Keys
```bash
# Zoom API (OAuth Server-to-Server App)
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret

# Q-SYS APIs
QSYS_USERNAME=your_qsys_username          # Q-SYS HTTP API
QSYS_PASSWORD=your_qsys_password          # Q-SYS HTTP API
QRC_USERNAME=your_qrc_username            # Q-SYS Remote Control
QRC_PIN=your_qrc_pin                      # Q-SYS Remote Control
QSYS_TOKEN=your_qsys_reflect_token        # Q-SYS Reflect Cloud Platform

# Slack Bot Integration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token

# Splunk HTTP Event Collector
SPLUNK_TOKEN=your_splunk_hec_token

# Domotz API
DOMOTZ_KEY=your_domotz_api_key

# Google Sheets API (Service Account)
GOOGLE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com

# Microsoft Graph API (Azure App Registration)
MICROSOFT_SECRET_VALUE=your_azure_app_client_secret

# Juniper Switch Management
JUNIPER_USERNAME=your_juniper_username
JUNIPER_PASSWORD=your_juniper_password
```

#### Execution Control
```bash
# Execution modes
mode=testing              # Send to test channel, skip Splunk
slim=true                 # Skip resource-intensive operations
splunk_only=true          # Skip Slack reports

# Tunable defaults
SPLUNK_INDEX=zgav_nonprod # Target Splunk index (see shared/modules/Splunk.js allowlist)

# CI/CD environments
CI=true                   # Use .data directory instead of .ignore
GITLAB_CI=true            # GitLab CI environment
```

### Configuration Files

#### `shared/config.json`
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
        "SEA": "Seattle"
      }
    }
  }
}
```

## Data Outputs

### Data Output

The application saves a single JSON file `data-output.json` inside the
runtime data directory (`.ignore/` locally, `.data/` in CI) on every run:

#### `data-output.json`
```json
{
  "lastUpdated": "2025-11-17T15:30:00.000Z",
  "sites": {
    "IRV": {
      "qsys": [...],
      "zoom": [...],
      "domotz": [...],
      "ipSchedule": [...],
      "microsoft": [...]
    }
  },
  "splunkData": {
    "zoomReports": [...],
    "zoomRoomDevices": [...],
    "qsysMetrics": [...],
    "qsysScriptEvents": [...],
    "qsysCores": [...],
    "domotzAgents": [...],
    "ipScheduleValidation": [...]
  },
  "networkValidation": {...}
}
```

**Usage:**
- File is overwritten on each run, ensuring only the latest data is stored
- `lastUpdated` field indicates when the data was last generated
- Contains all collected data including site-specific and Splunk payload structures
- Can be used for downstream processing, archival, or external integrations
- **Not tracked in Git.** Use CI artifacts or a separate archive if you need history.

### Slack Report Format
```
Good Morning! Here is your daily AV update!

*Quick Links:*
• Q-Sys Reflect Dashboard
• Zoom Offline Rooms  
• Domotz Portal
• Splunk Dashboard
• IP Schedule
• Common AV Errors

**IRVINE** (3 systems, 45 rooms)
├── Q-SYS: 3 systems, 0 errors, avg 28% memory
├── Zoom: 2 offline rooms
│   └── IRV-1109 ZHL: Neat Pad (Offline)
├── Domotz: 2 agents, avg 847 Mbps down
└── IP Schedule: All compliant

**SEATTLE** (5 systems, 23 rooms)  
├── Q-SYS: 5 systems, 1 error, avg 32% memory
│   └── SEA-3619 All Hands: 1 persistent status issue
├── Zoom: All rooms online
├── Domotz: 3 agents, avg 923 Mbps down  
└── IP Schedule: All compliant
```

### Splunk Data Structure
```json
{
  "timestamp": "2025-10-21T10:00:00.000Z",
  "event": "av.daily.update",
  "data": {
    "zoomReports": [
      {
        "date": "2025-10-20",
        "meetings": 4683,
        "participants": 15906,
        "meeting_minutes": 552839
      }
    ],
    "zoomRoomDevices": [
      {
        "roomId": "gt5EbkOLTmad6VORf_W4mA",
        "roomName": "AV DEV 1",
        "devices": [
          {
            "id": "neat-NA12144002511",
            "device_type": "Scheduling Display",
            "app_version": "6.5.5 (3902)",
            "status": "Offline"
          }
        ]
      }
    ],
    "qsysMetrics": [
      {
        "system": "IRV-1250 zRetreat",
        "site": "IRV",
        "memory": {"usage": 28},
        "coreDiagnostics": {
          "processor": {"temperature": 45.2},
          "system": {"temperature": 38.1, "fan": {"1": {"speed": 2340}}}
        }
      }
    ],
    "qsysScriptEvents": [
      {
        "system": "SEA-3737 zRetreat",
        "component": "Disp_2", 
        "hasErrors": false,
        "hasStatusIssues": true,
        "restartSuccessful": true,
        "statusIssues": [...]
      }
    ],
    "qsysCores": [
      {
        "id": "37024",
        "name": "IRV-1250 zRetreat",
        "serial": "F9K-3Lb-4Tc",
        "version": "9.10.2.0-2310.013",
        "model": "Core 110f",
        "status": {
          "code": 2,
          "message": "Healthy"
        }
      }
    ]
  }
}
```

## Monitoring & Troubleshooting

### Common Issues & Solutions

#### Q-SYS Connection Failures
```bash
# Check network connectivity
npm run test:daily-update:slim

# Simulate outage handling
npm run test:daily-update:outages
```

#### Zoom API Rate Limiting
- Application implements 1-second delays between room device requests
- Monitor Zoom API usage in Zoom Marketplace dashboard
- Increase delays if rate limiting occurs

#### Slack Message Failures
```javascript
// Automatic fallback to test channel
try {
  await slack.sendMessage(report, productionChannel);
} catch (error) {
  await slack.sendMessage(`Error: ${error.message}`, testChannel);
}
```

#### Splunk Ingestion Issues
- Check HEC token validity and permissions
- Verify network connectivity to Splunk Cloud
- Monitor Splunk ingestion logs for parsing errors

### Performance Optimization

**Parallel Processing:**
```javascript
// Q-SYS metrics collection uses Promise.all for efficiency
const [metrics, memory, coreDiagnostics] = await Promise.all([
  qhttp.getSystemMetrics(),
  qhttp.getMemory(), 
  qrc.getCoreDiagnostics()
]);
```

**Rate Limiting:**
```javascript
// Zoom device collection with rate limiting
for (const room of rooms) {
  const devices = await this.getRoomDevices(room.id);
  await this._sleep(1000); // Prevent rate limiting
}
```

### Debugging & Development

#### Local Testing
```bash
# Test with verbose logging
DEBUG=* npm run test:daily-update

# Test specific components
npm run test:zoom
```

#### Data Inspection
```bash
# Examine collected data
cat .ignore/dailyData.json | jq '.sites.IRV.qsys'

# Check Splunk payload structure  
cat .ignore/splunkData.json | jq '.data.qsysMetrics[0]'
```

## Scheduled Execution

### Cron Configuration
```bash
# Daily execution at 8:00 AM Pacific Time
0 8 * * * cd /path/to/av-observe && npm run app:daily-update

# Splunk-only updates every 4 hours for analytics
0 */4 * * * cd /path/to/av-observe && npm run splunk-only
```

### GitLab CI/CD Pipeline
```yaml
daily-update:
  stage: deploy
  script:
    - npm install
    - npm run app:daily-update
  only:
    - schedules
  environment:
    name: production
```

## Analytics & Insights

### Splunk Queries

#### Zoom Device Version Analysis
```splunk
index="zgav_nonprod" sourcetype="AV" event="av.daily.update"
| head 1
| spath input=_raw path=data.zoomRoomDevices{} output=roomDevices
| mvexpand roomDevices
| spath input=roomDevices path=devices{} output=devices
| mvexpand devices
| spath input=devices path=app_version output=app_version
| spath input=devices path=room_name output=room_name
| stats count by room_name, app_version
| sort room_name
```

#### Q-SYS Memory Usage Trending
```splunk
index="zgav_nonprod" sourcetype="AV" event="av.daily.update"
| spath input=_raw path=data.qsysMetrics{} output=qMetrics
| mvexpand qMetrics
| spath input=qMetrics path=system output=system
| spath input=qMetrics path=memory.usage output=memory_usage
| timechart span=1d avg(memory_usage) by system
```

#### Q-SYS Core Firmware Analysis
```splunk
index="zgav_nonprod" sourcetype="AV" event="av.daily.update"
| head 1
| spath input=_raw path=data.qsysCores{} output=cores
| mvexpand cores
| spath input=cores path=name output=system_name
| spath input=cores path=firmware output=firmware_version
| spath input=cores path=model output=core_model
| spath input=cores path=serial output=serial_number
| spath input=cores path=status.message output=status
| table system_name, firmware_version, core_model, serial_number, status
| sort system_name
```

#### Script Error Analysis
```splunk
index="zgav_nonprod" sourcetype="AV" event="av.daily.update"
| spath input=_raw path=data.qsysScriptEvents{} output=scriptEvents
| mvexpand scriptEvents
| spath input=scriptEvents path=hasErrors output=hasErrors
| spath input=scriptEvents path=system output=system
| spath input=scriptEvents path=component output=component
| where hasErrors="true"
| stats count by system, component
```

## Contributing

### Development Guidelines
1. **Simplicity First**: Prefer clear, robust solutions over complex implementations
2. **Error Handling**: Comprehensive error handling with graceful degradation
3. **Logging**: Detailed logging for troubleshooting and monitoring
4. **Testing**: Always test in test mode before production deployment
5. **Documentation**: Update documentation for any workflow changes

### Adding New Integrations
1. Create module in `shared/modules/`
2. Add to data collection phase in `collectAllData()`
3. Include in site organization logic
4. Add to Slack report generation
5. Include in Splunk payload structure
6. Update configuration documentation

---

This application represents the culmination of months of iterative development, incorporating lessons learned from managing AV infrastructure at scale. It balances comprehensive monitoring with operational efficiency, providing both immediate actionable insights and long-term analytical capabilities.
