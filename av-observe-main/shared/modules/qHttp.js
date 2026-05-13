import axios from 'axios';
import https from 'https';
import { getCredentials } from '../credentials.js';

class QSysClient {
  constructor(ipAddress) {
    const credentials = getCredentials('qHttp');  // Changed from 'qsys' to 'qHttp' to match credentials.js
    this.baseUrl = `https://${ipAddress}/api/v0`;
    this.credentials = {
      username: credentials.username,  // These match the structure in credentials.js
      password: credentials.password
    };
    this.authToken = null;
    this.ipAddress = ipAddress;
    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
  }

  // Core API Methods
  async ping() {
    return this._get('/ping');
  }

  async getUserPermissions() {
    return this._get('/cores/self/users/self?meta=permissions');
  }

  async getCorePermissions() {
    return this._get('/cores/self?meta=permissions');
  }

  async getPairingStatus() {
    return this._get('/cores/self/pairing');
  }

  async getTimeConfig() {
    return this._get('/cores/self/config/time?meta=permissions');
  }

  async getFeatures() {
    return this._get('/cores/self/features');
  }

  async getSystems() {
    return this._get('/systems?meta=permissions&include=assetData');
  }

  async getRemoteSupport() {
    return this._get('/cores/self/debug/remote_support');
  }

  async getMemory() {
    const response = await this._get('/debug/remote_support/network_debug/memstat', { useApiPath: false });

    // Parse the string response into structured data
    const lines = response.split('\n');
    const result = {};
    
    lines.forEach(line => {
        if (line) {
            const [key, value] = line.split(': ');
            if (key && value) {
                // Remove 'kB' and '%' and convert to number
                const cleanValue = value.replace(/kB|%/g, '').trim();
                result[key.split(' ')[0].toLowerCase()] = parseInt(cleanValue);
            }
        }
    });
    
    return {
        total: result.total,
        available: result.available,
        used: result.used,
        usage: result.usage
    };
}

  async getTopOutput() {
    return this._get(`/debug/remote_support/network_debug/top`, { useApiPath: false })
  }

  async getSystemMetrics() {
    const topOutput = await this.getTopOutput();
    const lines = topOutput.split('\n');
    
    return {
      memory: this._parseMemoryLine(lines[0]),
      cpu: this._parseCpuLine(lines[1]),
      loadAverage: this._parseLoadAverage(lines[2]),
      topProcesses: this._parseProcesses(lines.slice(4)).filter(p => p.cpuPercent > 0 || p.vszPercent > 10)

    };
  }
  
  _parseMemoryLine(line) {
    const matches = line.match(/Mem:\s+(\d+)K used,\s+(\d+)K free,\s+(\d+)K shrd,\s+(\d+)K buff,\s+(\d+)K cached/);
    if (!matches) return null;
    
    return {
      used: parseInt(matches[1]),
      free: parseInt(matches[2]),
      shared: parseInt(matches[3]),
      buffers: parseInt(matches[4]),
      cached: parseInt(matches[5])
    };
  }
  
  _parseCpuLine(line) {
    const matches = line.match(/CPU:\s+(\d+)% usr\s+(\d+)% sys\s+(\d+)% nic\s+(\d+)% idle\s+(\d+)% io\s+(\d+)% irq\s+(\d+)% sirq/);
    if (!matches) return null;
  
    return {
      user: parseInt(matches[1]),
      system: parseInt(matches[2]),
      nice: parseInt(matches[3]),
      idle: parseInt(matches[4]),
      io: parseInt(matches[5]),
      irq: parseInt(matches[6]),
      softIrq: parseInt(matches[7])
    };
  }
  
  _parseLoadAverage(line) {
    const matches = line.match(/Load average:\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    if (!matches) return null;
  
    return {
      oneMin: parseFloat(matches[1]),
      fiveMin: parseFloat(matches[2]), 
      fifteenMin: parseFloat(matches[3])
    };
  }
  
  _parseProcesses(lines) {
    return lines
      .filter(line => line.trim())
      .map(line => {
        const parts = line.trim().split(/\s+/);
        return {
          pid: parseInt(parts[0]),
          ppid: parseInt(parts[1]),
          user: parts[2],
          state: parts[3],
          vsz: parts[4],
          vszPercent: parseFloat(parts[5]),
          cpu: parseInt(parts[6]),
          cpuPercent: parseFloat(parts[7]),
          command: parts.slice(8).join(' ')
        };
      })
      .filter(proc => proc.cpuPercent > 0 || proc.vszPercent > 1); // Filter for significant processes
  }

  //when the Q-Sys server has, within it's "Main" script, a /metrics api at port 1234 that forwards data collection
  async getCustomMetrics(options = {}) {
    this.port = options.port || `1234`;
    return new Promise((resolve, reject) => {
      axios.get(`http://${this.ipAddress}:${this.port}/metrics`)
      .then(res => {
        if (res) resolve(res.data)
      })
      .catch(err => reject(err))
    })    
  }

  // Session management methods
  async connect(retryCount = 0) {
    if (this.authToken) {
      return this.authToken; // Already authenticated
    }
    
    const startTime = Date.now();
    try {
      const response = await this.axiosInstance.post(
        `${this.baseUrl}/logon`,
        this.credentials
      );
      const elapsed = Date.now() - startTime;
      console.log(`${this.ipAddress}: HTTP login success (${elapsed}ms)`);
      this.authToken = response.data.token;
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
      return this.authToken;
    } catch (error) {
      const elapsed = Date.now() - startTime;
      const errorCode = error.response?.data?.code || error.response?.status || 'unknown';
      const errorMsg = error.response?.data?.message || error.message;
      
      // If session limit exceeded, wait for session expiry and retry once
      if (error.response?.data?.code === 'SessionsQuantityExceeded' && retryCount < 1) {
        console.log(`${this.ipAddress}: Session limit reached (${elapsed}ms), waiting 5s for session expiry...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.connect(retryCount + 1);
      }
      
      // Q-SYS cores may return 500 during API initialization (transient race condition)
      // Retry once after brief delay - this usually resolves the issue
      if (error.response?.status === 500 && retryCount < 1) {
        console.log(`${this.ipAddress}: API initializing (${elapsed}ms), retrying in 2s...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.connect(retryCount + 1);
      }
      
      if (error.response?.status === 500) {
        console.error(`${this.ipAddress}: API initialization failed after retry (${elapsed}ms)`);
      } else {
        this._handleError('Authentication', error);
      }
      throw error;
    }
  }

  async disconnect() {
    if (!this.authToken) {
      return; // Not authenticated
    }
    try {
      const response = await this.axiosInstance.delete(`${this.baseUrl}/logon`);
      if (response.status === 200 || response.status === 204) {
        console.log(`${this.ipAddress}: HTTP session logged out (${response.status})`);
      } else {
        console.warn(`${this.ipAddress}: HTTP logout returned unexpected status ${response.status}`);
      }
    } catch (error) {
      console.error(`${this.ipAddress}: HTTP logout error - ${error.message}`);
    } finally {
      // Always clear local state
      this.authToken = null;
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  // Alias for clarity
  async logout() {
    return this.disconnect();
  }

  // Legacy authentication method (for backward compatibility)
  async _authenticate() {
    return await this.connect();
  }

  async _get(endpoint, options = { useApiPath: true }) {
    try {
      if (!this.authToken) {
        await this._authenticate();
      }
      const baseUrl = options.useApiPath ? this.baseUrl : this.baseUrl.replace('/api/v0', '');
      const response = await this.axiosInstance.get(`${baseUrl}${endpoint}`);
      return response.data;
    } catch (error) {
      // If we get a 401, try to re-authenticate once
      if (error.response?.status === 401) {
        try {
          await this._authenticate();
          const baseUrl = options.useApiPath ? this.baseUrl : this.baseUrl.replace('/api/v0', '');
          const response = await this.axiosInstance.get(`${baseUrl}${endpoint}`);
          return response.data;
        } catch (retryError) {
          this._handleError(`GET ${endpoint} (retry)`, retryError);
          throw retryError;
        }
      }
      this._handleError(`GET ${endpoint}`, error);
      throw error;
    }
  }

  _handleError(operation, error) {
    console.error(`${operation} error:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

export default QSysClient;
