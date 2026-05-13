import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { getCredentials } from '../credentials.js';

export default class Domotz {
  constructor() {
    const credentials = getCredentials('domotz');
    if (!credentials.apiKey) {
        throw new Error('Domotz API key is required');
    }

    this.apiKey = credentials.apiKey;
    this.baseUrl = 'https://api-us-east-1-cell-1.domotz.com/public-api/v1/';

    this.axiosInstance = axios.create({
        baseURL: this.baseUrl,
        headers: {
            'X-Api-Key': this.apiKey,
            'Accept': 'application/json'
        }
    });
}

    async requestData(url, params = {}) {
        try {
            const response = await this.axiosInstance({
                method: params.method || "get",
                url,
                params
            });
            return response.data;
        } catch (error) {
            // Sanitize error before throwing
            const sanitizedError = new Error(
                error.response 
                    ? `API Error ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`
                    : 'Network Error'
            );
            sanitizedError.status = error.response?.status;
            throw sanitizedError;
        }
    }

    async #ensureDirectoryExists(filePath) {
      const directory = path.dirname(filePath);
      try {
        await fs.promises.access(directory);
      } catch {
        await fs.promises.mkdir(directory, { recursive: true });
      }
    }

    async listAgents(options = {page_size: 100}) {
        return this.requestData('agent', options);
    }

    /**
     * List all devices for a specific agent
     * @param {string} agentId - The agent's ID
     * @param {string} deviceId - Optional specific device ID to fetch
     * @returns {Promise<Array|Object>} Array of devices or single device if deviceId provided
     */
    async listDevices(agentId, deviceId = null) {
        try {
            const endpoint = deviceId 
                ? `agent/${agentId}/device?device_id=${deviceId}`
                : `agent/${agentId}/device`;
            return await this.requestData(endpoint);
        } catch (error) {
            throw new Error(`Failed to list devices for agent ${agentId}: ${error.message}`);
        }
    }

    /**
     * Get SNMP data for a specific device
     * @param {string} agentId - The agent's ID
     * @param {string} deviceId - The device's ID
     * @returns {Promise<Object>} SNMP data for the device
     */
    async listSnmp(agentId, deviceId) {
        try {
            return await this.requestData(`agent/${agentId}/device/${deviceId}/eye/snmp`);
        } catch (error) {
            throw new Error(`Failed to get SNMP data for device ${deviceId} on agent ${agentId}: ${error.message}`);
        }
    }

    /**
     * Get all devices across all agents
     * @returns {Promise<Array>} Array of objects with agentId, agentName, and devices array
     */
    async listAllDevices() {
        try {
            const agents = await this.listAgents();
            const allDevices = await Promise.all(
                agents.map(async agent => {
                    try {
                        const devices = await this.listDevices(agent.id);
                        return {
                            agentId: agent.id,
                            agentName: agent.display_name,
                            devices: devices || []
                        };
                    } catch (error) {
                        console.error(`Failed to get devices for agent ${agent.display_name}: ${error.message}`);
                        return {
                            agentId: agent.id,
                            agentName: agent.display_name,
                            devices: [],
                            error: error.message
                        };
                    }
                })
            );
            return allDevices;
        } catch (error) {
            throw new Error(`Failed to list all devices: ${error.message}`);
        }
    }

    /**
     * Get SNMP data for all devices across all agents
     * @param {Object} options - Options for filtering results
     * @param {boolean} options.filterEmpty - If true, exclude devices with empty SNMP data arrays
     * @returns {Promise<Array>} Array of objects with agentId, agentName, deviceId, deviceName, and snmpData
     */
    async listAllSnmp(options = {}) {
        try {
            const allDevicesData = await this.listAllDevices();
            const allSnmpData = [];

            for (const agentData of allDevicesData) {
                if (agentData.error || !agentData.devices.length) {
                    continue;
                }

                for (const device of agentData.devices) {
                    try {
                        const snmpData = await this.listSnmp(agentData.agentId, device.id);
                        
                        // Filter out empty SNMP data if option is enabled
                        if (options.filterEmpty && (!snmpData || (Array.isArray(snmpData) && snmpData.length === 0))) {
                            continue;
                        }
                        
                        allSnmpData.push({
                            agentId: agentData.agentId,
                            agentName: agentData.agentName,
                            deviceId: device.id,
                            deviceName: device.display_name,
                            snmpData
                        });
                    } catch (error) {
                        console.error(`Failed to get SNMP for ${device.display_name} on ${agentData.agentName}: ${error.message}`);
                        
                        // Don't add error entries if filtering empty data
                        if (!options.filterEmpty) {
                            allSnmpData.push({
                                agentId: agentData.agentId,
                                agentName: agentData.agentName,
                                deviceId: device.id,
                                deviceName: device.display_name,
                                error: error.message
                            });
                        }
                    }
                }
            }

            return allSnmpData;
        } catch (error) {
            throw new Error(`Failed to list all SNMP data: ${error.message}`);
        }
    }

  async listAllDeviceVariables(outputPath) {
    const results = [];
    try {
      const agents = await this.listAgents({ page_size: 100 });
      
      for (const agent of agents) {
        try {
          const devices = await this.requestData(`agent/${agent.id}/device`);
          
          for (const device of devices) {
            try {
              const variables = await this.requestData(`agent/${agent.id}/device/${device.id}/variable`);
              results.push({
                agentName: agent.display_name,
                deviceName: device.display_name,
                variables
              });
            } catch (deviceError) {
              results.push({
                agentName: agent.display_name,
                deviceName: device.display_name,
                error: `Failed to fetch device variables: ${deviceError.message}`
              });
            }
          }
        } catch (agentError) {
          results.push({
            agentName: agent.display_name,
            error: `Failed to fetch devices: ${agentError.message}`
          });
        }
      }

      // Write results to file if outputPath is provided
      if (outputPath) {
        await this.#ensureDirectoryExists(outputPath);
        await fs.promises.writeFile(
          outputPath,
          JSON.stringify(results, null, 2),
          'utf8'
        );
        console.log(`Data successfully written to ${outputPath}`);
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to fetch agents: ${error.message}`);
    }
  }

  async reportDeviceErrors(options = {}) {
    const report = [];
    const agents = await this.listAgents({ page_size: 100 });

    for (const agent of agents) {
        // Skip excluded agents
        if (options.exclude && options.exclude.some(pattern => agent.display_name.includes(pattern))) {
            continue;
        }

        const agentReport = {
            agentName: agent.display_name,
            offlineDevices: []
        };

        const devices = await this.requestData(`agent/${agent.id}/device`);
        
        // Filter and map offline devices
        const offlineDevices = devices
            .filter(device => device.status && device.status !== "ONLINE")
            .map(device => ({
                name: device.display_name,
                status: device.status,
                id: device.id
            }));

        if (offlineDevices.length > 0) {
            agentReport.offlineDevices = offlineDevices;
        }

        report.push(agentReport);
    }

    return report;
  }

    /**
   * Get speed test stats for a single agent.
   * @param {string} agentId - The agent's ID.
   * @returns {Promise<Object>} Object with speed test stats.
   */
  async getAgentSpeedTestStats(agentId) {
    try {
      const speedTest = await this.requestData(`agent/${agentId}/history/network/speed`);
      const last4 = speedTest.reverse().slice(0, 4);

      const stats = {
        download: {
          lowest: Math.min(...last4.map(test => test.values[0])),
          average: last4.reduce((sum, test) => sum + test.values[0], 0) / 4
        },
        upload: {
          lowest: Math.min(...last4.map(test => test.values[1])),
          average: last4.reduce((sum, test) => sum + test.values[1], 0) / 4
        }
      };

      return {
        downloadLowestMbps: (stats.download.lowest / 1000000).toFixed(2),
        downloadAverageMbps: (stats.download.average / 1000000).toFixed(2),
        uploadLowestMbps: (stats.upload.lowest / 1000000).toFixed(2),
        uploadAverageMbps: (stats.upload.average / 1000000).toFixed(2)
      };
    } catch (err) {
      return { error: err.message };
    }
  }

  async getAgentsWithSpeedTests() {
    try {
        const agents = await this.listAgents();
        const agentsWithSpeedTests = await Promise.all(
            agents.map(async agent => {
                agent.speedTests = await this.getAgentSpeedTestStats(agent.id);
                return agent;
            })
        );
        return agentsWithSpeedTests;
    } catch (error) {
        throw new Error(`Failed to fetch agents with speed tests: ${error.message}`);
    }
  }

  async getAgentsBySite() {
    try {
        const agents = await this.getAgentsWithSpeedTests();
        
        return agents.reduce((acc, agent) => {
            // Skip sandbox or non-site agents
            if (!agent.display_name.includes('-') || 
                agent.display_name.toLowerCase().includes('sandbox')) {
                return acc;
            }

            const site = agent.display_name.split('-')[0].toUpperCase();
            if (!acc[site]) acc[site] = [];
            
            acc[site].push({
                name: agent.display_name,
                downloadAvg: agent.speedTests.downloadAverageMbps,
                uploadAvg: agent.speedTests.uploadAverageMbps,
                status: agent.status.value
            });

            return acc;
        }, {});
    } catch (error) {
        throw new Error(`Failed to organize agents by site: ${error.message}`);
    }
  }

  /**
   * Daily update - consolidates all Domotz data collection for daily reporting
   * Returns data organized for both Slack reports and Splunk analytics
   * @returns {Promise<Object>} { agentsBySite, agentsWithSpeedTests }
   */
  async dailyUpdate() {
    try { 
        
        // Get all agents with speed test data (for Splunk)
        const agentsWithSpeedTests = await this.getAgentsWithSpeedTests();
        
        // Organize by site (for Slack)
        const agentsBySite = agentsWithSpeedTests.reduce((acc, agent) => {
            // Skip sandbox or non-site agents
            if (!agent.display_name.includes('-') || 
                agent.display_name.toLowerCase().includes('sandbox')) {
                return acc;
            }

            const site = agent.display_name.split('-')[0].toUpperCase();
            if (!acc[site]) acc[site] = [];
            
            acc[site].push({
                name: agent.display_name,
                downloadAvg: agent.speedTests.downloadAverageMbps,
                uploadAvg: agent.speedTests.uploadAverageMbps,
                status: agent.status.value
            });

            return acc;
        }, {});
        
        // Return structured data for both Slack and Splunk
        return {
            agentsBySite,           // For Slack reporting (grouped by site)
            agentsWithSpeedTests    // For Splunk analytics (full data)
        };
        
    } catch (error) {
        throw new Error(`Domotz daily update failed: ${error.message}`);
    }
  }

}

// GET /agent/{agent_id}/device/{device_id}/eye/snmp/{sensor_id}/history
// GET /agent/{agent_id}/device/variable
// GET /agent/{agent_id}/device/{device_id}/variable/{variable_id}/history