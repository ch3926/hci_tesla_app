import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const RECENT_ROUTES = [
    { id: 'sf-sj', label: 'San Francisco → San Jose', start: 'San Francisco', end: 'San Jose' },
    { id: 'nyc-bk', label: 'Manhattan → Brooklyn', start: 'Manhattan', end: 'Brooklyn' }
  ];

const SF_START = { latitude: 37.7749, longitude: -122.4194 };
const SF_END = { latitude: 37.3387, longitude: -121.8853 };

const SF_ROUTE = [
  { latitude: 37.7749, longitude: -122.4194 }, { latitude: 37.7580, longitude: -122.4180 }, { latitude: 37.7520, longitude: -122.4060 },
  { latitude: 37.6560, longitude: -122.4070 }, { latitude: 37.6300, longitude: -122.4110 }, { latitude: 37.6000, longitude: -122.3860 },
  { latitude: 37.5800, longitude: -122.3660 }, { latitude: 37.5470, longitude: -122.3140 }, { latitude: 37.5180, longitude: -122.2750 },
  { latitude: 37.5000, longitude: -122.2600 }, { latitude: 37.4850, longitude: -122.2360 }, { latitude: 37.4530, longitude: -122.1810 },
  { latitude: 37.4240, longitude: -122.1380 }, { latitude: 37.3860, longitude: -122.0830 }, { latitude: 37.3680, longitude: -122.0360 },
  { latitude: 37.3540, longitude: -121.9850 }, { latitude: 37.3387, longitude: -121.8853 }
];

const SF_STATIONS = [
  { id: '1', name: 'Tesla Supercharger - S San Francisco', location: [37.6560, -122.4070], availableSpots: 6, distance: '12 mi', address: '1150 Airport Blvd, S San Francisco', type: 'fast' },
  { id: '2', name: 'Electrify America - San Mateo', location: [37.5470, -122.3140], availableSpots: 4, distance: '25 mi', address: '60 31st Ave, San Mateo', type: 'fast' },
  { id: '3', name: 'EVgo - Palo Alto', location: [37.4240, -122.1380], availableSpots: 2, distance: '38 mi', address: '180 El Camino Real, Palo Alto', type: 'standard' }
];

const NY_START = { latitude: 40.7831, longitude: -73.9712 };
const NY_END = { latitude: 40.6782, longitude: -73.9442 };

const NY_ROUTE = [
  { latitude: 40.7831, longitude: -73.9712 }, { latitude: 40.7681, longitude: -73.9812 }, { latitude: 40.7580, longitude: -73.9855 },
  { latitude: 40.7484, longitude: -73.9857 }, { latitude: 40.7308, longitude: -73.9973 }, { latitude: 40.7061, longitude: -74.0086 },
  { latitude: 40.6939, longitude: -73.9850 }, { latitude: 40.6782, longitude: -73.9442 }
];

const NY_STATIONS = [
  { id: 'ny1', name: 'EVgo - Lower Manhattan', location: [40.7061, -74.0086], availableSpots: 0, distance: '2.3 mi', address: '85 Broad St, New York, NY', type: 'fast' },
  { id: 'ny2', name: 'Tesla Supercharger - Brooklyn', location: [40.6939, -73.9850], availableSpots: 5, distance: '3.7 mi', address: '210 Flatbush Ave, Brooklyn, NY', type: 'standard' }
];

const BatteryDisplay = ({ level }) => {
  const getBatteryColor = () => {
    if (level < 20) return '#FF3B30';
    if (level < 50) return '#FF9500';
    return '#34C759';
  };

  return (
    <View style={styles.batteryContainer}>
      <Ionicons name="battery-full" size={24} color={getBatteryColor()} />
      <Text style={[styles.batteryText, { color: getBatteryColor() }]}>{level}%</Text>
    </View>
  );
};

export default function MapScreen() {
  const router = useRouter();
  const [selectedStation, setSelectedStation] = useState(null);
  const [calloutVisible, setCalloutVisible] = useState(null);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [startLocationInput, setStartLocationInput] = useState('');
  const [endLocationInput, setEndLocationInput] = useState('');
  const [routePoints, setRoutePoints] = useState([]);
  const [chargingStations, setChargingStations] = useState([]);
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);
  const panelPosition = useRef(new Animated.Value(300)).current;
  const batteryLevel = 65;
  const [estimatedTime, setEstimatedTime] = useState('');
  const [estimatedDistance, setEstimatedDistance] = useState('');


  const handleStationPress = (stationId) => {
    const station = chargingStations.find(s => s.id === stationId);
    setSelectedStation(station);
    setCalloutVisible(stationId);
  };

  useEffect(() => {
    Animated.timing(panelPosition, {
      toValue: selectedStation ? 0 : 300,
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true
    }).start();
  }, [selectedStation]);

  return (
    <View style={styles.container}>
      {!navigationStarted && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Text>Start Location:</Text>
            <TextInput
              value={startLocationInput}
              onChangeText={setStartLocationInput}
              placeholder="e.g., San Francisco"
              style={styles.input}
            />
          </View>
          <View style={styles.searchBox}>
            <Text>End Location:</Text>
            <TextInput
              value={endLocationInput}
              onChangeText={setEndLocationInput}
              placeholder="e.g., San Jose"
              style={styles.input}
            />
          </View>
          <View style={{ marginBottom: 20 }}>
  <Text style={{ fontWeight: '600', marginBottom: 8 }}>Recent Routes:</Text>
  {RECENT_ROUTES.map(route => (
    <TouchableOpacity
      key={route.id}
      style={{
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
        marginBottom: 10
      }}
      onPress={() => {
        setStartLocationInput(route.start);
        setEndLocationInput(route.end);
      }}
    >
      <Text style={{ fontSize: 14 }}>{route.label}</Text>
    </TouchableOpacity>
  ))}
</View>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => {
              const start = startLocationInput.trim().toLowerCase();
              const end = endLocationInput.trim().toLowerCase();
              if (start === 'san francisco' && end === 'san jose') {
                setRoutePoints(SF_ROUTE);
                setChargingStations(SF_STATIONS);
                setStartMarker(SF_START);
                setEndMarker(SF_END);
                setEstimatedTime('1h 15m');
                setEstimatedDistance('48 miles');
                setNavigationStarted(true);
              } else if (start === 'manhattan' && end === 'brooklyn') {
                setRoutePoints(NY_ROUTE);
                setChargingStations(NY_STATIONS);
                setStartMarker(NY_START);
                setEndMarker(NY_END);
                setEstimatedTime('35 min');
                setEstimatedDistance('10 miles');
                setNavigationStarted(true);
              } else {
                Alert.alert('Unsupported Route', 'Try San Francisco to San Jose or Manhattan to Brooklyn.');
              }
            }}
          >
            <Text style={styles.buttonText}>Start Navigation</Text>
          </TouchableOpacity>
        </View>
      )}

      {navigationStarted && (
        <>
          <View style={styles.header}>
            <BatteryDisplay level={batteryLevel} />
            <View style={styles.routeInfo}>
            <View style={styles.infoItem}>
            <MaterialIcons name="timer" size={18} color="#5E5E5E" />
            <Text style={styles.infoText}>{estimatedTime}</Text>
            </View>
            <View style={styles.infoItem}>
            <MaterialIcons name="directions-car" size={18} color="#5E5E5E" />
            <Text style={styles.infoText}>{estimatedDistance}</Text>
            </View>
            </View>
          </View>

          <MapView
            style={styles.map}
            initialRegion={{
              latitude: startMarker?.latitude || 37.65,
              longitude: startMarker?.longitude || -122.25,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
            showsUserLocation={true}
          >
            {startMarker && (
              <Marker coordinate={startMarker}>
                <View style={styles.currentMarker}>
                  <View style={styles.currentMarkerInner} />
                </View>
              </Marker>
            )}

            {endMarker && (
              <Marker coordinate={endMarker}>
                <View style={styles.destinationMarker}>
                  <Ionicons name="flag" size={18} color="white" />
                </View>
              </Marker>
            )}

            {chargingStations.map(station => (
              <Marker
                key={station.id}
                coordinate={{
                  latitude: station.location[0],
                  longitude: station.location[1]
                }}
                onPress={() => handleStationPress(station.id)}
              >
                <View style={[
                  styles.stationMarker,
                  calloutVisible === station.id && styles.stationMarkerSelected,
                  station.type === 'fast' ? styles.fastStation : styles.standardStation
                ]}>
                  <FontAwesome name="bolt" size={14} color="white" />
                </View>
                <Callout onPress={() => handleStationPress(station.id)}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{station.name}</Text>
                    <Text style={styles.calloutSubtitle}>
                      {station.availableSpots} spots • {station.distance}
                    </Text>
                    <Text style={styles.calloutSubtitle}>
                      {station.type === 'fast' ? '150kW • Fast charging' : '50kW • Standard'}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            ))}

            <Polyline
              coordinates={routePoints}
              strokeColor="#4285F4"
              strokeWidth={4}
            />
          </MapView>

          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setNavigationStarted(false);
                setStartLocationInput('');
                setEndLocationInput('');
                setSelectedStation(null);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={20} color="white" />
              <Text style={styles.buttonText}>Change Route</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 10,
    },
    batteryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    batteryText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    routeInfo: {
        flexDirection: 'row',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
    },
    infoText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#5E5E5E',
        fontWeight: '500',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    currentMarker: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#4285F4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    currentMarkerInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4285F4',
    },
    destinationMarker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#34A853',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    stationMarker: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    fastStation: {
        backgroundColor: '#FF9500',
    },
    standardStation: {
        backgroundColor: '#5856D6',
    },
    stationMarkerSelected: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 2,
        borderColor: 'white',
    },
    callout: {
        width: 180,
        padding: 10,
    },
    calloutTitle: {
        fontWeight: '600',
        fontSize: 15,
        marginBottom: 4,
    },
    calloutSubtitle: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    controls: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 25,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4285F4',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 25,
        shadowColor: '#4285F4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonText: {
        color: 'white',
        marginLeft: 8,
        fontWeight: '500',
        fontSize: 15,
    },
    panel: {
        position: 'absolute',
        bottom: 90,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 5,
    },
    panelHidden: {
        opacity: 0,
    },
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    stationTypeIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    fastIcon: {
        backgroundColor: '#FF9500',
    },
    standardIcon: {
        backgroundColor: '#5856D6',
    },
    panelTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    panelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    panelText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#555',
        flex: 1,
    },
    navigateButton: {
        backgroundColor: '#4285F4',
        padding: 14,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    navigateButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginRight: 8,
    },
    searchContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    zIndex: 100,
    },
    searchBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    },
    input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginTop: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    },
    startButton: {
    backgroundColor: '#4285F4',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
}
});