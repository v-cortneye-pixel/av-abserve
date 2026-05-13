import Core from 'ide_qsys';
import { default as QHTTP } from './qHttp.js';
import { getCredentials } from '../credentials.js';

/**
 * QsysDiagnostics - Encapsulates Q-SYS diagnostics and script management
 * 
 * Session Architecture:
 * - HTTP Session: connect() → authenticate → getMetrics/getMemory → disconnect()
 * - QRC Session: connect() → authenticate → getAllDiagnostics → disconnect()
 * 
 * This ensures:
 * - Only 2 HTTP authentications per core (instead of 2+ per metric call)
 * - Only 2 QRC connections per core (instead of 50+ per diagnostic call)
 * - Proper cleanup with disconnect() to free server resources
 */
class QsysDiagnostics {
	constructor(ip, systemName) {
		this.ip = ip;
		this.systemName = systemName;
		
		// Get QRC credentials
		const qrcCredentials = getCredentials('qrc');
		
		// Initialize session-based QRC connection
		this.qrcSession = new Core({
			ip: this.ip,
			username: qrcCredentials.username,
			pin: qrcCredentials.pin,
			systemName: this.systemName
		});
		
		// Initialize HTTP client for metrics
		this.qhttp = new QHTTP(this.ip);
	}

	/**
	 * Get core diagnostics (session-based, requires active connection)
	 * Retrieves: temperature, fan speed, grandmaster, processor temp, LAN speed
	 * Note: Requires qrcSession.connect() to be called first
	 */
	async getCoreDiagnostics() {
		const comps = await this.qrcSession.getComponents();
		
		for (let cmp of comps) {
			if (cmp.Type === "core_status") {
				const result = await this.qrcSession.getControls(cmp.ID);
				
				// Filter for the specific diagnostics we want
				const targetControls = [
					'system.temperature',
					'system.fan.1.speed', 
					'grandmaster.name',
					'processor.temperature',
					'lan.a.speed'
				];

				const diagnostics = {};
				
				for (let control of result.Controls) {
					if (targetControls.includes(control.Name)) {
						// Return string for text types, value for float types
						if (control.Type === 'Text') {
							diagnostics[control.Name] = control.String;
						} else if (control.Type === 'Float') {
							diagnostics[control.Name] = control.Value;
						}
					}
				}
				
				return diagnostics;
			}
		}
		
		console.log(`${this.systemName} did not find core diagnostics`);
		return null;
	}

	/**
	 * Get script errors (session-based, requires active connection)
	 * Note: Requires qrcSession.connect() to be called first
	 */
	async getScriptErrors(opt = {}) {
		let rtn = [];
		const allComponents = await this.qrcSession.getComponents();
		
		for (let cmp of allComponents) {
			if (!cmp.Type.includes('script') && !cmp.Type.includes("PLUGIN")) continue;
			if (opt.scriptName && cmp.Name != opt.scriptName) continue;

			const result = await this.qrcSession.getControls(cmp.ID);
			let errorObj = null;
			let errorLogs = null;

			for (let control of result.Controls) {
				if (control.Name === "script.error.count" && control.Value > 0) {
					errorObj = {
						Component: cmp.Name,
						Value: control.Value
					};
				}
				if (control.Name === "log.history") {
					errorLogs = control.String.length > 30 ? 
						`${control.String.substring(0, 30)} ...` : 
						control.String;
				}
			}

			if (errorObj) {
				errorObj.Details = errorLogs;
				rtn.push(errorObj);
			}
		}

		if (opt.scriptName) {
			if (rtn.length > 1) throw new Error(`returning multiple components for ${opt.scriptName}!`);
			return rtn[0];
		} else {
			return rtn;
		}
	}

	/**
	 * Get script statuses (session-based, requires active connection)
	 * Note: Requires qrcSession.connect() to be called first
	 */
	async getScriptStatuses(opt = {}) {
		let rtn = [];
		const allComponents = await this.qrcSession.getComponents();
		
		for (let cmp of allComponents) {
			if (!cmp.Type.includes('script') && !cmp.Type.includes("PLUGIN")) continue;
			if (opt.scriptName && cmp.Name != opt.scriptName) continue;

			const result = await this.qrcSession.getControls(cmp.ID);
			for (const control of result.Controls) {
				if (control.Type == "Status" && ![0,3].includes(control.Value)) {
					if (control.Name == "StreamStatus" || control.String.includes("Connected to Encoder")) continue;
					rtn.push({
						Component: cmp.Name,
						Control: control.Name,
						Value: control.Value,
						String: control.String
					});
				}
			}
		}
		return rtn;
	}

	/**
	 * Restart script (session-based, requires active connection)
	 * Note: Requires qrcSession.connect() to be called first
	 */
	async restartScript(componentName) {
		return await this.qrcSession.setComponent(componentName, 'reload', 1);
	}

	/**
	 * Process script issues with restart logic (session-based)
	 * Note: Requires qrcSession.connect() to be called first
	 */
	async processScriptIssues(systemName, site, ip) {
		const result = {
			scriptErrors: [],
			scriptStatuses: [],
			persistentErrors: [],
			persistentStatuses: [],
			splunkEvents: []
		};

		try {
			// Get initial errors and statuses using session
			const [initialErrors, initialStatuses] = await Promise.all([
				this.getScriptErrors().catch(e => { console.log(`${systemName}: getScriptErrors failed - ${e.message}`); return []; }),
				this.getScriptStatuses().catch(e => { console.log(`${systemName}: getScriptStatuses failed - ${e.message}`); return []; })
			]);

			result.scriptErrors = initialErrors;
			result.scriptStatuses = initialStatuses;

			// Get all unique components that have issues
			const componentsWithIssues = new Set([
				...initialErrors.map(e => e.Component),
				...initialStatuses.map(s => s.Component)
			]);

			if (componentsWithIssues.size === 0) {
				return result;
			}

			console.log(`Restarting ${componentsWithIssues.size} component(s) with issues for ${systemName}`);

			// Process each component
			for (const componentName of componentsWithIssues) {
				try {
					const restarted = await this.restartScript(componentName);

					if (restarted) {
						// Re-check both errors and statuses for this component
						const [remainingErrors, remainingStatuses] = await Promise.all([
							this.getScriptErrors({scriptName: componentName}).catch(() => null),
							this.getScriptStatuses({scriptName: componentName}).catch(() => [])
						]);

						// Handle persistent errors
						if (remainingErrors && remainingErrors.Component === componentName) {
							result.persistentErrors.push(remainingErrors);
							console.log(`Script error persists after restart for ${componentName} on ${systemName}`);
						} else {
							const hadError = initialErrors.some(e => e.Component === componentName);
							if (hadError) {
								console.log(`Script error resolved after restart for ${componentName} on ${systemName}`);
							}
						}

						// Handle persistent status issues
						if (remainingStatuses && remainingStatuses.length > 0) {
							result.persistentStatuses.push(...remainingStatuses);
							console.log(`Script status issue persists after restart for ${componentName} on ${systemName}`);
						} else {
							const hadStatus = initialStatuses.some(s => s.Component === componentName);
							if (hadStatus) {
								console.log(`Script status issue resolved after restart for ${componentName} on ${systemName}`);
							}
						}
					} else {
						// Restart failed, keep original issues
						const originalErrors = initialErrors.filter(e => e.Component === componentName);
						const originalStatuses = initialStatuses.filter(s => s.Component === componentName);
						result.persistentErrors.push(...originalErrors);
						result.persistentStatuses.push(...originalStatuses);
						console.error(`Failed to restart ${componentName} on ${systemName}`);
					}
				} catch (error) {
					// Restart attempt failed, keep original issues
					const originalErrors = initialErrors.filter(e => e.Component === componentName);
					const originalStatuses = initialStatuses.filter(s => s.Component === componentName);
					result.persistentErrors.push(...originalErrors);
					result.persistentStatuses.push(...originalStatuses);
					console.error(`Error restarting ${componentName} on ${systemName}:`, error.message);
				}

				// Create splunk event for this component
				result.splunkEvents.push({
					system: systemName,
					site,
					ip,
					component: componentName,
					hasErrors: initialErrors.some(e => e.Component === componentName),
					hasStatusIssues: initialStatuses.some(s => s.Component === componentName),
					restartSuccessful: true,
					timestamp: new Date().toISOString()
				});
			}

			return result;
		} catch (error) {
			console.error(`Failed to process script issues for ${systemName}: ${error.message}`);
			result.persistentErrors = result.scriptErrors;
			result.persistentStatuses = result.scriptStatuses;
			return result;
		}
	}

	/**
	 * Daily update function - collects all metrics and handles script issues
	 * Returns data pre-formatted for app.js consumption (Splunk + Slack)
	 * 
	 * @param {string} site - Site name for logging/reporting
	 * @returns {Object} - { splunkMetrics, splunkScriptEvents, slackMetrics }
	 */
	async dailyUpdate(site) {
		let httpConnected = false;
		let qrcConnected = false;
		let metrics = null;
		let memory = null;
		let coreDiagnostics = null;
		let scriptResults = {
			scriptErrors: [],
			scriptStatuses: [],
			persistentErrors: [],
			persistentStatuses: [],
			splunkEvents: []
		};

		// 1. HTTP-based metrics (session-based: connect once, perform operations, disconnect)
		try {
			await this.qhttp.connect();
			httpConnected = true;
			
			[metrics, memory] = await Promise.all([
				this.qhttp.getSystemMetrics().catch(e => { 
					console.log(`${this.systemName}: getSystemMetrics failed - ${e.message}`); 
					return null; 
				}),
				this.qhttp.getMemory().catch(e => { 
					console.log(`${this.systemName}: getMemory failed - ${e.message}`); 
					return null; 
				})
			]);
		} catch (e) {
			console.log(`${this.systemName}: HTTP connect failed - ${e.message}`);
		} finally {
			// Always disconnect HTTP session if connected
			if (httpConnected) {
				try {
					await this.qhttp.disconnect();
					// Small delay to allow Q-SYS server to clean up session
					await new Promise(resolve => setTimeout(resolve, 500));
				} catch (disconnectError) {
					console.error(`${this.systemName}: HTTP disconnect error - ${disconnectError.message}`);
				}
			}
		}

		// 2. QRC operations (connect once, perform operations, disconnect)
		try {
			await this.qrcSession.connect();
			qrcConnected = true;
			
			[coreDiagnostics, scriptResults] = await Promise.all([
				this.getCoreDiagnostics().catch(e => { 
					console.log(`${this.systemName}: getCoreDiagnostics failed - ${e.message}`); 
					return null; 
				}),
				this.processScriptIssues(this.systemName, site, this.ip).catch(e => { 
					console.log(`${this.systemName}: processScriptIssues failed - ${e.message}`); 
					return { 
						scriptErrors: [], 
						scriptStatuses: [], 
						persistentErrors: [], 
						persistentStatuses: [],
						splunkEvents: []
					}; 
				})
			]);
		} catch (e) {
			console.log(`${this.systemName}: QRC connect failed - ${e.message}`);
		} finally {
			// Always disconnect QRC session if connected
			if (qrcConnected) {
				try {
					this.qrcSession.disconnect();
				} catch (disconnectError) {
					console.error(`${this.systemName}: QRC disconnect error - ${disconnectError.message}`);
				}
			}
		}

		// 3. Log summary
		console.log(
			`${this.systemName}: Metrics: ${metrics ? "" : "NOT"} Received, ` +
			`Memory ${memory?.usage || 'N/A'}%, ` +
			`${scriptResults.persistentErrors.length} persistent errors, ` +
			`${scriptResults.persistentStatuses.length} persistent status issues`
		);

		// 4. Return data pre-formatted for app.js consumption
		return {
			// Ready-to-push Splunk metrics object
			splunkMetrics: {
				system: this.systemName,
				site: site,
				ip: this.ip,
				metrics,
				memory,
				scriptErrors: scriptResults.scriptErrors,
				coreDiagnostics,
				scriptStatuses: scriptResults.scriptStatuses,
				timestamp: new Date().toISOString()
			},
			
			// Ready-to-spread Splunk script events array
			splunkScriptEvents: scriptResults.splunkEvents || [],
			
			// Ready-to-use Slack metrics
			slackMetrics: {
				memory: { usage: memory?.usage ?? null },
				metricsUnavailable: !httpConnected || !memory,
				scriptStatuses: scriptResults.persistentStatuses,
				scriptErrors: scriptResults.persistentErrors
			}
		};
	}
}

export default QsysDiagnostics;

