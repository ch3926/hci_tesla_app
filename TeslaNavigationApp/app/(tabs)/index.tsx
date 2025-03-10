import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { dpWaypointOptimizer, fetchChargingStations, fetchTeslaBatteryInfo } from '../../src/routeOptimizer';

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// This is your main screen component
export default function MapScreen() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination] = useState({ latitude: 34.0522, longitude: -118.2437 }); // Los Angeles
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [chargingStations, setChargingStations] = useState([]);
  const [batteryInfo, setBatteryInfo] = useState({ currentBattery: 0, maxBattery: 100 });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    })();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchData();
      const intervalId = setInterval(fetchData, 60000); // Update every minute
      return () => clearInterval(intervalId);
    }
  }, [currentLocation]);

  const fetchData = async () => {
    try {
      const stations = await fetchChargingStations([currentLocation.latitude, currentLocation.longitude], 50000);
      setChargingStations(stations);

      const battery = { currentBattery: 75, maxBattery: 100 };
      setBatteryInfo(battery);

      await updateRoute(stations, battery);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateRoute = async (stations, battery) => {
    if (!currentLocation) return;

    try {
      const optimizedWaypoints = await dpWaypointOptimizer(
        [currentLocation.latitude, currentLocation.longitude],
        [destination.latitude, destination.longitude],
        battery.currentBattery,
        battery.maxBattery,
        stations
      );

      setOptimizedRoute(optimizedWaypoints);
      await fetchRoutePolyline([currentLocation, ...optimizedWaypoints.map(station => station.location), destination]);
    } catch (error) {
      console.error('Error updating route:', error);
    }
  };

  const fetchRoutePolyline = async (waypoints) => {
    const waypointsString = waypoints.map(wp => `${wp.latitude},${wp.longitude}`).join('|');
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destination.latitude},${destination.longitude}&waypoints=${waypointsString}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const points = data.routes[0].overview_polyline.points;
      const decodedPoints = decodePolyline(points);
      setRoutePolyline(decodedPoints);
    } catch (error) {
      console.error('Error fetching route polyline:', error);
    }
  };

  const decodePolyline = (encoded) => {
    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return poly;
  };

  return (
    <View style={styles.container}>
      {currentLocation && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker coordinate={currentLocation} title="You are here" />
          <Marker coordinate={destination} title="Destination" />
          {optimizedRoute.map((waypoint, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: waypoint.latitude, longitude: waypoint.longitude }}
              title={waypoint.title}
              description={waypoint.description}
            />
          ))}
          <Polyline coordinates={routePolyline} strokeColor="#000" strokeWidth={2} />
        </MapView>
      )}
      <Button title="Update Route" onPress={fetchData} />
      <Text>Battery: {batteryInfo.currentBattery}% / {batteryInfo.maxBattery}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});