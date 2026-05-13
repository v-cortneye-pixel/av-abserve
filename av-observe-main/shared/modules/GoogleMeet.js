import { google } from 'googleapis';
import { getCredentials } from '../credentials.js';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./shared/config.json', 'utf8'));

/**
 * GoogleMeet - Monitor Google Meet hardware devices via Admin SDK
 * 
 * Google Meet hardware runs on ChromeOS, so device monitoring uses the
 * Admin SDK Directory API (chromeosdevices endpoint).
 * 
 * Key metrics available:
 * - Device status (ACTIVE, INACTIVE, DISABLED)
 * - Last sync time (device health indicator)
 * - OS/firmware versions
 * - CPU temperature and utilization
 * - Disk space usage
 * - Network connectivity (IP addresses)
 */
class GoogleMeet {
	constructor() {
		const credentials = getCredentials('googleMeet');
		this.credentials = credentials;
		this.admin = null;
		this.customerId = credentials.customerId || 'my_customer';
	}

	async connect() {
		if (this.admin) return this.admin;

		const auth = new google.auth.JWT(
			this.credentials.clientEmail,
			null,
			this.credentials.privateKey,
			[
				'https://www.googleapis.com/auth/admin.directory.device.chromeos.readonly'
			],
			this.credentials.adminEmail
		);

		await auth.authorize();
		this.admin = google.admin({ version: 'directory_v1', auth });
		return this.admin;
	}

	/**
	 * List all ChromeOS devices (includes Meet hardware)
	 * @param {Object} options - Query options
	 * @param {string} options.query - Filter query (e.g., "status:ACTIVE")
	 * @param {string} options.orgUnitPath - Filter by organizational unit
	 * @param {number} options.maxResults - Max results per page (default 100)
	 */
	async listDevices(options = {}) {
		await this.connect();

		const allDevices = [];
		let pageToken = null;

		do {
			const response = await this.admin.chromeosdevices.list({
				customerId: this.customerId,
				maxResults: options.maxResults || 100,
				query: options.query,
				orgUnitPath: options.orgUnitPath,
				pageToken,
				projection: 'FULL'
			});

			if (response.data.chromeosdevices) {
				allDevices.push(...response.data.chromeosdevices);
			}

			pageToken = response.data.nextPageToken;
		} while (pageToken);

		return allDevices;
	}

	/**
	 * Get a specific device by ID
	 */
	async getDevice(deviceId) {
		await this.connect();

		const response = await this.admin.chromeosdevices.get({
			customerId: this.customerId,
			deviceId,
			projection: 'FULL'
		});

		return response.data;
	}

	/**
	 * Get devices filtered to likely Meet hardware
	 * Meet hardware typically has specific model patterns or org unit paths
	 */
	async getMeetDevices(options = {}) {
		const devices = await this.listDevices(options);
		
		// Filter for Meet hardware based on model or org unit
		// Adjust these filters based on your organization's setup
		const meetFilters = config.googleMeet?.filters || {};
		
		return devices.filter(device => {
			// Include all if no filters defined
			if (!meetFilters.models && !meetFilters.orgUnits) {
				return true;
			}

			// Filter by model if specified
			if (meetFilters.models) {
				const modelMatch = meetFilters.models.some(m => 
					device.model?.toLowerCase().includes(m.toLowerCase())
				);
				if (modelMatch) return true;
			}

			// Filter by org unit if specified
			if (meetFilters.orgUnits) {
				const ouMatch = meetFilters.orgUnits.some(ou => 
					device.orgUnitPath?.includes(ou)
				);
				if (ouMatch) return true;
			}

			return false;
		});
	}

	/**
	 * Check device health based on status and last sync
	 */
	assessDeviceHealth(device) {
		const issues = [];
		const now = new Date();

		// Check device status
		if (device.status !== 'ACTIVE') {
			issues.push({
				type: 'status',
				severity: device.status === 'DISABLED' ? 'critical' : 'warning',
				message: `Device status: ${device.status}`
			});
		}

		// Check last sync time (warn if > 24 hours, critical if > 72 hours)
		if (device.lastSync) {
			const lastSync = new Date(device.lastSync);
			const hoursSinceSync = (now - lastSync) / (1000 * 60 * 60);

			if (hoursSinceSync > 72) {
				issues.push({
					type: 'sync',
					severity: 'critical',
					message: `No sync for ${Math.round(hoursSinceSync)} hours`
				});
			} else if (hoursSinceSync > 24) {
				issues.push({
					type: 'sync',
					severity: 'warning',
					message: `Last sync ${Math.round(hoursSinceSync)} hours ago`
				});
			}
		}

		// Check CPU temperature if available
		const cpuReports = device.cpuStatusReports || [];
		if (cpuReports.length > 0) {
			const latestReport = cpuReports[cpuReports.length - 1];
			const temps = latestReport.cpuTemperatureInfo || [];
			
			for (const temp of temps) {
				if (temp.temperature > 90) {
					issues.push({
						type: 'temperature',
						severity: 'critical',
						message: `CPU temp critical: ${temp.temperature}°C (${temp.label})`
					});
				} else if (temp.temperature > 80) {
					issues.push({
						type: 'temperature',
						severity: 'warning',
						message: `CPU temp high: ${temp.temperature}°C (${temp.label})`
					});
				}
			}
		}

		// Check disk space if available
		if (device.diskSpaceUsage) {
			const capacity = parseInt(device.diskSpaceUsage.capacityBytes) || 0;
			const used = parseInt(device.diskSpaceUsage.usedBytes) || 0;
			const usagePercent = capacity > 0 ? (used / capacity) * 100 : 0;

			if (usagePercent > 90) {
				issues.push({
					type: 'disk',
					severity: 'critical',
					message: `Disk usage critical: ${Math.round(usagePercent)}%`
				});
			} else if (usagePercent > 80) {
				issues.push({
					type: 'disk',
					severity: 'warning',
					message: `Disk usage high: ${Math.round(usagePercent)}%`
				});
			}
		}

		return {
			healthy: issues.length === 0,
			status: issues.length === 0 ? 'ok' : 
				issues.some(i => i.severity === 'critical') ? 'critical' : 'warning',
			issues
		};
	}

	/**
	 * Process device into standardized format for reporting
	 */
	processDevice(device) {
		const health = this.assessDeviceHealth(device);
		const lastSync = device.lastSync ? new Date(device.lastSync) : null;
		
		// Extract latest CPU info
		const cpuReports = device.cpuStatusReports || [];
		const latestCpu = cpuReports.length > 0 ? cpuReports[cpuReports.length - 1] : null;
		
		// Extract network info
		const networks = device.lastKnownNetwork || [];
		const primaryNetwork = networks[0] || {};

		return {
			id: device.deviceId,
			serialNumber: device.serialNumber,
			name: device.annotatedAssetId || device.serialNumber,
			location: device.annotatedLocation || 'Unknown',
			model: device.model,
			status: device.status,
			health: health.status,
			issues: health.issues,
			osVersion: device.osVersion,
			firmwareVersion: device.firmwareVersion,
			lastSync: lastSync?.toISOString(),
			lastSyncRelative: lastSync ? this.#getRelativeTime(lastSync) : 'Never',
			ipAddress: primaryNetwork.ipAddress,
			orgUnit: device.orgUnitPath,
			metrics: {
				cpuTemp: latestCpu?.cpuTemperatureInfo?.[0]?.temperature,
				cpuUtilization: latestCpu?.cpuUtilizationPercentageInfo?.[0],
				diskUsagePercent: this.#calculateDiskUsage(device.diskSpaceUsage),
				ramTotal: device.systemRamTotal
			}
		};
	}

	#calculateDiskUsage(diskSpace) {
		if (!diskSpace) return null;
		const capacity = parseInt(diskSpace.capacityBytes) || 0;
		const used = parseInt(diskSpace.usedBytes) || 0;
		return capacity > 0 ? Math.round((used / capacity) * 100) : null;
	}

	#getRelativeTime(date) {
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.round(diffMs / 60000);
		const diffHours = Math.round(diffMs / 3600000);
		const diffDays = Math.round(diffMs / 86400000);

		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		return `${diffDays}d ago`;
	}

	/**
	 * Group devices by site/location
	 * Uses orgUnitPath or annotatedLocation to determine site
	 */
	groupDevicesBySite(devices) {
		const bySite = {};
		const siteMapping = config.googleMeet?.siteMapping || {};

		for (const device of devices) {
			// Determine site from org unit path or location annotation
			let site = 'Unknown';
			
			// Try org unit path first
			if (device.orgUnitPath) {
				for (const [siteName, ouPath] of Object.entries(siteMapping)) {
					if (device.orgUnitPath.includes(ouPath)) {
						site = siteName;
						break;
					}
				}
			}

			// Fall back to location annotation
			if (site === 'Unknown' && device.annotatedLocation) {
				// Extract site code from location (e.g., "SEA-3619" -> "SEA")
				const match = device.annotatedLocation.match(/^([A-Z]{3})/);
				if (match) {
					site = match[1];
				}
			}

			if (!bySite[site]) {
				bySite[site] = [];
			}
			bySite[site].push(device);
		}

		return bySite;
	}

	/**
	 * Get devices with issues (not healthy)
	 */
	async getDevicesWithIssues() {
		const devices = await this.getMeetDevices();
		const processed = devices.map(d => this.processDevice(d));
		return processed.filter(d => d.health !== 'ok');
	}

	/**
	 * Daily update - collect all device data for reporting
	 */
	async dailyUpdate() {
		try {
			const devices = await this.getMeetDevices();
			const processedDevices = devices.map(d => this.processDevice(d));
			const bySite = this.groupDevicesBySite(processedDevices);

			// Separate devices by health status
			const devicesWithIssues = processedDevices.filter(d => d.health !== 'ok');
			const offlineDevices = processedDevices.filter(d => d.status !== 'ACTIVE');

			// Build Slack-ready data
			const slackRooms = {};
			for (const [site, siteDevices] of Object.entries(bySite)) {
				const issueDevices = siteDevices.filter(d => d.health !== 'ok');
				if (issueDevices.length > 0) {
					slackRooms[site] = issueDevices;
				}
			}

			return {
				// For Slack reporting (matches Zoom format)
				slackRooms,
				
				// All devices grouped by site
				devicesBySite: bySite,
				
				// Summary counts
				summary: {
					total: processedDevices.length,
					healthy: processedDevices.filter(d => d.health === 'ok').length,
					warning: processedDevices.filter(d => d.health === 'warning').length,
					critical: processedDevices.filter(d => d.health === 'critical').length,
					offline: offlineDevices.length
				},

				// For Splunk
				splunkData: processedDevices.map(d => ({
					...d,
					timestamp: new Date().toISOString()
				}))
			};
		} catch (error) {
			console.error('GoogleMeet dailyUpdate failed:', error.message);
			return {
				slackRooms: {},
				devicesBySite: {},
				summary: { total: 0, healthy: 0, warning: 0, critical: 0, offline: 0 },
				splunkData: [],
				error: error.message
			};
		}
	}
}

export default GoogleMeet;
