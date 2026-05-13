#!/usr/bin/env node
import readline from 'readline';
import { execSync } from 'child_process';
import { 
    Zoom, QREM, Slack, Domotz, IpSchedule, Microsoft, NetworkValidator, QsysDiagnostics
} from '@av-observe/shared/modules/index.js';
import fs from 'fs';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Handle Ctrl+C gracefully
rl.on('SIGINT', () => {
    console.log('\n\nExiting...');
    rl.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n\nExiting...');
    rl.close();
    process.exit(0);
});

// =============================================================================
// TEST DEFINITIONS - Maps to services in app.js collectAllData()
// =============================================================================

const tests = {
    '1': { name: 'Run Sandbox (.ignore/sandbox.js)', fn: runSandbox },
    '2': { name: 'Zoom', fn: testZoom },
    '3': { name: 'Q-SYS Reflect', fn: testQsysReflect },
    '4': { name: 'Domotz', fn: testDomotz },
    '5': { name: 'IP Schedule', fn: testIpSchedule },
    '6': { name: 'Microsoft Calendar', fn: testMicrosoft },
    '7': { name: 'Network Validation', fn: testNetwork },
    '8': { name: 'Q-SYS Diagnostics (single core)', fn: testQsysDiagnostics },
    'z': { name: 'Zoom Webhook Endpoint', fn: testZoomWebhook },
    's': { name: 'Q-SYS Webhook Endpoint', fn: testQsysWebhook },
    'q': { name: 'Quit', fn: () => process.exit(0) }
};

// =============================================================================
// TEST FUNCTIONS
// =============================================================================

async function runSandbox() {
    console.log('Running sandbox...');
    try {
        execSync('node .ignore/sandbox.js', { stdio: 'inherit' });
    } catch (error) {
        console.log('Sandbox failed:', error.message);
    }
}

async function testZoom() {
    console.log('\nTesting Zoom...');
    const zoom = new Zoom();
    
    try {
        const data = await zoom.dailyUpdate();
        const roomCount = Object.values(data.slackRooms || {}).reduce((sum, rooms) => sum + rooms.length, 0);
        const siteCount = Object.keys(data.slackRooms || {}).length;
        
        console.log(`\nResults:`);
        console.log(`  Sites: ${siteCount}`);
        console.log(`  Rooms with issues: ${roomCount}`);
        console.log(`  Room devices: ${data.roomDevices?.length || 0}`);
        
        // Show issues by site
        if (roomCount > 0) {
            console.log(`\nIssues by site:`);
            Object.entries(data.slackRooms || {}).forEach(([site, rooms]) => {
                if (rooms.length > 0) {
                    console.log(`  ${site}: ${rooms.length} rooms`);
                    rooms.forEach(room => {
                        console.log(`    - ${room.name}: ${room.issues?.join(', ') || 'Unknown issue'}`);
                    });
                }
            });
        }
        
        // Save to file
        fs.writeFileSync('./test/zoom-output.json', JSON.stringify(data, null, 2));
        console.log(`\nSaved to: ./test/zoom-output.json`);
        
    } catch (error) {
        console.error('Failed:', error.message);
    }
}

async function testQsysReflect() {
    console.log('\nTesting Q-SYS Reflect...');
    const qrem = new QREM();
    
    try {
        const data = await qrem.dailyUpdate();
        const siteCount = Object.keys(data?.bySite || {}).length;
        const coreCount = data?.cores?.length || 0;
        
        // Count systems with issues
        let issueCount = 0;
        Object.values(data?.bySite || {}).forEach(systems => {
            Object.values(systems).forEach(system => {
                if (system.issues?.length > 0) issueCount++;
            });
        });
        
        console.log(`\nResults:`);
        console.log(`  Sites: ${siteCount}`);
        console.log(`  Total cores: ${coreCount}`);
        console.log(`  Systems with issues: ${issueCount}`);
        
        // Show issues
        if (issueCount > 0) {
            console.log(`\nIssues:`);
            Object.entries(data?.bySite || {}).forEach(([site, systems]) => {
                Object.entries(systems).forEach(([name, system]) => {
                    if (system.issues?.length > 0) {
                        console.log(`  ${site} / ${name}:`);
                        system.issues.forEach(issue => {
                            console.log(`    - ${issue.name}: ${issue.message}`);
                        });
                    }
                });
            });
        }
        
        // Save to file
        fs.writeFileSync('./test/qsys-output.json', JSON.stringify(data, null, 2));
        console.log(`\nSaved to: ./test/qsys-output.json`);
        
    } catch (error) {
        console.error('Failed:', error.message);
    }
}

async function testDomotz() {
    console.log('\nTesting Domotz...');
    const domotz = new Domotz();
    
    try {
        const data = await domotz.dailyUpdate();
        const siteCount = Object.keys(data.agentsBySite || {}).length;
        const agentCount = data.agentsWithSpeedTests?.length || 0;
        
        // Count slow agents
        let slowCount = 0;
        Object.values(data.agentsBySite || {}).forEach(agents => {
            agents.forEach(agent => {
                if (parseFloat(agent.downloadAvg) < 40 || parseFloat(agent.uploadAvg) < 40) {
                    slowCount++;
                }
            });
        });
        
        console.log(`\nResults:`);
        console.log(`  Sites: ${siteCount}`);
        console.log(`  Agents with speed tests: ${agentCount}`);
        console.log(`  Slow agents (<40 Mbps): ${slowCount}`);
        
        // Show slow agents
        if (slowCount > 0) {
            console.log(`\nSlow agents:`);
            Object.entries(data.agentsBySite || {}).forEach(([site, agents]) => {
                agents.forEach(agent => {
                    const dl = parseFloat(agent.downloadAvg);
                    const ul = parseFloat(agent.uploadAvg);
                    if (dl < 40 || ul < 40) {
                        console.log(`  ${site} / ${agent.name}: ${dl} Mbps down, ${ul} Mbps up`);
                    }
                });
            });
        }
        
        // Save to file
        fs.writeFileSync('./test/domotz-output.json', JSON.stringify(data, null, 2));
        console.log(`\nSaved to: ./test/domotz-output.json`);
        
    } catch (error) {
        console.error('Failed:', error.message);
    }
}

async function testIpSchedule() {
    console.log('\nTesting IP Schedule...');
    const ip = new IpSchedule();
    
    try {
        const data = await ip.dailyUpdate({ ignoreMissingArp: true });
        const siteCount = Object.keys(data || {}).length;
        const issueCount = Object.values(data || {}).flat().length;
        
        console.log(`\nResults:`);
        console.log(`  Sites: ${siteCount}`);
        console.log(`  Total issues: ${issueCount}`);
        
        // Show issues by site
        if (issueCount > 0) {
            console.log(`\nIssues by site:`);
            Object.entries(data || {}).forEach(([site, issues]) => {
                if (issues.length > 0) {
                    console.log(`  ${site}: ${issues.length} issues`);
                }
            });
        }
        
        // Save to file
        fs.writeFileSync('./test/ipschedule-output.json', JSON.stringify(data, null, 2));
        console.log(`\nSaved to: ./test/ipschedule-output.json`);
        
    } catch (error) {
        console.error('Failed:', error.message);
    }
}

async function testMicrosoft() {
    console.log('\nTesting Microsoft Calendar...');
    const zoom = new Zoom();
    const ms = new Microsoft();
    
    try {
        const data = await zoom.getMsCalendarBySite(ms);
        const siteCount = Object.keys(data.bySite || {}).length;
        const roomCount = data.allRooms?.length || 0;
        
        // Count rooms with meetings today
        let meetingRoomCount = 0;
        let totalMeetings = 0;
        Object.values(data.bySite || {}).forEach(rooms => {
            rooms.forEach(room => {
                if (room.hasEventsToday) {
                    meetingRoomCount++;
                    totalMeetings += room.events?.length || 0;
                }
            });
        });
        
        console.log(`\nResults:`);
        console.log(`  Sites: ${siteCount}`);
        console.log(`  Total rooms: ${roomCount}`);
        console.log(`  Rooms with meetings today: ${meetingRoomCount}`);
        console.log(`  Total meetings today: ${totalMeetings}`);
        
        // Show meetings by site
        if (meetingRoomCount > 0) {
            console.log(`\nMeetings by site:`);
            Object.entries(data.bySite || {}).forEach(([site, rooms]) => {
                const siteRooms = rooms.filter(r => r.hasEventsToday);
                const siteMeetings = siteRooms.reduce((sum, r) => sum + (r.events?.length || 0), 0);
                if (siteMeetings > 0) {
                    console.log(`  ${site}: ${siteRooms.length} rooms, ${siteMeetings} meetings`);
                }
            });
        }
        
        // Save to file
        fs.writeFileSync('./test/microsoft-output.json', JSON.stringify(data, null, 2));
        console.log(`\nSaved to: ./test/microsoft-output.json`);
        
    } catch (error) {
        console.error('Failed:', error.message);
    }
}

async function testNetwork() {
    console.log('\nTesting Network Validation...');
    const networkValidator = new NetworkValidator();
    
    try {
        const results = await networkValidator.validateCriticalInfrastructure();
        const total = results.length;
        const failed = results.filter(r => !r.reachable).length;
        const slow = results.filter(r => r.reachable && !r.success).length;
        const ok = total - failed - slow;
        
        console.log(`\nResults:`);
        console.log(`  Total targets: ${total}`);
        console.log(`  OK: ${ok}`);
        console.log(`  Slow: ${slow}`);
        console.log(`  Failed: ${failed}`);
        
        // Show failed connections
        if (failed > 0) {
            console.log(`\nFailed connections:`);
            results.filter(r => !r.reachable).forEach(conn => {
                console.log(`  - ${conn.description}: ${conn.error || 'No response'}`);
            });
        }
        
        // Show slow connections
        if (slow > 0) {
            console.log(`\nSlow connections:`);
            results.filter(r => r.reachable && !r.success).forEach(conn => {
                console.log(`  - ${conn.description}: ${conn.avgTime}ms`);
            });
        }
        
        // Save to file
        fs.writeFileSync('./test/network-output.json', JSON.stringify(results, null, 2));
        console.log(`\nSaved to: ./test/network-output.json`);
        
    } catch (error) {
        console.error('Failed:', error.message);
    }
}

async function testQsysDiagnostics() {
    console.log('\nTesting Q-SYS Diagnostics (single core)...');
    
    return new Promise((resolve) => {
        rl.question('Enter IP address or hostname: ', async (input) => {
            if (!input.trim()) {
                console.log('No IP provided, skipping.');
                resolve();
                return;
            }
            
            const ip = input.trim();
            const systemName = `Test-${ip}`;
            
            console.log(`\nConnecting to ${ip}...`);
            const diag = new QsysDiagnostics(ip, systemName);
            
            try {
                const result = await diag.dailyUpdate('TEST');
                
                console.log(`\nResults for ${ip}:`);
                console.log(`  Memory: ${result.slackMetrics.memory?.usage ?? 'N/A'}%`);
                console.log(`  Metrics available: ${!result.slackMetrics.metricsUnavailable}`);
                console.log(`  Script errors: ${result.slackMetrics.scriptErrors?.length || 0}`);
                console.log(`  Script status issues: ${result.slackMetrics.scriptStatuses?.length || 0}`);
                
                if (result.splunkMetrics.coreDiagnostics) {
                    console.log(`\nCore diagnostics:`);
                    Object.entries(result.splunkMetrics.coreDiagnostics).forEach(([key, value]) => {
                        console.log(`  ${key}: ${value}`);
                    });
                }
                
                if (result.splunkMetrics.metrics) {
                    console.log(`\nSystem metrics:`);
                    if (result.splunkMetrics.metrics.cpu) {
                        const cpu = result.splunkMetrics.metrics.cpu;
                        console.log(`  CPU: ${cpu.user}% user, ${cpu.system}% sys, ${cpu.idle}% idle`);
                    }
                    if (result.splunkMetrics.metrics.loadAverage) {
                        const load = result.splunkMetrics.metrics.loadAverage;
                        console.log(`  Load: ${load.oneMin} / ${load.fiveMin} / ${load.fifteenMin}`);
                    }
                }
                
                // Save to file
                fs.writeFileSync('./test/qsys-diag-output.json', JSON.stringify(result, null, 2));
                console.log(`\nSaved to: ./test/qsys-diag-output.json`);
                
            } catch (error) {
                console.error('Failed:', error.message);
                if (error.response?.data) {
                    console.error('Response:', error.response.data);
                }
            }
            resolve();
        });
    });
}

// =============================================================================
// WEBHOOK TESTS (kept for external use)
// =============================================================================

async function testZoomWebhook() {
    console.log('\nTesting Zoom Webhook Endpoint...');
    
    return new Promise((resolve) => {
        rl.question('Alert type - (o)ffline or (O)nline? [o]: ', async (input) => {
            try {
                const config = JSON.parse(fs.readFileSync('./shared/config.json', 'utf8'));
                const endpoint = config.aws?.apiEndpoint;
                
                if (!endpoint) {
                    console.log('ERROR: AWS endpoint not found in config.json');
                    resolve();
                    return;
                }
                
                const isOnline = input.toLowerCase() === 'online' || input === 'O';
                const issue = isOnline ? 'Zoom room is online' : 'Zoom room is offline';
                const alertKind = isOnline ? 2 : 1;
                
                const payload = {
                    event: 'zoomroom.alert',
                    payload: {
                        account_id: 'test-account',
                        object: {
                            room_name: 'Test Room',
                            issue: issue,
                            alert_kind: alertKind,
                            id: `test-${Date.now()}`,
                            alert_type: 3
                        }
                    },
                    event_ts: Date.now()
                };
                
                console.log(`\nSending ${issue} to ${endpoint}...`);
                
                const start = Date.now();
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: AbortSignal.timeout(30000)
                });
                const elapsed = Date.now() - start;
                
                console.log(`\nResponse: ${response.status} ${response.statusText} (${elapsed}ms)`);
                const body = await response.text();
                if (body) console.log(`Body: ${body}`);
                
            } catch (error) {
                console.error('Failed:', error.message);
            }
            resolve();
        });
    });
}

async function testQsysWebhook() {
    console.log('\nTesting Q-SYS Webhook Endpoint...');
    
    return new Promise((resolve) => {
        rl.question('Alert type - (e)rror, (w)arning, or (i)nfo? [e]: ', async (input) => {
            try {
                const config = JSON.parse(fs.readFileSync('./shared/config.json', 'utf8'));
                const endpoint = config.aws?.apiEndpoint;
                
                if (!endpoint) {
                    console.log('ERROR: AWS endpoint not found in config.json');
                    resolve();
                    return;
                }
                
                let severity = 'error';
                let message = 'Test error alert';
                if (input.toLowerCase() === 'w') {
                    severity = 'warning';
                    message = 'Test warning alert';
                } else if (input.toLowerCase() === 'i') {
                    severity = 'info';
                    message = 'Test info alert';
                }
                
                const payload = {
                    user: { id: 8339 },
                    alert: {
                        id: Date.now(),
                        created: new Date().toISOString(),
                        severity: severity,
                        type: 'item',
                        siteName: 'TEST',
                        systemName: 'Test System',
                        message: message
                    }
                };
                
                console.log(`\nSending ${severity} alert to ${endpoint}...`);
                
                const start = Date.now();
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: AbortSignal.timeout(30000)
                });
                const elapsed = Date.now() - start;
                
                console.log(`\nResponse: ${response.status} ${response.statusText} (${elapsed}ms)`);
                const body = await response.text();
                if (body) console.log(`Body: ${body}`);
                
            } catch (error) {
                console.error('Failed:', error.message);
            }
            resolve();
        });
    });
}

// =============================================================================
// MENU
// =============================================================================

function showMenu() {
    console.log('\n' + '='.repeat(40));
    console.log('AV Observe Test Runner');
    console.log('='.repeat(40));
    Object.entries(tests).forEach(([key, test]) => {
        console.log(`  ${key}. ${test.name}`);
    });
    console.log('='.repeat(40));
}

function askQuestion() {
    rl.question('\nSelect test: ', async (answer) => {
        const test = tests[answer.toLowerCase()];
        
        if (test) {
            try {
                await test.fn();
            } catch (error) {
                console.error('Test failed:', error.message);
            }
        } else {
            console.log('Invalid selection');
        }
        
        if (answer.toLowerCase() !== 'q') {
            showMenu();
            askQuestion();
        }
    });
}

showMenu();
askQuestion();
