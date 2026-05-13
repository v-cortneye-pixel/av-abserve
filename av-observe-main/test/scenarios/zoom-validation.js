import { 
    Zoom, QREM, Slack, Microsoft
} from '@av-observe/shared/modules/index.js';

/**
 * Test scenarios for specific debugging needs
 * Usage: node test/scenarios/zoom-validation.js [scenario-name]
 */

const scenarios = {
    'host-validation': async () => {
        console.log('🔍 Testing Zoom Host ID Validation...');
        const zoom = new Zoom();
        const testHostId = "T3Un3uA7Qka4dcC2Va269Q";
        const result = await zoom.validateHostId(testHostId);
        console.log(`Host ID ${testHostId}:`, result);
    },

    'offline-rooms': async () => {
        console.log('🔍 Testing Offline Rooms Detection...');
        const zoom = new Zoom();
        const offlineRooms = await zoom.getOfflineRooms();
        console.log(`Found ${offlineRooms.length} rooms with issues`);
        
        offlineRooms.slice(0, 3).forEach(room => {
            console.log(`\nRoom: ${room.room_name}`);
            console.log(`Health: ${room.issue_details.health_status}`);
            console.log(`Status: ${room.issue_details.status}`);
            console.log(`Issues: ${room.issue_details.issues}`);
        });
    },

    'calendar-integration': async () => {
        console.log('🔍 Testing Calendar Integration...');
        const zoom = new Zoom();
        const ms = new Microsoft();
        
        const msRooms = await zoom.getMsRoomsWithCalendar();
        console.log(`Found ${msRooms.length} MS-integrated rooms`);
        
        const calendarData = await zoom.getMsCalendarBySite(ms);
        Object.entries(calendarData).forEach(([site, rooms]) => {
            const meetingCount = rooms.reduce((sum, room) => 
                sum + (room.events?.length || 0), 0
            );
            console.log(`${site}: ${rooms.length} rooms, ${meetingCount} meetings`);
        });
    },

    'site-alerts': async () => {
        console.log('🔍 Testing Site-Specific Alert Format...');
        const zoom = new Zoom();
        const ms = new Microsoft();
        
        // Simulate data structure
        const mockSiteData = {
            'SFO': {
                zoom: [], // No issues
                microsoft: await zoom.getMsCalendarBySite(ms).then(data => data.SFO || [])
            }
        };
        
        // Test the alert generation logic
        console.log('Mock site data:', JSON.stringify(mockSiteData, null, 2));
    }
};

// Run specific scenario or show available scenarios
const scenarioName = process.argv[2];

if (scenarioName && scenarios[scenarioName]) {
    scenarios[scenarioName]().catch(console.error);
} else {
    console.log('Available scenarios:');
    Object.keys(scenarios).forEach(name => {
        console.log(`  node test/scenarios/zoom-validation.js ${name}`);
    });
}
