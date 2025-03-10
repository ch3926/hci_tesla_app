import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { dpWaypointOptimizer, fetchChargingStations, fetchTeslaBatteryInfo } from '../../src/routeOptimizer';

// Test coordinates for Silicon Valley area
const START_LOCATION = { latitude: 37.7749, longitude: -122.4194 }; // SF
const DESTINATION = { latitude: 37.3387, longitude: -121.8853 }; // San Jose

export default function MapScreen() {
    const [currentLocation] = useState(START_LOCATION);
    const [optimizedRoute, setOptimizedRoute] = useState([]);
    const [routePolyline, setRoutePolyline] = useState([]);
    const [chargingStations, setChargingStations] = useState([]);
    const [batteryInfo, setBatteryInfo] = useState({ 
        currentBattery: 65, 
        maxBattery: 100 
    });

    useEffect(() => {
        const initializeRoute = async () => {
            const stations = await fetchChargingStations();
            const waypoints = await dpWaypointOptimizer();
            
            setChargingStations(stations);
            setOptimizedRoute(waypoints);
            
            // Create polyline coordinates
            const polyline = waypoints.map(point => ({
                latitude: point.latitude,
                longitude: point.longitude
            }));
            setRoutePolyline(polyline);
        };

        initializeRoute();
    }, []);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: START_LOCATION.latitude,
                    longitude: START_LOCATION.longitude,
                    latitudeDelta: 0.5,
                    longitudeDelta: 0.5,
                }}
            >
                {/* Current Location Marker */}
                <Marker
                    coordinate={currentLocation}
                    title="Your Location"
                    pinColor="blue"
                />

                {/* Destination Marker */}
                <Marker
                    coordinate={DESTINATION}
                    title="Destination"
                    pinColor="green"
                />

                {/* Charging Station Markers */}
                {chargingStations.map(station => (
                    <Marker
                        key={station.id}
                        coordinate={{
                            latitude: station.location[0],
                            longitude: station.location[1]
                        }}
                        title={station.name}
                        description={`Available spots: ${station.availableSpots}`}
                        pinColor="orange"
                    />
                ))}

                {/* Route Polyline */}
                <Polyline
                    coordinates={routePolyline}
                    strokeColor="#FF0000"
                    strokeWidth={4}
                />
            </MapView>

            {/* Battery Display */}
            <View style={styles.batteryContainer}>
                <Text style={styles.batteryText}>
                    Battery: {batteryInfo.currentBattery}% / {batteryInfo.maxBattery}%
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 3,
    },
    batteryContainer: {
        padding: 20,
        backgroundColor: 'white',
        alignItems: 'center'
    },
    batteryText: {
        fontSize: 18,
        fontWeight: 'bold'
    }
});