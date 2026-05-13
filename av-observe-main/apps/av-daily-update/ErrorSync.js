import Google from '@av-observe/shared/modules/Google.js';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./shared/config.json', 'utf-8'));
const isCI = process.env.CI || process.env.GITLAB_CI;

class ErrorSync {
	constructor() {
		this.google = new Google();
		this.spreadsheetId = config.errorKnowledgeBase.spreadsheetId;
		this.sheetTab = config.errorKnowledgeBase.tab;
		this.errorTypes = {}; // In-memory store for current run
	}

	/**
	 * Load error types from local file (local dev only)
	 */
	loadLocalErrorTypes(dataDir = './.ignore') {
		if (isCI) {
			return {}; // No local file in CI
		}
		
		const errorPath = `${dataDir}/errorTypes.json`;
		try {
			const data = fs.readFileSync(errorPath, 'utf8');
			return JSON.parse(data);
		} catch (error) {
			// File doesn't exist yet - that's fine
			return {};
		}
	}

	/**
	 * Save error types to local file (local dev only)
	 */
	saveLocalErrorTypes(errorTypes, dataDir = './.ignore') {
		if (isCI) {
			return true; // Skip saving in CI
		}
		
		const errorPath = `${dataDir}/errorTypes.json`;
		try {
			if (!fs.existsSync(dataDir)) {
				fs.mkdirSync(dataDir, { recursive: true });
			}
			fs.writeFileSync(errorPath, JSON.stringify(errorTypes, null, 2));
			return true;
		} catch (error) {
			console.error('Failed to save local error types:', error.message);
			return false;
		}
	}

	/**
	 * Load error types from Google Sheets
	 */
	async loadFromGoogleSheets() {
		try {
			const response = await this.google.getData(this.spreadsheetId, `${this.sheetTab}!A:F`);
			if (!response?.values || response.values.length < 2) {
				return {};
			}

			const rows = response.values.slice(1);
			const errorTypes = {};

			rows.forEach(row => {
				if (row[0]) {
					const key = row[0].trim();
					
					let lastSeen = new Date().toISOString();
					if (row[4] && row[4] !== 'Unknown' && row[4] !== 'Invalid Date') {
						try {
							const parsedDate = new Date(row[4]);
							if (!isNaN(parsedDate.getTime())) {
								lastSeen = parsedDate.toISOString();
							}
						} catch (e) {
							// Keep default
						}
					}

					errorTypes[key] = {
						service: row[1] || '',
						errorType: row[2] || '',
						sampleError: row[3] || '',
						lastSeen: lastSeen,
						howToFix: row[5] || 'TO_BE_FILLED_MANUALLY'
					};
				}
			});

			return errorTypes;
		} catch (error) {
			console.error('Failed to load from Google Sheets:', error.message);
			return {};
		}
	}

	/**
	 * Push error types to Google Sheets
	 */
	async pushToGoogleSheets(errorTypes) {
		try {
			const headers = ['Key', 'Service', 'Error Type', 'Sample Error', 'Last Seen', 'How To Fix'];
			const rows = [headers];

			Object.entries(errorTypes).forEach(([key, data]) => {
				let lastSeenReadable = 'Unknown';
				if (data.lastSeen && data.lastSeen !== 'TO_BE_FILLED_MANUALLY') {
					try {
						const date = new Date(data.lastSeen);
						lastSeenReadable = date.toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'short',
							day: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						});
					} catch (e) {
						lastSeenReadable = 'Invalid Date';
					}
				}

				rows.push([
					key,
					data.service || '',
					data.errorType || '',
					data.sampleError || '',
					lastSeenReadable,
					data.howToFix || 'TO_BE_FILLED_MANUALLY'
				]);
			});

			const range = `${this.sheetTab}!A:F`;
			const success = await this.google.updateData(this.spreadsheetId, range, rows);
			
			if (success) {
				console.log(`Successfully pushed ${Object.keys(errorTypes).length} error types to Google Sheets`);
				return true;
			} else {
				console.error('Failed to push data to Google Sheets');
				return false;
			}
		} catch (error) {
			console.error('Failed to push to Google Sheets:', error.message);
			return false;
		}
	}

	/**
	 * Sync error types between local file and Google Sheets
	 */
	async syncErrorTypes(dataDir = './.ignore') {
		try {
			console.log('Syncing error types with Google Sheets...');

			// In CI: use in-memory types collected during this run + remote
			// Locally: merge local file + remote
			const localErrorTypes = isCI ? this.errorTypes : this.loadLocalErrorTypes(dataDir);
			const remoteErrorTypes = await this.loadFromGoogleSheets();

			// Merge: local/in-memory with remote "howToFix" updates
			const mergedErrorTypes = { ...localErrorTypes };

			// Pull "howToFix" updates from Google Sheets
			Object.keys(mergedErrorTypes).forEach(key => {
				if (remoteErrorTypes[key] && 
					remoteErrorTypes[key].howToFix !== 'TO_BE_FILLED_MANUALLY') {
					mergedErrorTypes[key].howToFix = remoteErrorTypes[key].howToFix;
				}
			});

			// Include any error types that exist in remote but not locally
			Object.keys(remoteErrorTypes).forEach(key => {
				if (!mergedErrorTypes[key]) {
					mergedErrorTypes[key] = remoteErrorTypes[key];
				}
			});

			// Save locally (skipped in CI)
			this.saveLocalErrorTypes(mergedErrorTypes, dataDir);

			// Push to Google Sheets
			await this.pushToGoogleSheets(mergedErrorTypes);

			console.log('Error types sync completed successfully');
			return mergedErrorTypes;

		} catch (error) {
			console.error('Error during sync:', error.message);
			return null;
		}
	}

	/**
	 * Add or update a single error type
	 */
	addErrorType(key, service, errorType, sampleError, dataDir = './.ignore') {
		// In CI: just store in memory, will be synced later
		if (isCI) {
			if (!this.errorTypes[key]) {
				this.errorTypes[key] = {
					service,
					errorType,
					sampleError,
					lastSeen: new Date().toISOString(),
					howToFix: 'TO_BE_FILLED_MANUALLY'
				};
			} else {
				this.errorTypes[key].lastSeen = new Date().toISOString();
			}
			return !this.errorTypes[key];
		}
		
		// Locally: read/write to file
		const errorTypes = this.loadLocalErrorTypes(dataDir);
		
		if (!errorTypes[key]) {
			errorTypes[key] = {
				service,
				errorType,
				sampleError,
				lastSeen: new Date().toISOString(),
				howToFix: 'TO_BE_FILLED_MANUALLY'
			};
			this.saveLocalErrorTypes(errorTypes, dataDir);
			return true;
		} else {
			errorTypes[key].lastSeen = new Date().toISOString();
			this.saveLocalErrorTypes(errorTypes, dataDir);
			return false;
		}
	}
}

export default ErrorSync;
