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

export async function dpWaypointOptimizer() {
    return TEST_ROUTE;
}

export async function fetchChargingStations() {
    return [
        new ChargingStation("1", [37.3541, -121.9552], "Santa Clara Station", 8),
        new ChargingStation("2", [37.3688, -122.0363], "Los Altos Station", 12)
    ];
}

export async function fetchTeslaBatteryInfo() {
    return { currentBattery: 65, maxBattery: 100 };
}