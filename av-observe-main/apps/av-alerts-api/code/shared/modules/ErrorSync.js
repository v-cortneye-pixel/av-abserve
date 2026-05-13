/*
	This module was completely vibe coded....seems to be working so far!
*/

import Google from './Google.js';
import fs from 'fs';

class ErrorSync {
	constructor() {
		this.google = new Google();
		// Load config for error knowledge base settings
		const config = JSON.parse(fs.readFileSync('./shared/config.json', 'utf-8'));
		this.spreadsheetId = config.errorKnowledgeBase.spreadsheetId;
		this.sheetTab = config.errorKnowledgeBase.tab;
	}

	/**
	 * Load error types from local file
	 */
	loadLocalErrorTypes(dataDir = './.ignore') {
		const errorPath = `${dataDir}/errorTypes.json`;
		try {
			const data = fs.readFileSync(errorPath, 'utf8');
			return JSON.parse(data);
		} catch (error) {
			console.error('Failed to load local error types:', error.message);
			return {};
		}
	}

	/**
	 * Save error types to local file
	 */
	saveLocalErrorTypes(errorTypes, dataDir = './.ignore') {
		const errorPath = `${dataDir}/errorTypes.json`;
		try {
			// Create directory if it doesn't exist
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
				console.log('No data found in Google Sheets or only headers present');
				return {};
			}

			const headers = response.values[0];
			const rows = response.values.slice(1);
			const errorTypes = {};

			// Expected columns: Key, Service, Error Type, Sample Error, Last Seen, How To Fix
			rows.forEach(row => {
				if (row[0]) { // Has a key
					const key = row[0].trim();
					
					// Convert readable date back to ISO string for local storage
					// Note: We prioritize local timestamps over sheet timestamps since 
					// sheets now show readable dates that may lose precision
					let lastSeen = new Date().toISOString();
					if (row[4] && row[4] !== 'Unknown' && row[4] !== 'Invalid Date') {
						try {
							// Try to parse the readable date back to ISO
							const parsedDate = new Date(row[4]);
							if (!isNaN(parsedDate.getTime())) {
								lastSeen = parsedDate.toISOString();
							}
						} catch (e) {
							// Keep default if parsing fails
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
			// Prepare data for Google Sheets - reordered columns with How To Fix last
			const headers = ['Key', 'Service', 'Error Type', 'Sample Error', 'Last Seen', 'How To Fix'];
			const rows = [headers];

			Object.entries(errorTypes).forEach(([key, data]) => {
				// Convert lastSeen ISO timestamp to readable date string
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

			// Clear existing data and write new data
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
	 * - Pulls "howToFix" updates from Google Sheets
	 * - Pushes new error types to Google Sheets
	 * - Preserves manual "howToFix" edits in Google Sheets
	 */
	async syncErrorTypes(dataDir = './.ignore') {
		try {
			console.log('Syncing error types with Google Sheets...');

			// Load both local and remote data
			const localErrorTypes = this.loadLocalErrorTypes(dataDir);
			const remoteErrorTypes = await this.loadFromGoogleSheets();

			// Merge: local structure with remote "howToFix" updates
			const mergedErrorTypes = { ...localErrorTypes };

			// Update "howToFix" from Google Sheets if it's been manually updated
			Object.keys(mergedErrorTypes).forEach(key => {
				if (remoteErrorTypes[key] && 
					remoteErrorTypes[key].howToFix !== 'TO_BE_FILLED_MANUALLY') {
					mergedErrorTypes[key].howToFix = remoteErrorTypes[key].howToFix;
				}
			});

			// Add any new error types from remote (shouldn't happen normally, but handle it)
			Object.keys(remoteErrorTypes).forEach(key => {
				if (!mergedErrorTypes[key]) {
					mergedErrorTypes[key] = remoteErrorTypes[key];
				}
			});

			// Save merged data locally
			this.saveLocalErrorTypes(mergedErrorTypes, dataDir);

			// Push merged data to Google Sheets (includes any new error types)
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
			// Update lastSeen for existing error types
			errorTypes[key].lastSeen = new Date().toISOString();
			this.saveLocalErrorTypes(errorTypes, dataDir);
			return false; // Already existed, but updated lastSeen
		}
	}
}

export default ErrorSync;