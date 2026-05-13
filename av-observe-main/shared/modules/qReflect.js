import axios from 'axios';
import { getCredentials } from '../credentials.js';

export default class QREM {
    constructor() {
        const credentials = getCredentials('qrem');
        this.baseUrl = 'https://reflect.qsc.com/api/public/v0';
        this.accessToken = credentials.accessToken;
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async requestData(method, url, params = null) {
        try {
            const response = await this.axiosInstance({
                method,
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

    // Cores
    async getAllCores() {
        return this.requestData('get', '/cores');
    }

    async getCoreById(coreId) {
        return this.requestData('get', `/cores/${coreId}`);
    }

    async getCoreEvents(coreId, page = 1, pageSize = 100) {
        return this.requestData('get', `/cores/${coreId}/events`, { page, pageSize });
    }

    async getCoreMedia(coreId, mediaPath) {
        return this.requestData('get', `/cores/${coreId}/media/${mediaPath}`);
    }

    async getCoreMediaPlaylists(coreId) {
        return this.requestData('get', `/cores/${coreId}/media_playlists`);
    }

    async getCoreMediaPlaylistById(coreId, playlistId) {
        return this.requestData('get', `/cores/${coreId}/media_playlists/${playlistId}`);
    }

    // Systems
    async getAllSystems() {
        return this.requestData('get', '/systems');
    }

    async getSystemById(systemId) {
        return this.requestData('get', `/systems/${systemId}`);
    }

    async getSystemItems(systemId) {
        return this.requestData('get', `/systems/${systemId}/items`);
    }

    async getSystemItemById(systemId, itemId) {
        return this.requestData('get', `/systems/${systemId}/items/${itemId}`);
    }

    async getSystemEvents(systemId, page = 1, pageSize = 100) {
        return this.requestData('get', `/systems/${systemId}/events`, { page, pageSize });
    }

    // Users
    async getUserAuditEvents(page = 1, pageSize = 100) {
        return this.requestData('get', '/users/audit-events', { page, pageSize });
    }

    async getAllSystemIps() {
      this.systems = this.systems || await this.getAllSystems();
      const results = [];
      
      for (const system of this.systems) {
          const items = await this.getSystemItems(system.id);
          for (const item of items) {

              if (item.core?.name.toLowerCase() === item.name.toLowerCase()) {
                  results.push({
                      name: system.name,
                      ipAddress: item.networkConfig?.interfaces[0].ipAddress
                  });
              }
          }
      }
      return results;
    }

    async getSystemIp(systemName) {
        this.systemIps = this.systemIps || await this.getAllSystemIps();
        for (const system of this.systemIps) {
            if (system.name == systemName) return system.ipAddress;
        };
    }

    //used for daily update script
    async dailyUpdate() {
        const dailyUpdateData = {};
        const [systems, cores] = await Promise.all([
            this.getAllSystems(),
            this.getAllCores()
        ]);
        
        // Create a map for quick core status lookup by system name
        const coreStatusMap = new Map();
        
        cores.forEach(core => {
            // Find matching system by comparing core serial with system code
            const matchingSystem = systems.find(sys => sys.code === core.serial);
            if (matchingSystem) {
                coreStatusMap.set(matchingSystem.name, core.status);
            }
        });
        
        for (const system of systems) {
            const siteName = system.name.split('-')[0];
            if (!dailyUpdateData[siteName]) dailyUpdateData[siteName] = {};
            dailyUpdateData[siteName][system.name] = { ip: await this.getSystemIp(system.name) };

            const coreStatus = coreStatusMap.get(system.name);

            // Check if there are issues:
            // - Core status: code 2 = healthy, anything else = problem
            // - System status: code 0 = healthy, anything else = problem  
            const coreHasIssues = coreStatus && coreStatus.code !== 2;
            const systemHasIssues = system.status.code !== 0;
            
            if (coreHasIssues || systemHasIssues) {
                dailyUpdateData[siteName][system.name].issues = [];
                const peripherals = await this.getSystemItems(system.id);
                
                // If the core itself has issues, add that as the primary issue
                if (coreHasIssues) {
                    const coreMessage = coreStatus.message === 'Offline' ? 
                        'Offline from Reflect cloud servers' : 
                        coreStatus.message;
                        
                    dailyUpdateData[siteName][system.name].issues.push({
                        name: 'Core',
                        message: coreMessage,
                        details: coreStatus.details || 'Core processor issue',
                        isCoreOffline: coreStatus.message === 'Offline'
                    });
                }
                
                // Only check peripheral status if core is not offline from Reflect
                const coreIsOfflineFromReflect = coreHasIssues && coreStatus.message === 'Offline';
                if (!coreIsOfflineFromReflect) {
                    for (const peripheral of peripherals) {
                        if (![0, 3].includes(peripheral.status.code)) {

                            let obj = {
                                name: peripheral.name,
                                message: peripheral.status.message
                            };
                            if (peripheral.status.details) obj.details = peripheral.status.details;
                            dailyUpdateData[siteName][system.name].issues.push(obj);
                        }
                    }
                }
            }
        }
        
        // Return both the site-organized data and raw cores array for Splunk
        return {
            bySite: dailyUpdateData,
            cores: cores
        };
    }

}