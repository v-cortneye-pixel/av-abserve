import { 
	Zoom, QREM, Slack, Splunk, Domotz, IpSchedule, NetworkValidator, QsysDiagnostics
} from '@av-observe/shared/modules/index.js';
import { generateReport, generateSiteZoomReport } from './generateSlackReport.js';
import ErrorSync from './ErrorSync.js';
import fs from 'fs';

// Initialize service clients once
const slack = new Slack();
const zoom = new Zoom();
const qrem = new QREM();
const domotz = new Domotz();
const ipSchedule = new IpSchedule();

// ============================================================================
// DATA COLLECTION FUNCTIONS - Each returns { bySite, splunkData }
// ============================================================================

async function collectZoomData() {	
	try {
		const data = await zoom.dailyUpdate();
		return {
			bySite: data.slackRooms || {},
			splunkData: {
				zoomReports: data.dailyReportData || [],
				zoomRoomDevices: data.roomDevices || []
			}
		};
	} catch (error) {
		console.error('  Failed to get Zoom data:', error.message);
		return { bySite: {}, splunkData: { zoomReports: [], zoomRoomDevices: [] } };
	}
}

async function collectQsysReflectData() {
	try {
		const data = await qrem.dailyUpdate();
		return {
			bySite: data?.bySite || {},
			splunkData: { qsysCores: data?.cores || [] }
		};
	} catch (error) {
		console.error('  Failed to get Q-SYS data:', error.message);
		return { bySite: {}, splunkData: { qsysCores: [] } };
	}
}

async function collectDomotzData() {
	try {
		const data = await domotz.dailyUpdate();
		return {
			bySite: data.agentsBySite || {},
			splunkData: { domotzAgents: data.agentsWithSpeedTests || [] }
		};
	} catch (error) {
		console.error('  Failed to get Domotz data:', error.message);
		return { bySite: {}, splunkData: { domotzAgents: [] } };
	}
}

async function collectIpScheduleData() {
	try {
		const data = await ipSchedule.dailyUpdate({ ignoreMissingArp: true });
		return {
			bySite: data || {},
			splunkData: { ipScheduleValidation: Object.values(data || {}).flat() }
		};
	} catch (error) {
		console.error('  Failed to get IP Schedule data:', error.message);
		return { bySite: {}, splunkData: { ipScheduleValidation: [] } };
	}
}

// ============================================================================
// MAIN DATA COLLECTION - Runs all collectors in parallel
// ============================================================================

async function collectAllData() {
	console.log('Collecting data from all services...');
	
	// Run all cloud API calls in parallel
	const [
		zoomResult, 
		qsysResult, 
		domotzResult, 
		ipResult
	] = await Promise.all([
		collectZoomData(),
		collectQsysReflectData(),
		collectDomotzData(),
		collectIpScheduleData()
	]);

	// Build the dailyData structure
	const dailyData = {
		sites: {},
		splunkData: {
			...zoomResult.splunkData,
			...qsysResult.splunkData,
			...domotzResult.splunkData,
			...ipResult.splunkData,
			qsysMetrics: [],
			qsysScriptEvents: []
		}
	};

	// Combine all sites from all sources
	const allSites = new Set([
		...Object.keys(zoomResult.bySite),
		...Object.keys(qsysResult.bySite),
		...Object.keys(domotzResult.bySite),
		...Object.keys(ipResult.bySite)
	]);

	// Organize data by site
	for (const site of allSites) {
		dailyData.sites[site] = {
			qsys: [],
			zoom: zoomResult.bySite[site] || [],
			domotz: domotzResult.bySite[site] || [],
			ipSchedule: ipResult.bySite[site] || []
		};

		// Process Q-SYS systems for this site (direct-to-server metrics)
		if (qsysResult.bySite[site]) {
			await processQsysSiteMetrics(site, qsysResult.bySite[site], dailyData);
		}
	}

	console.log(`Data collection complete: ${allSites.size} sites processed`);
	return dailyData;
}

// ============================================================================
// Q-SYS DIRECT METRICS - Connects to each core for detailed diagnostics
// ============================================================================

async function processQsysSiteMetrics(site, qsysSystems, dailyData) {
	console.log(`  Processing Q-SYS metrics for ${site}...`);
	
	for (const [systemName, systemInfo] of Object.entries(qsysSystems)) {
		const systemData = {
			name: systemName,
			ip: systemInfo.ip,
			status: systemInfo.issues ? 'error' : 'ok',
			issues: systemInfo.issues || []
		};

		// Get detailed metrics if IP available AND core is online
		const isCoreOffline = systemInfo.issues?.some(i => i.isCoreOffline);
		if (systemInfo.ip && !isCoreOffline) {
			try {
				const qsysDiag = new QsysDiagnostics(systemInfo.ip, systemName);
				const { splunkMetrics, splunkScriptEvents, slackMetrics } = await qsysDiag.dailyUpdate(site);
				
				dailyData.splunkData.qsysMetrics.push(splunkMetrics);
				dailyData.splunkData.qsysScriptEvents.push(...splunkScriptEvents);
				systemData.metrics = slackMetrics;
			} catch (error) {
				console.error(`    Failed to get metrics for ${systemName}: ${error.message}`);
			}
		} else if (!systemInfo.ip) {
			console.log(`    ${systemName}: No IP address available`);
		}

		dailyData.sites[site].qsys.push(systemData);
	}
}

async function updateSplunk(dailyData) {
	const splunk = new Splunk();
	
	const payload = {
		timestamp: new Date().toISOString(),		
		event: 'av.daily.update',
		data: {
			zoomReports: dailyData.splunkData.zoomReports || [],
			zoomRoomDevices: dailyData.splunkData.zoomRoomDevices || [],
			domotzAgents: dailyData.splunkData.domotzAgents || [],
			ipScheduleValidation: dailyData.splunkData.ipScheduleValidation || [],
			qsysMetrics: dailyData.splunkData.qsysMetrics || [],
			qsysScriptEvents: dailyData.splunkData.qsysScriptEvents || [],
			qsysCores: dailyData.splunkData.qsysCores || [],
			networkValidation: dailyData.networkValidation?.splunkData || []
		}
	};
	
	try {
		const result = await splunk.push(payload, 'zgav_nonprod', 'av.daily.update');
		
		if (result.success) {
			return [{
				name: 'Daily Update',
				total: 1,
				successful: 1,
				status: 'success'
			}];
		} else {
			return [{
				name: 'Daily Update',
				total: 1,
				successful: 0,
				status: 'error',
				error: result.error || 'Unknown error'
			}];
		}
		
	} catch (error) {
		console.error('Failed to push payload to Splunk:', error.message);
		return [{
			name: 'Daily Update',
			total: 1,
			successful: 0,
			status: 'error',
			error: error.message
		}];
	}
}

async function saveDailyDataFiles(dailyData, report, slackChannel) {
	// Determine data directory based on environment
	const isCI = process.env.CI || process.env.GITLAB_CI;
	const dataDir = isCI ? './.data' : './.ignore';
	
	// Create data directory if it doesn't exist (for CI environment)
	if (isCI) {
		try {
			if (!fs.existsSync(dataDir)) {
				fs.mkdirSync(dataDir, { recursive: true });
			}
		} catch (error) {
			console.error(`Failed to create data directory ${dataDir}:`, error.message);
			return;
		}
	}

	// Save daily data to file
	try {
		fs.writeFileSync(`${dataDir}/dailyData.json`, JSON.stringify(dailyData, null, 2));
	} catch (error) {
		console.error('Failed to save daily data file:', error.message);
	}

	// Save Slack message to file for review
	try {
		const slackData = `Timestamp: ${new Date().toISOString()}\nChannel: ${slackChannel}\n\n--- Message Content ---\n${report}`;
		fs.writeFileSync(`${dataDir}/slackData.txt`, slackData);
	} catch (error) {
		console.error('Failed to save Slack data file:', error.message);
	}

	// Save Splunk payload to file for search query development (matches actual Splunk structure)
	try {
		const splunkPayload = {
			timestamp: new Date().toISOString(),
			event: 'av.daily.update',
			data: {
				zoomReports: dailyData.splunkData.zoomReports || [],
				zoomRoomDevices: dailyData.splunkData.zoomRoomDevices || [],
				domotzAgents: dailyData.splunkData.domotzAgents || [],
				ipScheduleValidation: dailyData.splunkData.ipScheduleValidation || [],
				qsysMetrics: dailyData.splunkData.qsysMetrics || [],
				qsysScriptEvents: dailyData.splunkData.qsysScriptEvents || [],
				qsysCores: dailyData.splunkData.qsysCores || [],
				networkValidation: dailyData.networkValidation?.splunkData || []
			}
		};
		fs.writeFileSync(`${dataDir}/splunkData.json`, JSON.stringify(splunkPayload, null, 2));
		
	} catch (error) {
		console.error('Failed to save Splunk data files:', error.message);
	}

	// Save data output file (always)
	await saveDataOutput(dailyData);
}

async function saveDataOutput(dailyData) {
	const isCI = process.env.CI || process.env.GITLAB_CI;
	const dataDir = isCI ? './.data' : './.ignore';
	const outputFile = `${dataDir}/data-output.json`;
	const timestamp = new Date().toISOString();
	
	try {
		// Ensure directory exists
		if (!fs.existsSync(dataDir)) {
			fs.mkdirSync(dataDir, { recursive: true });
		}
		
		const dataWithTimestamp = {
			lastUpdated: timestamp,
			...dailyData
		};
		
		fs.writeFileSync(outputFile, JSON.stringify(dataWithTimestamp, null, 2));
		console.log(`Data output saved successfully: ${outputFile}`);
		
	} catch (error) {
		console.error(`Failed to save data output: ${error.message}`);
	}
}

async function processSplunkUpdates(dailyData) {
	console.log('Updating Splunk with collected data...');
	const splunkResults = await updateSplunk(dailyData);
	

	
	// Report Splunk results
	const totalPayloads = splunkResults.length;
	const successfulPayloads = splunkResults.filter(r => r.status === 'success').length;
	const partialPayloads = splunkResults.filter(r => r.status === 'partial').length;
	const failedPayloads = splunkResults.filter(r => r.status === 'error').length;
	
	console.log(`Splunk updates completed: ${successfulPayloads}/${totalPayloads} successful${failedPayloads > 0 ? `, ${failedPayloads} failed` : ''}${partialPayloads > 0 ? `, ${partialPayloads} partial` : ''}`);
	
	// Log details for failures only
	if (failedPayloads > 0 || partialPayloads > 0) {
		splunkResults.filter(r => r.status === 'error' || r.status === 'partial').forEach(result => {
			console.log(`   ${result.name}: ${result.successful}/${result.total} items${result.error ? ` (${result.error})` : ''}`);
		});
	}
	
	return splunkResults;
}

async function sendSiteSpecificAlerts(dailyData) {
	console.log('Sending site-specific alerts...');
	const siteAlertPromises = [];
	
	for (const [site, data] of Object.entries(dailyData.sites)) {
		let siteReport = '';
		
		// Add site-specific greeting header
		siteReport += `Good Morning, ${site}! Here is your daily AV update.\n\n`;
		siteReport += `*Quick Reference:* <https://docs.google.com/spreadsheets/d/1h57WezGBw0MSdFIZmpaV7zZc330Fla7wunTy8N5vlXQ|Common AV Errors>\n\n`;
		siteReport += `${'-'.repeat(50)}\n\n`;
		
		// Generate Zoom issues report or no-issues message
		const zoomReport = generateSiteZoomReport(site, data.zoom);
		if (zoomReport) {
			siteReport += zoomReport;
		} else if (data.zoom && data.zoom.length === 0) {
			siteReport += `:white_check_mark: *${site} Office - All Zoom Rooms Operating Normally*\n\nAll Zoom rooms in your office are functioning properly with no issues detected.\n\n`;
		}
		
		// Send report if there's content
		if (siteReport) {
			const targetChannel = process.env.mode === "testing" 
				? slack.testSiteChannelId 
				: slack.siteChannelIds[site];
			if (targetChannel) {
				console.log(`Sending ${site} alerts to channel`);
				siteAlertPromises.push(slack.sendMessage(siteReport, targetChannel));
			} else {
				console.warn(`No channel configured for site: ${site}`);
			}
		}
	}
	
	if (siteAlertPromises.length > 0) {
		await Promise.all(siteAlertPromises);
		console.log('Site-specific alerts sent successfully');
	}
}

async function trackErrorTypes(dailyData) {
	const isCI = process.env.CI || process.env.GITLAB_CI;
	const dataDir = isCI ? './.data' : './.ignore';
	const errorSync = new ErrorSync();
	
	// Process all sites for Q-SYS and Zoom errors only
	Object.values(dailyData.sites).forEach(data => {
		// Q-SYS Script Status Issues (generic)
		data.qsys.forEach(system => {
			if (system.metrics?.scriptStatuses?.length > 0) {
				errorSync.addErrorType('qsys_script_status', 'Q-SYS', 'Script Status Issue', 
					'Component status error - persisted after restart attempt', dataDir);
			}
			
			if (system.metrics?.scriptErrors?.length > 0) {
				errorSync.addErrorType('qsys_script_error', 'Q-SYS', 'Script Error', 
					'Component script error - persisted after restart attempt', dataDir);
			}
		});
		
		// Zoom Room Issues - process each individual issue from the API
		data.zoom.forEach(room => {
			room.issues.forEach(issue => {
				// Use the exact issue string as both key and sample error
				errorSync.addErrorType(issue, 'Zoom', 'Room Issue', issue, dataDir);
			});
		});
	});
	
	// Sync with Google Sheets (pulls manual updates and pushes new error types)
	await errorSync.syncErrorTypes(dataDir);
}

async function collectNetworkValidation() {
	
	console.log('  Validating network connectivity...');
	try {
		const networkValidator = new NetworkValidator();
		const results = await networkValidator.validateCriticalInfrastructure();
		
		// Log any issues found
		const failedConnections = results.filter(r => !r.reachable);
		const slowConnections = results.filter(r => r.reachable && !r.success && r.avgTime > 100);
		
		if (failedConnections.length > 0) {
			console.log(`  Network issues: ${failedConnections.length} failed connections`);
		}
		if (slowConnections.length > 0) {
			console.log(`  Performance issues: ${slowConnections.length} slow connections`);
		}
		
		return {
			results,
			slackReport: networkValidator.generateSlackReport(results),
			splunkData: networkValidator.generateSplunkData(results)
		};
	} catch (error) {
		console.error('  Failed network validation:', error.message);
		return { results: [], slackReport: '', splunkData: [] };
	}
}

async function main() {
	try {
		console.log('Starting daily AV update...');
		
		// 1. Validate network connectivity first
		const networkValidation = await collectNetworkValidation();
		
		// 2. Collect all service data in parallel
		const dailyData = await collectAllData();
		dailyData.networkValidation = networkValidation;
		
		// 2. Generate and send Slack report
		console.log('Generating daily report...');
		const report = generateReport(dailyData);
		const slackChannel = process.env.mode === 'testing' ? slack.testChannelId : slack.channelId;
		await slack.sendMessage(report, slackChannel);
		console.log('Slack message sent');
		
		// 3. Save data files
		await saveDailyDataFiles(dailyData, report, slackChannel);
		
		// 4. Update Splunk (skip in test mode)
		if (process.env.mode !== 'testing') {
			await processSplunkUpdates(dailyData);
		} else {
			console.log('Test mode - skipping Splunk updates');
		}
		
		// 5. Track error types and send site-specific alerts
		await trackErrorTypes(dailyData);
		await sendSiteSpecificAlerts(dailyData);
		
		console.log('Daily AV update completed successfully!');
		
	} catch (error) {
		console.error('Error in daily update:', error);
		try {
			await slack.sendMessage(`:warning: Error in daily update: ${error.message}`, slack.testChannelId);
		} catch (slackError) {
			console.error('Failed to send error to Slack:', slackError);
		}
		process.exit(1);
	}
}

main();


