import Juniper from './Juniper.js';
import Google from './Google.js';
import fs from 'fs';

class IpSchedule {
	constructor(switchConfigData = null) {
		if (!switchConfigData) {
			switchConfigData = JSON.parse(fs.readFileSync('./shared/config.json', 'utf-8')).ipSheet;
		}
		this.google = new Google();
		this.switchConfigData = switchConfigData;
	}

	async loadIpSchedule(config) {
		const pushToGoogle = [];
		// Use GatewayIp in GitLab CI environments, Host for local development
		const isCI = process.env.CI || process.env.GITLAB_CI;
		const switchAddress = isCI ? config.GatewayIp : config.Host;
		
		// Build Juniper options with timeout settings from config
		const juniperOptions = { useDirectConnection: isCI };
		if (config.handshakeTimeout) juniperOptions.handshakeTimeout = config.handshakeTimeout;
		if (config.connectionTimeout) juniperOptions.connectionTimeout = config.connectionTimeout;
		if (config.streamTimeout) juniperOptions.streamTimeout = config.streamTimeout;
		
		const juniper = new Juniper(switchAddress, juniperOptions);
		const ports = await juniper.switchPorts();
		const lastRow = String(ports.length + 1);
		for (const host of ports) {
			pushToGoogle.push([
				host.Switch,
				host.Port,
				host.MAC_Address,
				host.IP_Address,
				host.Name == host.IP_Address ? "" : host.Name
			]);
		};
		const pushSuccessful = await this.google.updateData(this.switchConfigData.spreadsheetId, `${config.Tab}!A2:E${lastRow}`, pushToGoogle);
		if (!pushSuccessful) throw new Error(`error pushing to google`, pushSuccessful);		
	}

	async loadAllIpSchedules() {
		for (const config of this.switchConfigData.tabs) {
			try {
				await this.loadIpSchedule(config);
			} catch(e) {
				console.log(e)
			}
		};
	}

	findConfigByTab(tab) {
		for (const config of this.switchConfigData.tabs) {
			if (config.Tab.includes(tab)) return config;
		};
		return false
	}

	async validateIpSchedule(config, options = {}) {

		//pull switch data, hostname or GW depends on environment
		const isCI = process.env.CI || process.env.GITLAB_CI;
		const switchAddress = isCI ? config.GatewayIp : config.Host;
		
		let switchData;
		try {
			// Build Juniper options with timeout settings from config
			const juniperOptions = { useDirectConnection: isCI };
			if (config.handshakeTimeout) juniperOptions.handshakeTimeout = config.handshakeTimeout;
			if (config.connectionTimeout) juniperOptions.connectionTimeout = config.connectionTimeout;
			if (config.streamTimeout) juniperOptions.streamTimeout = config.streamTimeout;
			
			const ports = await new Juniper(switchAddress, juniperOptions).switchPorts();
			switchData = ports.map(port => ({
				switch: port.Switch,
				port: port.Port,
				mac: port.MAC_Address,
				ip: port.IP_Address
			}));
		} catch (error) {
			// Re-throw SSH errors so they can be caught by validateAllIpSchedules
			throw new Error(`SSH error accessing ${switchAddress}: ${error.message}`);
		}

		//pull google sheet data
		const rawSheetData = await this.google.getData(this.switchConfigData.spreadsheetId, `${config.Tab}!A:E`);
		const sheetData = rawSheetData.values
			.slice(1)
			.filter(entry => !isNaN(Number(entry[0])))
			.map(entry => ({
				switch: Number(entry[0]),
				port: Number(entry[1]),
				mac: entry[2] ? entry[2].trim() : '',
				ip: entry[3] ? entry[3].trim() : ''
		}));

		// Add "Last updated" timestamp to sheet
		try {
			// Check if there's already a "Last updated" row
			let lastUpdatedRowIndex = -1;
			for (let i = 0; i < rawSheetData.values.length; i++) {
				if (rawSheetData.values[i][0] && rawSheetData.values[i][0].toString().startsWith('Last updated:')) {
					lastUpdatedRowIndex = i + 1; // +1 because sheets are 1-indexed
					break;
				}
			}
			
			// If no existing "Last updated" row found, append to end
			const targetRow = lastUpdatedRowIndex > 0 ? lastUpdatedRowIndex : rawSheetData.values.length + 1;
			
			await this.google.updateData(
				this.switchConfigData.spreadsheetId, 
				`${config.Tab}!A${targetRow}`, 
				[[ `Last updated: ${new Date().toLocaleDateString()}` ]]
			);
		} catch (error) {
			console.error(`Failed to write timestamp to ${config.Tab}:`, error.message);
		}

		// Simple validation: find entries that don't match between switch and sheet
		let switchOnly = switchData.filter(switchEntry => 
			!sheetData.some(sheetEntry => JSON.stringify(sheetEntry) === JSON.stringify(switchEntry))
		);
		
		let sheetOnly = sheetData.filter(sheetEntry => 
			!switchData.some(switchEntry => JSON.stringify(switchEntry) === JSON.stringify(sheetEntry))
		);
		
		// If ignoreMissingArp option is enabled, handle blank IP cases
		if (options.ignoreMissingArp) {
			// Filter out switch entries with blank IP (ARP missing)
			switchOnly = switchOnly.filter(entry => entry.ip !== '');
			
			// For sheet entries, ignore if there's a matching switch entry with same port/switch/mac but blank IP
			sheetOnly = sheetOnly.filter(sheetEntry => {
				const hasMatchingMacEntry = switchData.some(switchEntry => 
					switchEntry.switch === sheetEntry.switch &&
					switchEntry.port === sheetEntry.port &&
					switchEntry.mac === sheetEntry.mac &&
					switchEntry.ip === '' // Switch has blank IP (ARP missing)
				);
				return !hasMatchingMacEntry; // Keep only if no matching MAC entry found
			});
		}
		
		// Return validation results
		if (switchOnly.length > 0 || sheetOnly.length > 0) {
			console.log(`found validation errors for ${config.Tab}`);
			return {
				validated: false,
				switch: switchOnly,
				sheet: sheetOnly,
				config
			};
		} else {
			return {
				validated: true,
				config 
			};
		}
	}

	async validateAllIpSchedules(options = {}) {
		let rtn = [];
		console.log(`Validating IP schedules for ${this.switchConfigData.tabs.length} switches...`);
		
		for (const config of this.switchConfigData.tabs) {
			const isCI = process.env.CI || process.env.GITLAB_CI;
			const target = isCI ? config.GatewayIp : config.Host;
			console.log(`  Checking ${config.Tab} (${target})...`);
			
			try {
				const result = await this.validateIpSchedule(config, options);
				console.log(`  ${config.Tab}: ${result.validated ? 'OK' : `${result.switch.length + result.sheet.length} discrepancies`}`);
				rtn.push(result);
			} catch(e) {
				console.log(`  ${config.Tab}: FAILED - ${e.message}`);
				
				// Add SSH error to the validation result instead of skipping
				rtn.push({
					validated: false,
					switchMismatches: 0,
					sheetMismatches: 0, 
					switch: [],
					sheet: [],
					config,
					sshError: e.message
				});
			}
		};
		
		console.log(`IP schedule validation complete`);
		return rtn;
	}

	async dailyUpdate(options = {}) {
		// Get all validation results
		const validationResults = await this.validateAllIpSchedules(options);
		
		// Organize by site, only including sites with validation issues
		const siteReport = {};
		
		validationResults.forEach(result => {
			// Only include validation failures in the daily report
			if (!result.validated) {
				const site = result.config.Tab.split('-')[0].toUpperCase();
				
				if (!siteReport[site]) {
					siteReport[site] = [];
				}
				
				// Add structured data for the daily report 
				const reportData = {
					tab: result.config.Tab,
					host: result.config.Host,
					validated: result.validated,
					switchMismatches: result.switchMismatches || result.switch.length,
					sheetMismatches: result.sheetMismatches || result.sheet.length,
					switchOnlyEntries: result.switch,
					sheetOnlyEntries: result.sheet
				};
				
				// Include SSH error if present
				if (result.sshError) {
					reportData.sshError = result.sshError;
				}
				
				siteReport[site].push(reportData);
			}
		});
		
		return siteReport;
	}
}

export default IpSchedule;