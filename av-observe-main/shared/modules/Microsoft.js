import axios from 'axios';
import { getCredentials } from '../credentials.js';

class Microsoft {
	constructor() {
		const credentials = getCredentials('microsoft');
		this.clientId = credentials.clientId;
		this.clientSecret = credentials.clientSecret;
		this.tenantId = '03346483-0d18-40e7-a588-3784ac50e16f';
		this.tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
		this.accessToken = null;
		this.tokenExpiry = null;
	}

	async authenticate() {
		try {
			const response = await axios.post(this.tokenUrl, new URLSearchParams({
				client_id: this.clientId,
				scope: 'https://graph.microsoft.com/.default',
				client_secret: this.clientSecret,
				grant_type: 'client_credentials'
			}), {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});

			this.accessToken = response.data.access_token;
			// Set expiry time (subtract 60 seconds for buffer)
			this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
			
			return this.accessToken;
		} catch (error) {
			throw new Error(`Microsoft authentication failed: ${error.response?.data?.error_description || error.message}`);
		}
	}

	async getValidToken() {
		// Check if we need to authenticate or refresh token
		if (!this.accessToken || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
			await this.authenticate();
		}
		return this.accessToken;
	}

	async requestData(method, endpoint, data = null) {
		try {
			const token = await this.getValidToken();
			const response = await axios({
				method,
				url: `https://graph.microsoft.com/v1.0${endpoint}`,
				data,
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			return response.data;
		} catch (error) {
			throw new Error(
				error.response 
					? `Microsoft Graph API Error ${error.response.status}: ${error.response.data?.error?.message || 'Unknown error'}`
					: `Network Error: ${error.message}`
			);
		}
	}

	// Get calendars for a specific user (Application permission: Calendars.Read)
	// You need to know the exact user ID or email address
	async getUserCalendars(userId, options = {}) {
		const params = new URLSearchParams();
		if (options.top) params.append('$top', options.top);
		if (options.filter) params.append('$filter', options.filter);
		if (options.select) params.append('$select', options.select);
		
		const endpoint = `/users/${userId}/calendars${params.toString() ? '?' + params.toString() : ''}`;
		return this.requestData('get', endpoint);
	}

	// Get events from user's default calendar (Application permission: Calendars.Read)
	// You need to know the exact user ID or email address
	async getUserEvents(userId, options = {}) {
		const params = new URLSearchParams();
		if (options.top) params.append('$top', options.top);
		if (options.select) params.append('$select', options.select);
		if (options.filter) params.append('$filter', options.filter);
		
		// Add date range filtering if provided
		if (options.startDate && options.endDate) {
			const startISO = new Date(options.startDate).toISOString();
			const endISO = new Date(options.endDate).toISOString();
			// Use interval overlap logic: event.start < range.end AND event.end > range.start
			// This correctly captures all events that overlap with the date range
			const dateFilter = `start/dateTime lt '${endISO}' and end/dateTime gt '${startISO}'`;
			
			// Combine with existing filter if present
			const existingFilter = params.get('$filter');
			if (existingFilter) {
				params.set('$filter', `${existingFilter} and ${dateFilter}`);
			} else {
				params.set('$filter', dateFilter);
			}
		}
		
		const endpoint = `/users/${userId}/events${params.toString() ? '?' + params.toString() : ''}`;
		return this.requestData('get', endpoint);
	}

	// Get today's events for a user/room - includes ongoing meetings from previous days
	async getTodaysEvents(userId) {
		try {
			// Get all events without date filtering to avoid API issues
			const result = await this.getUserEvents(userId, {
				top: 50,
				select: 'subject,start,end,organizer'
			});
			
			// Get today's date range in UTC (start of day to end of day in UTC)
			const now = new Date();
			const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const todayEnd = new Date(todayStart);
			todayEnd.setDate(todayEnd.getDate() + 1);
			
		const todaysEvents = result.value?.filter(event => {
			// Parse event times as UTC (Microsoft API returns UTC times)
			const eventStart = new Date(event.start?.dateTime + 'Z');
			const eventEnd = new Date(event.end?.dateTime + 'Z');
			
			// Event overlaps with today if:
			// event starts before end of today AND event ends after start of today
			return eventStart < todayEnd && eventEnd > todayStart;
		}).sort((a, b) => {
			// Sort by start time (chronological order)
			const aStart = new Date(a.start?.dateTime + 'Z');
			const bStart = new Date(b.start?.dateTime + 'Z');
			return aStart - bStart;
		}) || [];
		
		return { value: todaysEvents };
		} catch (error) {
			throw error;
		}
	}

	// Get events for a specific date range
	async getEventsInRange(userId, startDate, endDate) {
		try {
			const result = await this.getUserEvents(userId, {
				top: 100,
				select: 'subject,start,end,organizer,location',
				startDate,
				endDate
			});
			
			// Sort events chronologically by start time
			const sortedEvents = (result.value || []).sort((a, b) => {
				const aStart = new Date(a.start?.dateTime + 'Z');
				const bStart = new Date(b.start?.dateTime + 'Z');
				return aStart - bStart;
			});
			
			return { value: sortedEvents };
		} catch (error) {
			throw error;
		}
	}

	
}

export default Microsoft