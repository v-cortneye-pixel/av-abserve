import Juniper from './Juniper.js';
import Google from './Google.js';
import ouiData from 'oui-data' with { type: 'json' };
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./shared/config.json', 'utf-8'));
const isCI = process.env.CI || process.env.GITLAB_CI;

class IpSchedule {
	constructor(switchConfigData = null) {
		this.google = new Google();
		this.switchConfigData = switchConfigData || config.ipSheet;
	}

	/**
	 * Get switch address based on environment (hostname locally, gateway IP in CI)
	 */
	getSwitchAddress(tabConfig) {
		return isCI ? tabConfig.GatewayIp : tabConfig.Host;
	}

	/**
	 * Build Juniper connection options from tab config
	 */
	buildJuniperOptions(tabConfig) {
		const options = { useDirectConnection: isCI };
		if (tabConfig.handshakeTimeout) options.handshakeTimeout = tabConfig.handshakeTimeout;
		if (tabConfig.connectionTimeout) options.connectionTimeout = tabConfig.connectionTimeout;
		if (tabConfig.streamTimeout) options.streamTimeout = tabConfig.streamTimeout;
		return options;
	}

	/**
	 * Find config by tab name
	 */
	findConfigByTab(tab) {
		return this.switchConfigData.tabs.find(c => c.Tab.includes(tab)) || null;
	}

	/**
	 * Normalize port data to consistent format
	 */
	normalizePortData(port) {
		return {
			switch: Number(port.Switch ?? port.switch),
			port: Number(port.Port ?? port.port),
			mac: (port.MAC_Address ?? port.mac ?? '').trim().toLowerCase(),
			ip: (port.IP_Address ?? port.ip ?? '').trim()
		};
	}

	/**
	 * Check if entry has a valid numeric switch value
	 * Entries with non-numeric switch (e.g., "N/A", empty) are ignored
	 */
	hasValidSwitch(entry) {
		return typeof entry.switch === 'number' && !isNaN(entry.switch);
	}

	/**
	 * Create a key for matching entries (switch + port + mac)
	 */
	entryKey(entry) {
		return `${entry.switch}:${entry.port}:${entry.mac}`;
	}

	/**
	 * Lookup manufacturer from MAC address using OUI database
	 * Returns short manufacturer name (first line only)
	 */
	lookupManufacturer(mac) {
		if (!mac) return '';
		try {
			// Extract OUI (first 6 hex chars) from MAC, removing separators
			const oui = mac.replace(/[:\-\.]/g, '').substring(0, 6).toUpperCase();
			const result = ouiData[oui];
			if (!result) return '';
			// OUI data has multi-line string, take first line (company name)
			return result.split('\n')[0] || '';
		} catch {
			return '';
		}
	}

	/**
	 * Load switch data and push to Google Sheet
	 */
	async loadIpSchedule(tabConfig) {
		const switchAddress = this.getSwitchAddress(tabConfig);
		const juniper = new Juniper(switchAddress, this.buildJuniperOptions(tabConfig));
		const ports = await juniper.switchPorts();
		
		const rows = ports.map(port => [
			port.Switch,
			port.Port,
			port.MAC_Address,
			port.IP_Address,
			port.Name === port.IP_Address ? '' : port.Name,
			this.lookupManufacturer(port.MAC_Address)
		]);
		
		const range = `${tabConfig.Tab}!A2:F${ports.length + 1}`;
		const success = await this.google.updateData(this.switchConfigData.spreadsheetId, range, rows);
		if (!success) throw new Error(`Failed to push to Google Sheet: ${tabConfig.Tab}`);
	}

	async loadAllIpSchedules() {
		for (const tabConfig of this.switchConfigData.tabs) {
			try {
				await this.loadIpSchedule(tabConfig);
			} catch (e) {
				console.log(`Failed to load ${tabConfig.Tab}:`, e.message);
			}
		}
	}

	/**
	 * Fetch switch port data via SSH
	 */
	async fetchSwitchData(tabConfig) {
		const switchAddress = this.getSwitchAddress(tabConfig);
		const juniper = new Juniper(switchAddress, this.buildJuniperOptions(tabConfig));
		const ports = await juniper.switchPorts();
		return ports.map(p => this.normalizePortData(p));
	}

	/**
	 * Fetch sheet data from Google Sheets
	 */
	async fetchSheetData(tabConfig) {
		const raw = await this.google.getData(this.switchConfigData.spreadsheetId, `${tabConfig.Tab}!A:E`);
		
		return raw.values
			.slice(1) // Skip header
			.filter(row => !isNaN(Number(row[0]))) // Only rows with numeric switch ID
			.map(row => ({
				switch: Number(row[0]),
				port: Number(row[1]),
				mac: (row[2] || '').trim().toLowerCase(),
				ip: (row[3] || '').trim()
			}));
	}

	/**
	 * Update "Last updated" timestamp on sheet
	 */
	async updateTimestamp(tabConfig) {
		try {
			const raw = await this.google.getData(this.switchConfigData.spreadsheetId, `${tabConfig.Tab}!A:A`);
			const existingRow = raw.values?.findIndex(row => row[0]?.toString().startsWith('Last updated:'));
			const targetRow = existingRow >= 0 ? existingRow + 1 : (raw.values?.length || 0) + 1;
			
			await this.google.updateData(
				this.switchConfigData.spreadsheetId,
				`${tabConfig.Tab}!A${targetRow}`,
				[[`Last updated: ${new Date().toLocaleDateString()}`]]
			);
		} catch (error) {
			console.error(`Failed to update timestamp for ${tabConfig.Tab}:`, error.message);
		}
	}

	/**
	 * Compare switch and sheet data, categorizing discrepancies
	 * Returns: { mismatches, switchOnly, sheetOnly }
	 */
	compareData(switchData, sheetData, options = {}) {
		// Filter out entries with non-numeric switch values (e.g., "N/A")
		const validSwitchData = switchData.filter(e => this.hasValidSwitch(e));
		const validSheetData = sheetData.filter(e => this.hasValidSwitch(e));
		
		const mismatches = [];   // Same device (switch/port/mac) but different IP
		const switchOnly = [];   // On switch but not in sheet
		const sheetOnly = [];    // In sheet but not on switch
		
		// Build lookup by switch/port/mac (without IP)
		const sheetByKey = new Map();
		for (const entry of validSheetData) {
			const key = this.entryKey(entry);
			// Handle multiple entries with same key (append to array)
			if (!sheetByKey.has(key)) {
				sheetByKey.set(key, []);
			}
			sheetByKey.get(key).push(entry);
		}
		
		const matchedSheetKeys = new Set();
		
		// Check each switch entry
		for (const switchEntry of validSwitchData) {
			const key = this.entryKey(switchEntry);
			const sheetEntries = sheetByKey.get(key) || [];
			
			// Look for exact match (same IP)
			const exactMatch = sheetEntries.find(s => s.ip === switchEntry.ip);
			
			if (exactMatch) {
				// Perfect match - no discrepancy
				matchedSheetKeys.add(key + ':' + exactMatch.ip);
				continue;
			}
			
			// No exact match - check if there's a device with same switch/port/mac but different IP
			if (sheetEntries.length > 0) {
				// Same device exists in sheet but with different IP
				const sheetEntry = sheetEntries[0];
				
				// Skip if switch has blank IP and we're ignoring missing ARP
				if (options.ignoreMissingArp && switchEntry.ip === '') {
					matchedSheetKeys.add(key + ':' + sheetEntry.ip);
					continue;
				}
				
				mismatches.push({
					switch: switchEntry.switch,
					port: switchEntry.port,
					mac: switchEntry.mac,
					switchIp: switchEntry.ip,
					sheetIp: sheetEntry.ip
				});
				matchedSheetKeys.add(key + ':' + sheetEntry.ip);
			} else {
				// Not in sheet at all
				if (!options.ignoreMissingArp || switchEntry.ip !== '') {
					switchOnly.push(switchEntry);
				}
			}
		}
		
		// Check for sheet entries not on switch
		for (const sheetEntry of validSheetData) {
			const matchKey = this.entryKey(sheetEntry) + ':' + sheetEntry.ip;
			if (!matchedSheetKeys.has(matchKey)) {
				// Check if we already recorded this as a mismatch
				const isMismatch = mismatches.some(m => 
					m.switch === sheetEntry.switch && 
					m.port === sheetEntry.port && 
					m.mac === sheetEntry.mac
				);
				
				if (!isMismatch) {
					sheetOnly.push(sheetEntry);
				}
			}
		}
		
		return { mismatches, switchOnly, sheetOnly };
	}

	/**
	 * Generate TSV rows for a single entry (matches Google Sheet format)
	 * Format: Switch	Port	MAC Address	IP Address	Hostname	Manufacturer
	 */
	toTsvRow(entry, hostname = '') {
		const manufacturer = this.lookupManufacturer(entry.mac);
		const ip = entry.switchIp ?? entry.ip ?? '';
		return `${entry.switch}\t${entry.port}\t${entry.mac}\t${ip}\t${hostname}\t${manufacturer}`;
	}

	/**
	 * Generate TSV arrays for discrepancies
	 * Returns { mismatches: string[], switchOnly: string[], sheetOnly: string[] }
	 */
	generateTsv(discrepancies) {
		return {
			mismatches: (discrepancies.mismatches || []).map(m => this.toTsvRow(m)),
			switchOnly: (discrepancies.switchOnly || []).map(e => this.toTsvRow(e)),
			sheetOnly: (discrepancies.sheetOnly || []).map(e => this.toTsvRow(e))
		};
	}

	/**
	 * Validate a single IP schedule tab
	 */
	async validateIpSchedule(tabConfig, options = { ignoreMissingArp: true }) {
		// Handle tab lookup if string or object with tab property
		if (typeof tabConfig === 'string') {
			tabConfig = this.findConfigByTab(tabConfig);
		} else if (tabConfig?.tab) {
			tabConfig = this.findConfigByTab(tabConfig.tab);
		} else if (options.tab) {
			tabConfig = this.findConfigByTab(options.tab);
		}
		
		if (!tabConfig) {
			throw new Error('Tab configuration not found');
		}

		// Fetch data from both sources
		let switchData;
		try {
			switchData = await this.fetchSwitchData(tabConfig);
		} catch (error) {
			throw new Error(`SSH error accessing ${this.getSwitchAddress(tabConfig)}: ${error.message}`);
		}
		
		const sheetData = await this.fetchSheetData(tabConfig);
		
		// Update timestamp
		await this.updateTimestamp(tabConfig);
		
		// Compare and categorize discrepancies
		const { mismatches, switchOnly, sheetOnly } = this.compareData(switchData, sheetData, options);
		
		const hasIssues = mismatches.length > 0 || switchOnly.length > 0 || sheetOnly.length > 0;
		
		if (hasIssues) {
			console.log(`Validation errors for ${tabConfig.Tab}: ${mismatches.length} mismatches, ${switchOnly.length} switch-only, ${sheetOnly.length} sheet-only`);
		}
		
		// Generate TSV for easy copy/paste to Google Sheets
		const tsv = this.generateTsv({ mismatches, switchOnly, sheetOnly });
		
		return {
			validated: !hasIssues,
			mismatches,
			switchOnly,
			sheetOnly,
			tsv,
			config: tabConfig
		};
	}

	/**
	 * Validate all IP schedule tabs
	 */
	async validateAllIpSchedules(options = { ignoreMissingArp: true }) {
		const results = [];
		
		for (const tabConfig of this.switchConfigData.tabs) {
			try {
				console.log(`  validating ${tabConfig.Tab} (${this.getSwitchAddress(tabConfig)})...`);
				const result = await this.validateIpSchedule(tabConfig, options);
				results.push(result);
			} catch (e) {
				console.log(`  ${tabConfig.Tab}: FAILED - ${e.message}`);
				results.push({
					validated: false,
					mismatches: [],
					switchOnly: [],
					sheetOnly: [],
					config: tabConfig,
					sshError: e.message
				});
			}
		}
		
		return results;
	}

	/**
	 * Daily update - returns validation issues organized by site
	 */
	async dailyUpdate(options = {}) {
		console.log(`validating all IP Schedules...`);
		const results = await this.validateAllIpSchedules(options);
		const siteReport = {};
		
		for (const result of results) {
			if (!result.validated) {
				const site = result.config.Tab.split('-')[0].toUpperCase();
				
				if (!siteReport[site]) {
					siteReport[site] = [];
				}
				
				siteReport[site].push({
					tab: result.config.Tab,
					host: result.config.Host,
					validated: false,
					mismatches: result.mismatches,
					switchOnly: result.switchOnly,
					sheetOnly: result.sheetOnly,
					tsv: result.tsv,
					sshError: result.sshError || null
				});
			}
		}
		
		return siteReport;
	}
}

export default IpSchedule;
