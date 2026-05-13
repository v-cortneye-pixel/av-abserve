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
		
		const endpoint = `/users/${userId}/events${params.toString() ? '?' + params.toString() : ''}`;
		return this.requestData('get', endpoint);
	}

	// Get today's events for a user/room (simplified - no date filter)
	async getTodaysEvents(userId) {
		try {
			// Get all events without date filtering to avoid API issues
			const result = await this.getUserEvents(userId, {
				top: 50,
				select: 'subject,start,end,organizer'
			});
			
			// Filter for today on client side
			const today = new Date().toISOString().split('T')[0];
			const todaysEvents = result.value?.filter(event => {
				const eventDate = event.start?.dateTime?.split('T')[0];
				return eventDate === today;
			}) || [];
			
			return { value: todaysEvents };
		} catch (error) {
			throw error;
		}
	}


}

export default Microsoft