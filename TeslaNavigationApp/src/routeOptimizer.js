export class ChargingStation {
    constructor(id, location, name, availableSpots) {
        this.id = id;
        this.location = location;
        this.name = name;
        this.availableSpots = availableSpots;
    }
}

// Hardcoded test route data
const TEST_ROUTE = [
    {
        latitude: 37.7749,
        longitude: -122.4194,
        title: "Start",
        description: "San Francisco"
    },
    {
        latitude: 37.3541,
        longitude: -121.9552,
        title: "Santa Clara Supercharger",
        description: "8 stalls available"
    },
    {
        latitude: 37.3688,
        longitude: -122.0363,
        title: "Los Altos Supercharger",
        description: "12 stalls available"
    },
    {
        latitude: 37.3387,
        longitude: -121.8853,
        title: "Destination",
        description: "San Jose"
    }
];

export async function dpWaypointOptimizer(start, end, currentBattery, maxBattery, stations) {
    // Calculate distances using Haversine formula (simplified for demo)
    const calculateDistance = (point1, point2) => {
        const [lat1, lon1] = point1;
        const [lat2, lon2] = point2;
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

    // Car specifications (hardcoded for demo)
    const BATTERY_EFFICIENCY = 5; // km per kWh
    const currentRange = currentBattery * BATTERY_EFFICIENCY;
    
    // Filter reachable stations
    const reachableStations = stations.filter(station => {
        const distanceToStation = calculateDistance(start, station.location);
        const distanceToDestination = calculateDistance(station.location, end);
        return distanceToStation <= currentRange && distanceToDestination <= (maxBattery * BATTERY_EFFICIENCY);
    });

    if (reachableStations.length === 0) {
        throw new Error("No reachable charging stations with current battery level");
    }

    // Select optimal station (simplified: closest to destination)
    const optimalStation = reachableStations.reduce((prev, current) => {
        const prevDist = calculateDistance(prev.location, end);
        const currentDist = calculateDistance(current.location, end);
        return currentDist < prevDist ? current : prev;
    });

    return [
        {
            latitude: optimalStation.location[0],
            longitude: optimalStation.location[1],
            title: optimalStation.name,
            description: `Recommended stop (${Math.round(currentRange)}km range)`
        }
    ];
}


export async function fetchChargingStations() {
    return [
        new ChargingStation("1", [37.3541, -121.9552], "Santa Clara Station", 8),
        new ChargingStation("2", [37.3688, -122.0363], "Los Altos Station", 12),
        new ChargingStation("3", [34.0722, -118.2737], "Coastal Station", 6)
    ];
}

export async function fetchTeslaBatteryInfo() {
    return { currentBattery: 65, maxBattery: 100 };
}