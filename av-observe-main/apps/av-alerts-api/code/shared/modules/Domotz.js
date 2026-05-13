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

}