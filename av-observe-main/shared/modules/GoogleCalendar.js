import { google } from 'googleapis';
import { getCredentials } from '../credentials.js';

/**
 * GoogleCalendar - Google Calendar API client
 * 
 * Authentication: Service Account with domain-wide delegation
 * API Reference: https://developers.google.com/workspace/calendar/api/v3/reference
 */
class GoogleCalendar {
	constructor() {
		const credentials = getCredentials('googleCalendar');
		this.privateKey = credentials.privateKey;
		this.clientEmail = credentials.clientEmail;
		this.calendar = null;
	}

	/**
	 * Initialize the Google Calendar API client with service account auth
	 */
	async connect() {
		if (this.calendar) {
			return this.calendar;
		}

		const auth = new google.auth.JWT({
			email: this.clientEmail,
			key: this.privateKey,
			scopes: ['https://www.googleapis.com/auth/calendar.readonly']
		});

		this.calendar = google.calendar({ version: 'v3', auth });
		return this.calendar;
	}

	/**
	 * Get calendar metadata
	 * @param {string} calendarId - Calendar ID (email address or 'primary')
	 */
	async getCalendar(calendarId) {
		await this.connect();
		
		const response = await this.calendar.calendars.get({
			calendarId
		});
		
		return response.data;
	}

	/**
	 * List events from a calendar
	 * @param {string} calendarId - Calendar ID (email address or 'primary')
	 * @param {Object} options - Query options
	 */
	async listEvents(calendarId, options = {}) {
		await this.connect();
		
		const params = {
			calendarId,
			maxResults: options.maxResults || 50,
			singleEvents: true,
			orderBy: 'startTime'
		};

		if (options.timeMin) {
			params.timeMin = new Date(options.timeMin).toISOString();
		}
		if (options.timeMax) {
			params.timeMax = new Date(options.timeMax).toISOString();
		}

		const response = await this.calendar.events.list(params);
		return response.data;
	}

	/**
	 * Get today's events for a calendar
	 * @param {string} calendarId - Calendar ID (email address or 'primary')
	 */
	async getTodaysEvents(calendarId) {
		const now = new Date();
		const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const endOfDay = new Date(startOfDay);
		endOfDay.setDate(endOfDay.getDate() + 1);

		return this.listEvents(calendarId, {
			timeMin: startOfDay,
			timeMax: endOfDay
		});
	}

	/**
	 * List all calendars accessible to the service account
	 */
	async listCalendars() {
		await this.connect();
		
		const response = await this.calendar.calendarList.list();
		return response.data;
	}

	/**
	 * Query free/busy information for calendars
	 * @param {string[]} calendarIds - Array of calendar IDs to query
	 * @param {Date|string} timeMin - Start of time range
	 * @param {Date|string} timeMax - End of time range
	 */
	async getFreeBusy(calendarIds, timeMin, timeMax) {
		await this.connect();

		const response = await this.calendar.freebusy.query({
			requestBody: {
				timeMin: new Date(timeMin).toISOString(),
				timeMax: new Date(timeMax).toISOString(),
				items: calendarIds.map(id => ({ id }))
			}
		});

		return response.data;
	}

	/**
	 * Get today's free/busy for calendars
	 * @param {string[]} calendarIds - Array of calendar IDs to query
	 */
	async getTodaysFreeBusy(calendarIds) {
		const now = new Date();
		const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const endOfDay = new Date(startOfDay);
		endOfDay.setDate(endOfDay.getDate() + 1);

		return this.getFreeBusy(calendarIds, startOfDay, endOfDay);
	}

	/**
	 * Test connection by listing calendars
	 */
	async testConnection() {
		try {
			const calendars = await this.listCalendars();
			console.log('Google Calendar connection successful');
			console.log(`Found ${calendars.items?.length || 0} calendars`);
			return { success: true, calendars: calendars.items || [] };
		} catch (error) {
			console.error('Google Calendar connection failed:', error.message);
			return { success: false, error: error.message };
		}
	}
}

export default GoogleCalendar;
