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

  // Add other Zoom API methods here
  async requestData(endpoint, options = {}) {
    if (!this.token) {
      await this.authenticate();
    }

    let allData = [];
    let nextPageToken = '';
    let pageCount = 0;
    let totalPages = null;
    
    // Make initial request
    try {
      const response = await axios({
        ...options,
        url: `https://api.zoom.us/v2/${endpoint}`,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${this.token}`
        }
      });


      if (options.verbose) {
        const sanitizedResponse = {
          ...response,
          config: {
            ...response.config,
            headers: '[REDACTED]'
          }
        };
        console.log(sanitizedResponse);
      }

      // Handle different response structures
      const items = options.dataType ? response.data[options.dataType] 
        : (response.data.zoom_rooms || response.data.meetings || response.data.users || response.data.rooms || response.data);
      
      if (Array.isArray(items)) {
        allData = allData.concat(items);
        nextPageToken = response.data.next_page_token || '';
        
        // Set total pages if available
        if (response.data.page_count) {
          totalPages = response.data.page_count;
        }
        
        // Only paginate if there's a next_page_token
        while (nextPageToken) {
          pageCount++;
          await this.#sleep(1000);

          const nextResponse = await axios({
            ...options,
            url: `https://api.zoom.us/v2/${endpoint}`,
            params: {
              ...options.params,
              next_page_token: nextPageToken
            },
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${this.token}`
            }
          });

          const nextItems = options.dataType ? nextResponse.data[options.dataType]
            : (nextResponse.data.zoom_rooms || nextResponse.data.meetings || nextResponse.data.users || nextResponse.data.rooms || nextResponse.data);

          if (Array.isArray(nextItems)) {
            allData = allData.concat(nextItems);
          }

          nextPageToken = nextResponse.data.next_page_token || '';
        }

        return allData;
      } else {
        // Return raw response for non-array responses
        return response.data;
      }

    } catch (error) {
      console.error('Zoom API request error:', {
        endpoint,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  async getOfflineRooms() {
    this.offlineRooms = [];
    this.rooms = await this.requestData('metrics/zoomrooms', { params: { page_size: 100 } });
    for (const room of this.rooms) {
      // Include rooms with health issues (not just 'noissue')
      if (room.health !== "noissue") {
        room.location_data = await this.getRoomLocationData(room.location_id);
        // Add detailed issue information
        room.issue_details = {
          health_status: room.health,
          status: room.status,
          issues: room.issues.filter(issue => issue !== ''), // Remove empty issues
          device_info: room.device_ip
        };
        this.offlineRooms.push(room);
      };
    };
    return this.offlineRooms;
  }

  async getRoomsInMeeting() {
    this.roomsInMeeting = [];
    if (!this.rooms) this.rooms = await this.requestData('rooms');
    for (const room of this.rooms) {
      if (room.status == "InMeeting") {
        this.roomsInMeeting.push(room);
      }
    };
    return this.roomsInMeeting;
  }

  async getSubLocationById(id) {
    if (!this.locations) this.locations = await this.requestData('rooms/locations', { dataType: 'locations' });
    if (!this.locationStructure) this.locationStructure = await this.requestData('rooms/locations/structure');

    for (let location of this.locations) { 
      if (location.id == id)  {
        return location
      }
    };
    return false
  }

  async getRoomLocationData(id) {
    if (!this.locations) this.locations = await this.requestData('rooms/locations', { dataType: 'locations' });
    if (!this.locationStructure) this.locationStructure = await this.requestData('rooms/locations/structure');

    const floor = await this.getSubLocationById(id);
    const city = await this.getSubLocationById(floor.parent_location_id);
    const country = await this.getSubLocationById(city.parent_location_id);

    return { 
      country: country.name, 
      city: city.name, 
      floor: floor.name
    }
  }

  async getDailyReportData() {
    const dailyReport = await this.requestData("report/daily", {
        params: {
            month: new Date().getMonth() + 1
        }
    });
    return dailyReport.dates;
  }

  // Process raw room data into standardized format
  async processRoomsToStandardFormat(rawRooms, includeCalendarData = false) {
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

      // Add calendar data if requested
      if (includeCalendarData && room.email) {
        // This will be populated later with Microsoft calendar data
        standardRoom.calendarEvents = [];
      }

      processedRooms.push(standardRoom);
    }
    
    return processedRooms;
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

  // Get offline rooms for daily reporting (existing functionality)
  async dailyUpdate() {
    const fullData = await this.getDailyReportData();
    const offlineRooms = await this.getOfflineRooms();
    
    // Process offline rooms to standard format
    const processedRooms = await this.processRoomsToStandardFormat(offlineRooms);
    
    // Filter for Slack using config filters
    const filteredRooms = processedRooms.filter(room => this.applyFilters(room));
    
    // Group by city
    const slackRooms = this.groupRoomsByCity(filteredRooms);

    return {
      fullData,
      slackRooms
    };
  }

  async findUserByDisplayName(name, options = {}) {
    this.users = this.users || await this.requestData('users');
    for (const user of this.users) {
      if (user.display_name == name) return user;
    };
    return false
  }

  async getAllRoomMeetings(options = {}) {
    try {
      // Get calendar services first
      const calendar = await this.requestData('rooms/calendar/services');
      
      if (!calendar.calendar_services || calendar.calendar_services.length === 0) {
        throw new Error('No calendar services found');
      }
      
      // Get all calendar resources (rooms)
      const resources = await this.requestData(
        `rooms/calendar/services/${calendar.calendar_services[0].calendar_service_id}/resources`, 
        { dataType: "calendar_resources" }
      );
      
      // Filter for rooms that have an assigned_room_id
      const roomsWithIds = resources.filter(room => room.assigned_room_id);
      
      console.log(`Found ${roomsWithIds.length} rooms with assigned IDs, fetching meetings...`);
      
      const allRoomMeetings = [];
      
      for (const room of roomsWithIds) {
        // Skip room if target is specified and doesn't match (partial string matching)
        if (options.target && !room.calendar_resource_name.includes(options.target)) continue;
        
        try {
          console.log(`Fetching meetings for ${room.calendar_resource_name}...`);
          
          const meetings = await this.requestData(`users/${room.assigned_room_id}/meetings`, {
            params: { type: 'upcoming' }
          });
          
          // Add room info to each meeting
          const meetingsWithRoomInfo = meetings.map(meeting => ({
            ...meeting,
            room_info: {
              calendar_resource_name: room.calendar_resource_name,
              calendar_resource_email: room.calendar_resource_email,
              assigned_room_id: room.assigned_room_id
            }
          }));
          
          allRoomMeetings.push(...meetingsWithRoomInfo);
          
          // Sleep to avoid rate limiting
          await this.#sleep(1000);
          
        } catch (error) {
          console.error(`Error fetching meetings for ${room.calendar_resource_name}:`, error.message);
          // Continue with other rooms ev en if one fails
        }
      }
      
      console.log(`Successfully fetched ${allRoomMeetings.length} total meetings from ${roomsWithIds.length} rooms`);
      return allRoomMeetings;
      
    } catch (error) {
      console.error('Error in getAllRoomMeetings:', error.message);
      throw error;
    }
  };

  // Generic filter method that works with any config filters
  applyFilters(room, filters = config.zoom.filters) {
    return Object.entries(filters).every(([key, values]) => {
      const isNegative = key.startsWith('!');
      const prop = isNegative ? key.slice(1) : key;
      const matches = values.some(val => room[prop]?.includes(val));
      return isNegative ? !matches : matches;
    });
  }

  async getMsFilteredRooms() {
    this.rooms = this.rooms || await this.requestData('metrics/zoomrooms', { params: { page_size: 100 } });
    
    const filteredRooms = this.rooms
      .filter(room => room.email != "")
      .filter(room => config.microsoft.filters.some(filter => room.room_name.includes(filter)));
    
    return await Promise.all(filteredRooms.map(async (room) => {
      const location = await this.getRoomLocationData(room.location_id);
      const { room_name, email, health } = room;
      return {
        room_name,
        email,
        location,
        health
      }
    }));
  }

  // Get Microsoft-filtered rooms with calendar data (new functionality)
  async getMsRoomsWithCalendar() {
    // Get Microsoft-filtered rooms (online rooms with emails)
    const msFilteredRooms = await this.getMsFilteredRooms();
    
    // Process to standard format with calendar data placeholder
    const processedRooms = await this.processRoomsToStandardFormat(msFilteredRooms, true);
    
    // Group by city
    const groupedRooms = this.groupRoomsByCity(processedRooms);

    return {
      rooms: processedRooms,
      roomsByCity: groupedRooms
    };
  }

  // Complete Microsoft calendar integration - handles all calendar logic
  async getMsCalendarBySite(microsoftInstance) {
    const msRoomsData = await this.getMsRoomsWithCalendar();
    
    // Process calendar events for each room in parallel
    const calendarPromises = msRoomsData.rooms.map(async (room) => {
      try {
        const events = await microsoftInstance.getTodaysEvents(room.email);
        const eventCount = events.value?.length || 0;
        
        return {
          ...room,
          hasEventsToday: eventCount > 0,
          eventCount,
          events: events.value || [] // For debugging
        };
      } catch (error) {
        console.log(`Could not check calendar for ${room.name}: ${error.message}`);
        return {
          ...room,
          hasEventsToday: false,
          eventCount: 0,
          events: [],
          calendarError: error.message
        };
      }
    });

    const processedRooms = await Promise.all(calendarPromises);
    
    // Group by city/site
    const bySite = {};
    processedRooms.forEach(room => {
      bySite[room.city] = bySite[room.city] || [];
      bySite[room.city].push(room);
    });
    
    return {
      bySite,
      allRooms: processedRooms
    };
  } 

}

export default Zoom;
