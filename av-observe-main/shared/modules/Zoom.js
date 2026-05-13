import axios from 'axios';
import fs from 'fs';
import { getCredentials } from '../credentials.js';
const config = JSON.parse(fs.readFileSync('./shared/config.json', 'utf8'));

class Zoom {
  constructor() {
    const credentials = getCredentials('zoom');
    this.accountId = credentials.accountId;
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
  }

  #generateBasicAuth() {
      return Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
  }

  #sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }

  async authenticate() {
      try {
          const response = await axios({
              method: 'post',
              url: 'https://zoom.us/oauth/token',
              params: {
                  grant_type: 'account_credentials',
                  account_id: this.accountId
              },
              headers: {
                  'Authorization': `Basic ${this.#generateBasicAuth()}`
              }
          });

          if (!response?.data?.access_token) {
              throw new Error('No access token received from Zoom');
          }

          this.token = response.data.access_token;
          return this.token;

      } catch (error) {
          console.error('Zoom authentication error:', {
              message: error.message,
              status: error.response?.status,
              data: error.response?.data,
              config: {
                  url: error.config?.url,
                  method: error.config?.method,
                  params: {
                      ...error.config?.params,
                      account_id: '[MASKED]'
                  }
              }
          });
          throw error;
      }
  }

  /**
   * Make authenticated request to Zoom API with automatic pagination
   */
  async requestData(endpoint, options = {}) {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios({
        ...options,
        url: `https://api.zoom.us/v2/${endpoint}`,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (options.getLengthOnly) {
        return response.data.total_records;
      }

      if (options.verbose) {
        console.log({ ...response, config: { ...response.config, headers: '[REDACTED]' } });
      }

      // Handle different response structures
      const items = options.dataType 
        ? response.data[options.dataType] 
        : (response.data.zoom_rooms || response.data.meetings || response.data.users || response.data.rooms || response.data);
      
      // Handle non-array responses
      if (!Array.isArray(items)) {
        return response.data;
      }

      // Paginate array responses
      let allData = [...items];
      let nextPageToken = response.data.next_page_token || '';
      
      while (nextPageToken) {
        await this.#sleep(2000);

        const nextResponse = await axios({
          ...options,
          url: `https://api.zoom.us/v2/${endpoint}`,
          params: { ...options.params, next_page_token: nextPageToken },
          headers: { ...options.headers, 'Authorization': `Bearer ${this.token}` }
        });

        const nextItems = options.dataType 
          ? nextResponse.data[options.dataType]
          : (nextResponse.data.zoom_rooms || nextResponse.data.meetings || nextResponse.data.users || nextResponse.data.rooms || nextResponse.data);

        if (Array.isArray(nextItems)) {
          allData = allData.concat(nextItems);
        }

        nextPageToken = nextResponse.data.next_page_token || '';
      }

      return allData;

    } catch (error) {
      throw {
        error: true,
        endpoint,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
  }

  async getRoomsInMeeting() {
    if (!this.rooms) {
      this.rooms = await this.requestData('rooms');
    }
    this.roomsInMeeting = this.rooms.filter(room => room.status === 'InMeeting');
    return this.roomsInMeeting;
  }

  async getMeetingDetails(meetingId) {
    try {
      const endpoint = `meetings/${meetingId}`;
      const meetingData = await this.requestData(endpoint);
      return meetingData;
    } catch (error) {
      const errorResponse = {
        error: true,
        status: error.response?.status || 500,
        message: error.message || 'Unknown error',
        endpoint: `meetings/${meetingId}`
      };      
      return errorResponse;
    }
  }

  async getZoomRoomDetails(id) {
    try {
      const roomData = await this.requestData(`rooms/${id}`);
      return roomData ? roomData : false;
    } catch (error) {
      return error.code;   
    }
  }

  // Group processed rooms by city
  groupRoomsByCity(rooms) {
    const groupedRooms = {};
    rooms.forEach(room => {
      groupedRooms[room.city] = groupedRooms[room.city] || [];
      groupedRooms[room.city].push(room);
    });
    return groupedRooms;
  }

  async findUserByDisplayName(name) {
    if (!this.users) {
      this.users = await this.requestData('users');
    }
    return this.users.find(user => user.display_name === name) || false;
  }

  async getAllRoomMeetings(options = {}) {
    try {
      const calendar = await this.requestData('rooms/calendar/services');
      if (!calendar.calendar_services?.length) {
        throw new Error('No calendar services found');
      }
      
      const resources = await this.requestData(
        `rooms/calendar/services/${calendar.calendar_services[0].calendar_service_id}/resources`, 
        { dataType: 'calendar_resources' }
      );
      
      const roomsWithIds = resources.filter(room => room.assigned_room_id);
      console.log(`Found ${roomsWithIds.length} rooms with assigned IDs, fetching meetings...`);
      
      const allRoomMeetings = [];
      
      for (const room of roomsWithIds) {
        if (options.target && !room.calendar_resource_name.includes(options.target)) continue;
        
        try {
          console.log(`Fetching meetings for ${room.calendar_resource_name}...`);
          const meetings = await this.requestData(`users/${room.assigned_room_id}/meetings`, {
            params: { type: 'upcoming' }
          });
          
          const meetingsWithRoomInfo = meetings.map(meeting => ({
            ...meeting,
            room_info: {
              calendar_resource_name: room.calendar_resource_name,
              calendar_resource_email: room.calendar_resource_email,
              assigned_room_id: room.assigned_room_id
            }
          }));
          
          allRoomMeetings.push(...meetingsWithRoomInfo);
          await this.#sleep(2000);
        } catch (error) {
          console.error(`Error fetching meetings for ${room.calendar_resource_name}:`, error.message);
        }
      }
      
      console.log(`Successfully fetched ${allRoomMeetings.length} total meetings from ${roomsWithIds.length} rooms`);
      return allRoomMeetings;
    } catch (error) {
      console.error('Error in getAllRoomMeetings:', error.message);
      throw error;
    }
  }

  // Generic filter method that works with any config filters
  applyFilters(room, filters = config.zoom.filters) {
    return Object.entries(filters).every(([key, values]) => {
      const isNegative = key.startsWith('!');
      const prop = isNegative ? key.slice(1) : key;
      const matches = values.some(val => room[prop]?.includes(val));
      return isNegative ? !matches : matches;
    });
  }

  async listZoomRoomIds() {
    if (!this.rooms) {
      this.rooms = await this.requestData('rooms');
    }
    return this.rooms.map(room => room.id);
  }

  async validateHostId(inputId) {
    try {
      const roomIds = await this.listZoomRoomIds();
      const isRoom = roomIds.includes(inputId);
      return { code: 200, type: isRoom ? 'Room' : 'User' };
    } catch (error) {
      return { code: 404, type: null, error };
    }
  }

  // Get device information for a specific room
  async getRoomDevices(roomId, roomName) {
    try {
      const deviceData = await this.requestData(`rooms/${roomId}/devices`);
      return deviceData;
    } catch (error) {
      console.error(`Failed to get devices for room ${roomName || roomId}:`, error.message);
      return {
        error: true,
        roomId,
        message: error.message,
        devices: []
      };
    }
  }

  async getAllRoomDevices() {
    try {
      if (!this.rooms) {
        this.rooms = await this.requestData('rooms');
      }
      
      const roomDevices = [];
      for (const room of this.rooms) {
        try {
          await this.#sleep(3000);
          const devices = await this.getRoomDevices(room.id, room.name);
          roomDevices.push({
            roomId: room.id,
            roomName: room.name,
            locationId: room.location_id,
            devices: devices.error ? [] : (devices.devices || devices),
            error: devices.error || false,
            errorMessage: devices.message || null
          });
          // await this.#sleep(2000);
        } catch (error) {
          console.error(`Error getting devices for room ${room.name}:`, error.message);
          roomDevices.push({
            roomId: room.id,
            roomName: room.name,
            locationId: room.location_id,
            devices: [],
            error: true,
            errorMessage: error.message
          });
        }
      }
      return roomDevices;
    } catch (error) {
      console.error('Failed to get room devices:', error);
      throw error;
    }
  }

  /**
   * Process raw room data into standardized format for Slack reporting
   */
  async processRoomsToStandardFormat(rawRooms) {
    await this.#ensureLocationDataLoaded();
    
    const processedRooms = [];
    
    for (const room of rawRooms) {
      const standardRoom = {
        name: room.room_name,
        health: room.issue_details?.health_status || room.health || 'noissue',
        status: room.issue_details?.status || room.status,
        issues: room.issue_details?.issues || room.issues || [],
        device_info: room.issue_details?.device_info || room.device_ip,
        country: room.location_data?.country || room.location?.country,
        city: room.location_data?.city || room.location?.city,
        floor: room.location_data?.floor || room.location?.floor,
        email: room.email
      };

      // Add location data if not already present
      if (!standardRoom.country && room.location_id) {
        const location = await this.getRoomLocationData(room.location_id);
        standardRoom.country = location.country;
        standardRoom.city = location.city;
        standardRoom.floor = location.floor;
      }

      processedRooms.push(standardRoom);
    }
    
    return processedRooms;
  }

  async getSubLocationById(id) {
    await this.#ensureLocationDataLoaded();
    return this.locations.find(location => location.id === id) || false;
  }

  async #ensureLocationDataLoaded() {
    if (!this.locations) {
      this.locations = await this.requestData('rooms/locations', { dataType: 'locations' });
    }
    if (!this.locationStructure) {
      this.locationStructure = await this.requestData('rooms/locations/structure');
    }
  }

  async getRoomLocationData(id) {
    await this.#ensureLocationDataLoaded();
    const floor = await this.getSubLocationById(id);
    const city = await this.getSubLocationById(floor.parent_location_id);
    const country = await this.getSubLocationById(city.parent_location_id);
    return { country: country.name, city: city.name, floor: floor.name };
  }

  async getRoomsWithIssues(options = {}) {
    this.rooms = await this.requestData('metrics/zoomrooms', { params: { page_size: 100 } });
    
    this.roomsWithIssues = [];
    for (const room of this.rooms) {
      if (room.health === 'noissue') continue;
      
      room.location_data = await this.getRoomLocationData(room.location_id);
      room.issue_details = {
        health_status: room.health,
        status: room.status,
        issues: room.issues.filter(issue => issue !== ''),
        device_info: room.device_ip
      };
      this.roomsWithIssues.push(room);
    }

    if (options.includeTotalCount) {
      return { roomsWithIssues: this.roomsWithIssues, totalRooms: this.rooms.length };
    }
    return this.roomsWithIssues;
  }
  
  /**
   * Get rooms with issues, filtered and grouped by city for Slack reporting
   */
  async getSlackRooms() {
    const roomsWithIssues = await this.getRoomsWithIssues();
    const processedRooms = await this.processRoomsToStandardFormat(roomsWithIssues);
    const filteredRooms = processedRooms.filter(room => this.applyFilters(room));
    return this.groupRoomsByCity(filteredRooms);
  }

  /**
   * Get Zoom's daily report data for the current month
   */
  async getDailyReportData() {
    const dailyReport = await this.requestData('report/daily', {
      params: { month: new Date().getMonth() + 1 }
    });
    return dailyReport.dates;
  }

  /**
   * Collect all daily update data: room issues, daily report, and device info
   */
  async dailyUpdate() {
    const slackRooms = await this.getSlackRooms();
    const dailyReportData = await this.getDailyReportData();
    const roomDevices = await this.getAllRoomDevices();
    return { slackRooms, dailyReportData, roomDevices };
  }
}

export default Zoom;
