import axios from 'axios';

const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";
// const TESLA_API_BASE_URL = "https://owner-api.teslamotors.com/api/1";
// const TESLA_API_TOKEN = "YOUR_TESLA_API_TOKEN";
const OPENWEATHERMAP_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY";

export class ChargingStation {
    constructor(id, location, name, availableSpots) {
        this.id = id;
        this.location = location;
        this.name = name;
        this.availableSpots = availableSpots;
    }
}

class Node {
    constructor(station, batteryLevel) {
        this.station = station;
        this.batteryLevel = batteryLevel;
        this.bestCost = Infinity;
        this.bestPrevNode = null;
    }
}

// TODO: Uncomment when ready to use Google Maps API
// async function calculateDistance(loc1, loc2) {
//     const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${loc1[0]},${loc1[1]}&destinations=${loc2[0]},${loc2[1]}&key=${GOOGLE_MAPS_API_KEY}`;
//     const response = await axios.get(url);
//     return response.data.rows[0].elements[0].distance.value / 1000;
// }

// Hardcoded distance for testing
async function calculateDistance(loc1, loc2) {
    return 10; // Fixed 10km distance for testing
}

async function estimateBatteryNeeded(distance, weatherData) {
    // TODO: Restore Tesla API call when available
    // const headers = { "Authorization": `Bearer ${TESLA_API_TOKEN}` };
    // const response = await axios.get(`${TESLA_API_BASE_URL}/vehicles/1234567890/data_request/charge_state`, { headers });
    // const efficiency = response.data.ideal_battery_range / response.data.battery_range;
    const efficiency = 0.2;
    
    const tempFactor = 1 + (20 - weatherData.temperature) / 100;
    const windFactor = 1 + weatherData.windSpeed / 100;

    return distance / (efficiency * tempFactor * windFactor);
}

// TODO: Uncomment when ready to use Google Maps API
// async function estimateTravelTime(distance, trafficData) {
//     const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${trafficData.origin}&destinations=${trafficData.destination}&key=${GOOGLE_MAPS_API_KEY}`;
//     const response = await axios.get(url);
//     return response.data.rows[0].elements[0].duration.value / 3600;
// }

// Hardcoded travel time for testing
async function estimateTravelTime(distance, trafficData) {
    return 0.5; // Fixed 30 minutes for testing
}

async function estimateChargingTime(currentBattery, maxBattery) {
    // TODO: Restore Tesla API call when available
    // const headers = { "Authorization": `Bearer ${TESLA_API_TOKEN}` };
    // const response = await axios.get(`${TESLA_API_BASE_URL}/vehicles/1234567890/data_request/charge_state`, { headers });
    // const chargeRate = response.data.charge_rate;
    const chargeRate = 150;
    
    return (maxBattery - currentBattery) / chargeRate;
}

// TODO: Uncomment when ready to use OpenWeatherMap API
// async function getWeatherData(lat, lon) {
//     const url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
//     const response = await axios.get(url);
//     return {
//         temperature: response.data.main.temp,
//         windSpeed: response.data.wind.speed,
//     };
// }

// Hardcoded weather data for testing
async function getWeatherData(lat, lon) {
    return { temperature: 20, windSpeed: 5 };
}

function getTrafficData(origin, destination) {
    return {
        origin: `${origin[0]},${origin[1]}`,
        destination: `${destination[0]},${destination[1]}`,
    };
}

export async function dpWaypointOptimizer(start, end, initialBattery, maxBattery, chargingStations) {
    let nodes = [new Node(new ChargingStation("start", start, "Start", null), initialBattery)];
    nodes = nodes.concat(chargingStations.map(station => new Node(station)));
    nodes.push(new Node(new ChargingStation("end", end,"End", null), null));

    nodes[0].bestCost = 0;
    let pq = [[0,nodes[0]]];

    while (pq.length > 0) {
        let [currentCost,currentNode] = pq.shift();

        if (currentNode.station.id === "end") {
            return convertToWaypoints(reconstructPath(currentNode));
        }

        for (let nextNode of nodes) {
            if (nextNode === currentNode) continue;

            // TODO: Restore actual distance calculation
            let distance = 10; // Hardcoded 10km distance

            // TODO: Restore actual weather data
            let weather = { temperature: 20, windSpeed: 5 };

            let batteryNeeded = await estimateBatteryNeeded(distance, weather);

            if (currentNode.batteryLevel < batteryNeeded) continue;

            let traffic = getTrafficData(currentNode.station.location, nextNode.station.location);
            
            // TODO: Restore actual travel time calculation
            let timeToNext = 0.5; // Hardcoded 30 minutes

            let chargingTime = 0;
            if (nextNode.station.id !== "end") {
                chargingTime = await estimateChargingTime(currentNode.batteryLevel, maxBattery);
            }

            let newCost = currentCost + timeToNext + chargingTime;
            let newBattery = Math.min(maxBattery, currentNode.batteryLevel - batteryNeeded + chargingTime * chargeRate);

            if (newCost < nextNode.bestCost) {
                nextNode.bestCost = newCost;
                nextNode.bestPrevNode = currentNode;
                nextNode.batteryLevel = newBattery;
                pq.push([newCost,nextNode]);
                pq.sort((a,b) => a[0] - b[0]);
            }
        }
    }
    return [];
}

function reconstructPath(endNode) {
    let path = [];
    let current = endNode;
    while (current.bestPrevNode) {
        if (!["start","end"].includes(current.station.id)) {
            path.push(current.station);
        }
        current = current.bestPrevNode;
    }
    return path.reverse();
}

function convertToWaypoints(path) {
    return path.map(station => ({
        latitude: station.location[0],
        longitude: station.location[1],
        title: station.name,
        description: `Available spots: ${station.availableSpots}`
    }));
}

// TODO: Uncomment when ready to use Google Places API
// export async function fetchChargingStations(location,radius) {
//     const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location[0]},${location[1]}&radius=${radius}&type=electric_vehicle_charging_station&key=${GOOGLE_MAPS_API_KEY}`;
//     const response = await axios.get(url);
//     return response.data.results.map((station,index) =>
//         new ChargingStation(
//             station.place_id,
//             [station.geometry.location.lat(),station.geometry.location.lng()],
//             station.name,
//             station.business_status === 'OPERATIONAL' ? 1 : 0
//         )
//     );
// }

// Hardcoded charging stations for testing
export async function fetchChargingStations(location,radius) {
    return [
        new ChargingStation("1", [34.0522, -118.2437], "Downtown Station", 4),
        new ChargingStation("2", [34.0622, -118.2537], "Westside Station", 2)
    ];
}

export async function fetchTeslaBatteryInfo() {
    return { currentBattery: 75, maxBattery: 100 };
}
