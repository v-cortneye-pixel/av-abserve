import fs from 'fs';

// Load config once at module load
const config = JSON.parse(fs.readFileSync('./shared/config.json', 'utf8'));

/**
 * Generate the main daily Slack report for all sites
 */
export function generateReport(dailyData) {
	let report = `Good Morning! Here is your daily AV update!\n\n*Quick Links:*\n• <https://reflect.qsc.com|Q-Sys Reflect Dashboard>\n• <https://zillowgroup.zoom.us/location?roomStatus=1|Zoom Offline Rooms>\n• <https://portal.domotz.com/webapp/inventoryDashboard?tab=devices|Domotz Portal>\n• <https://zillowgroup.splunkcloud.com/en-US/app/zgav/zgav_non-prod|Splunk Dashboard>\n• <https://docs.google.com/spreadsheets/d/1efvIfN1IBDRdrE0u9jkAHjUefbzwfaptvF8rHNCPIE8|IP Schedule>\n• <https://docs.google.com/spreadsheets/d/1h57WezGBw0MSdFIZmpaV7zZc330Fla7wunTy8N5vlXQ|Common AV Errors>`;

	if (process.env.slim) {
		report += `\n\n:gitlab-status-warning: This update ran in _Slim_ mode: many services and functions were ignored`;
	}

	if (process.env.mode === "testing") {
		report += '\n\n:testing: This update ran in _Testing_ mode';
	}

	Object.entries(dailyData.sites).forEach(([site, data]) => {
		report += generateSiteSection(site, data);
	});

	// Add network validation issues if any
	if (dailyData.networkValidation?.slackReport) {
		report += `\n${dailyData.networkValidation.slackReport}\n`;
	}

	return report;
}

/**
 * Generate Slack report section for a single site
 */
function generateSiteSection(site, data) {
	let section = '';
	
	// Count issues
	const systemsWithIssues = data.qsys.filter(sys => 
		sys.status !== "ok" ||
		(sys.metrics?.memory?.usage && sys.metrics.memory.usage > 80) ||
		(sys.metrics?.scriptErrors?.length > 0) ||
		(sys.metrics?.scriptStatuses?.length > 0)
	);
	
	const domotzWithIssues = data.domotz.filter(agent => 
		agent.status !== 'ONLINE' || 
		parseFloat(agent.downloadAvg) < 40 || 
		parseFloat(agent.uploadAvg) < 40
	);
	
	const qsysIssueCount = systemsWithIssues.length;
	const zoomIssueCount = data.zoom.length;
	const domotzIssueCount = domotzWithIssues.length;
	const ipScheduleIssueCount = data.ipSchedule.length;
	const hasIssues = qsysIssueCount > 0 || zoomIssueCount > 0 || domotzIssueCount > 0 || ipScheduleIssueCount > 0;
	
	// Site header
	let issueHeader = hasIssues
		? ` :warning: *${site}* has ${qsysIssueCount + zoomIssueCount + domotzIssueCount + ipScheduleIssueCount} issues`
		: `:white_check_mark: *${site}* has no issues!`;
	if (hasIssues) {
		issueHeader += `\n   • ${qsysIssueCount} Q-SYS issues\n   • ${zoomIssueCount} Zoom issues\n   • ${domotzIssueCount} Domotz issues\n   • ${ipScheduleIssueCount} IP Schedule issues`;
	}
	section += `\n${'-'.repeat(50)}\n${issueHeader}\n`;

	// Domotz section
	section += generateDomotzSection(data.domotz, domotzWithIssues);
	
	// Q-SYS section
	section += generateQsysSection(data.qsys);
	
	// Zoom section
	section += generateZoomSection(data.zoom);
	
	// IP Schedule section
	section += generateIpScheduleSection(data.ipSchedule);

	section += '\n';
	return section;
}

/**
 * Generate Domotz speed test section
 */
function generateDomotzSection(domotzData, domotzWithIssues) {
	let section = '';
	
	if (domotzWithIssues.length > 0) {
		section += '\n*Domotz Speed Tests:*\n';
		domotzWithIssues.forEach(agent => {
			let emoji = ':red_circle:';
			let issues = [];
			
			if (agent.status !== 'ONLINE') {
				issues.push(`Status: ${agent.status}`);
			}
			
			const downloadSpeed = parseFloat(agent.downloadAvg);
			const uploadSpeed = parseFloat(agent.uploadAvg);
			
			if (downloadSpeed < 40) {
				issues.push(`Low Download: ${agent.downloadAvg} Mbps`);
			}
			if (uploadSpeed < 40) {
				issues.push(`Low Upload: ${agent.uploadAvg} Mbps`);
			}
			
			if (agent.status === 'ONLINE' && (downloadSpeed < 40 || uploadSpeed < 40)) {
				emoji = ':warning:';
			}
			
			section += `${emoji} ${agent.name}\n`;
			issues.forEach(issue => {
				section += `   • ${issue}\n`;
			});
		});
	} else if (domotzData.length > 0) {
		section += '\n:white_check_mark: *Network speed tests completed - no issues detected*\n';
	}
	
	return section;
}

/**
 * Generate Q-SYS systems section
 */
function generateQsysSection(qsysData) {
	if (qsysData.length === 0) return '';
	
	let section = '\n*Q-SYS Systems:*\n';
	
	qsysData.forEach(system => {
		const memoryUsage = system.metrics?.memory?.usage;
		const metricsUnavailable = system.metrics?.metricsUnavailable;
		let emoji = ':large_green_circle:';
		let alerts = [];
		
		if (system.status === 'error') {
			emoji = ':red_circle:';
		} else if (metricsUnavailable) {
			emoji = ':warning:';
			alerts.push('*Metrics Unavailable*');
		} else if (memoryUsage >= 90) {
			emoji = ':rotating_light:';
			alerts.push('<!channel> *CRITICAL MEMORY USAGE*');
		} else if (memoryUsage >= 80) {
			emoji = ':warning:';
			alerts.push('*High Memory Usage*');
		}

		if (system.metrics?.scriptStatuses?.length > 0) {
			if (emoji === ':large_green_circle:') emoji = ':warning:';
			const statusCount = system.metrics.scriptStatuses.length;
			alerts.push(`*${statusCount} Script Status Issue${statusCount > 1 ? 's' : ''}*`);
		}

		if (system.metrics?.scriptErrors?.length > 0) {
			if (emoji === ':large_green_circle:') emoji = ':warning:';
			else if (emoji === ':warning:') emoji = ':red_circle:';
			const errorCount = system.metrics.scriptErrors.length;
			alerts.push(`*${errorCount} Script Error${errorCount > 1 ? 's' : ''}*`);
		}

		const hyperlink = `<http://${system.ip}|${system.name}>`;
		const memoryDisplay = metricsUnavailable ? ' (N/A)' : (memoryUsage ? ` (${memoryUsage}%)` : '');
		const alertText = alerts.length > 0 ? ` ${alerts.join(', ')}` : '';
		
		section += `${emoji} ${hyperlink}${memoryDisplay}${alertText}\n`;
		
		// Peripheral issues
		if (system.status === 'error' && system.issues.length > 0) {
			const coreOfflineIssue = system.issues.find(issue => issue.name === 'Core' && issue.isCoreOffline);
			
			if (coreOfflineIssue) {
				section += `   *CORE OFFLINE FROM REFLECT CLOUD SERVERS*\n`;
				section += `   • Check network connectivity and Q-SYS Reflect service status\n`;
			} else {
				section += `   *Peripheral Issues:*\n`;
				system.issues.forEach(issue => {
					section += `   • *${issue.name}:* ${issue.message}\n`;
				});
			}
		}

		// Script status issues
		if (system.metrics?.scriptStatuses?.length > 0) {
			section += `   *Script Status Issues:*\n`;
			system.metrics.scriptStatuses.forEach(status => {
				section += `   • *${status.Component}:* ${status.String} (${status.Control})\n`;
			});
		}

		// Script errors
		if (system.metrics?.scriptErrors?.length > 0) {
			section += `   *Script Errors (persistent after restart):*\n`;
			system.metrics.scriptErrors.forEach(error => {
				section += `   • *${error.Component}:* ${error.Error || error.message || 'Unknown error'}\n`;
			});
		}

		if (system.status === 'error' || system.metrics?.scriptStatuses?.length > 0 || system.metrics?.scriptErrors?.length > 0) {
			section += '\n';
		}
	});
	
	return section;
}

/**
 * Generate Zoom room issues section
 */
function generateZoomSection(zoomData) {
	if (zoomData.length === 0) return '';
	
	let section = `\n*Zoom Room Issues:*\n`;
	zoomData.forEach(room => {
		let emoji = room.health === 'critical' ? ':red_circle:' : ':warning:';
		let statusInfo = room.status !== 'Available' ? ` (${room.status})` : '';
		section += `${emoji} *${room.name}*${statusInfo}\n`;
		section += `   • ${room.issues.join(', ')}\n`;
	});
	
	return section;
}

/**
 * Generate IP Schedule validation issues section
 * Uses TSV format for easy copy/paste to Google Sheets
 */
function generateIpScheduleSection(ipScheduleData) {
	if (ipScheduleData.length === 0) return '';
	
	let section = `\n*IP Schedule Validation Issues:*\n`;
	
	ipScheduleData.forEach(issue => {
		// SSH connection errors
		if (issue.sshError) {
			const severity = issue.sshError.includes('Timed out') ? ':red_circle:' : ':warning:';
			section += `${severity} *${issue.tab}* - SSH Connection Failed\n`;
			section += `   Device appears to be offline or unreachable\n`;
			section += `   SSH into \`${issue.host}.net.zillowgroup.net\` to examine\n\n`;
			return;
		}
		
		// Count total discrepancies
		const mismatches = issue.mismatches || [];
		const switchOnly = issue.switchOnly || [];
		const sheetOnly = issue.sheetOnly || [];
		const totalIssues = mismatches.length + switchOnly.length + sheetOnly.length;
		
		section += `:warning: *${issue.tab}* - ${totalIssues} discrepanc${totalIssues === 1 ? 'y' : 'ies'} detected\n`;
		
		// Build TSV output for copy/paste to Google Sheets (no header row)
		const tsvLines = [];
		
		// Use pre-generated TSV arrays if available, otherwise generate from raw data
		const tsvMismatches = issue.tsv?.mismatches || [];
		const tsvSwitchOnly = issue.tsv?.switchOnly || [];
		const tsvSheetOnly = issue.tsv?.sheetOnly || [];
		
		if (tsvMismatches.length > 0 || mismatches.length > 0) {
			tsvLines.push('--- MISMATCHES (update sheet with switch IP) ---');
			if (tsvMismatches.length > 0) {
				tsvLines.push(...tsvMismatches);
			} else {
				mismatches.forEach(m => {
					tsvLines.push(`${m.switch}\t${m.port}\t${m.mac}\t${m.switchIp}\t\t`);
				});
			}
		}
		
		if (tsvSwitchOnly.length > 0 || switchOnly.length > 0) {
			if (tsvLines.length > 0) tsvLines.push('');
			tsvLines.push('--- ON SWITCH, NOT IN SHEET (add to sheet) ---');
			if (tsvSwitchOnly.length > 0) {
				tsvLines.push(...tsvSwitchOnly);
			} else {
				switchOnly.forEach(e => {
					tsvLines.push(`${e.switch}\t${e.port}\t${e.mac}\t${e.ip}\t\t`);
				});
			}
		}
		
		if (tsvSheetOnly.length > 0 || sheetOnly.length > 0) {
			if (tsvLines.length > 0) tsvLines.push('');
			tsvLines.push('--- IN SHEET, NOT ON SWITCH (remove from sheet?) ---');
			if (tsvSheetOnly.length > 0) {
				tsvLines.push(...tsvSheetOnly);
			} else {
				sheetOnly.forEach(e => {
					tsvLines.push(`${e.switch}\t${e.port}\t${e.mac}\t${e.ip}\t\t`);
				});
			}
		}
		
		if (tsvLines.length > 0) {
			tsvLines.forEach(line => {
				// Skip header lines (start with ---), wrap data lines in inline code
				if (line.startsWith('---')) {
					section += `${line}\n`;
				} else if (line.trim()) {
					section += `\`${line}\`\n`;
				}
			});
		}
		
		section += `SSH into \`${issue.host}.net.zillowgroup.net\` to examine\n\n`;
	});
	
	return section;
}

/**
 * Generate site-specific Zoom issues report
 */
export function generateSiteZoomReport(site, zoomData) {
	if (!zoomData || zoomData.length === 0) {
		return null;
	}

	let report = `:warning: *${site} Office - Zoom Room Issues Detected*\n\n`;
	report += `The following Zoom rooms in your office are experiencing issues and may need attention:\n\n`;
	
	zoomData.forEach(room => {
		let emoji = room.health === 'critical' ? ':red_circle:' : ':warning:';
		let statusInfo = room.status !== 'Available' ? ` (${room.status})` : '';
		report += `${emoji} *${room.name}*${statusInfo}\n`;
		report += `   • ${room.issues.join(', ')}\n\n`;
	});
	
	return report;
}

