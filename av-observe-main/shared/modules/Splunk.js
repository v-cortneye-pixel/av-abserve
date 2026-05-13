import axios from 'axios';
import { getCredentials } from '../credentials.js';

class Splunk {
    constructor() {
        this.splunkUrl = 'https://http-inputs-zillowgroup.splunkcloud.com/services/collector/event';
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        const credentials = await getCredentials('splunk');
        if (!credentials.token) {
            throw new Error('Splunk token is required');
        }
        this.splunkAuth = { Authorization: `Splunk ${credentials.token}` };
        this.splunkAuthHeader = { headers: this.splunkAuth };
        this.initialized = true;
    }

    async push(data, index, eventName) {
        await this.initialize();
        
        if (!['zgav_nonprod', 'zgav-prod'].includes(index)) {
            throw new Error('Invalid index. Must be either "zgav_nonprod" or "zgav-prod"');
        }

        // Don't mutate the original data - create a copy with the event name
        const eventData = {
            ...data,
            event: eventName || data.event || "generic"
        };

        const sendObj = {
            index,
            sourcetype: 'AV',
            event: eventData
        };


        try {
            const response = await axios.post(this.splunkUrl, sendObj, this.splunkAuthHeader);
            return {
                success: true,
                status: response.status,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                status: error.response?.status || null
            };
        }
    }
}

export default Splunk;