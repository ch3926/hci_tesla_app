import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Animated, Easing } from 'react-native';import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const START_LOCATION = { latitude: 37.7749, longitude: -122.4194 }; // San Francisco
const DESTINATION = { latitude: 37.3387, longitude: -121.8853 }; // San Jose

// Updated route points following Highway 101
const ROUTE_POINTS = [
    // San Francisco - Starting point (Downtown)
    { latitude: 37.7749, longitude: -122.4194 }, 
  
    // SF - Mission District
    { latitude: 37.7580, longitude: -122.4180 },
    
    // SF - Potrero Hill
    { latitude: 37.7520, longitude: -122.4060 },
    
    // South San Francisco
    { latitude: 37.6560, longitude: -122.4070 },
    
    // San Bruno
    { latitude: 37.6300, longitude: -122.4110 },
    
    // Millbrae
    { latitude: 37.6000, longitude: -122.3860 },
    
    // Burlingame
    { latitude: 37.5800, longitude: -122.3660 },
    
    // San Mateo
    { latitude: 37.5470, longitude: -122.3140 },
    
    // Belmont
    { latitude: 37.5180, longitude: -122.2750 },
    
    // San Carlos
    { latitude: 37.5000, longitude: -122.2600 },
    
    // Redwood City
    { latitude: 37.4850, longitude: -122.2360 },
    
    // Menlo Park
    { latitude: 37.4530, longitude: -122.1810 },
    
    // Palo Alto
    { latitude: 37.4240, longitude: -122.1380 },
    
    // Mountain View
    { latitude: 37.3860, longitude: -122.0830 },
    
    // Sunnyvale
    { latitude: 37.3680, longitude: -122.0360 },
    
    // Santa Clara
    { latitude: 37.3540, longitude: -121.9850 },
    
    // San Jose - Destination (Downtown)
    { latitude: 37.3387, longitude: -121.8853 }
  ];
  
  // Updated charging stations along actual highway exits
  const CHARGING_STATIONS = [
    {
      id: '1',
      name: 'Tesla Supercharger - S San Francisco',
      location: [37.6560, -122.4070], // Near SFO
      availableSpots: 6,
      distance: '12 mi',
      address: '1150 Airport Blvd, S San Francisco',
      type: 'fast'
    },
    {
      id: '2',
      name: 'Electrify America - San Mateo',
      location: [37.5470, -122.3140], // Near Hillsdale Mall
      availableSpots: 4,
      distance: '25 mi',
      address: '60 31st Ave, San Mateo',
      type: 'fast'
    },
    {
      id: '3',
      name: 'EVgo - Palo Alto',
      location: [37.4240, -122.1380], // Near Stanford
      availableSpots: 2,
      distance: '38 mi',
      address: '180 El Camino Real, Palo Alto',
      type: 'standard'
    }
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
        <Text style={[styles.batteryText, { color: getBatteryColor() }]}>
          {level}%
        </Text>
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
    const panelPosition = useRef(new Animated.Value(300)).current;
    const batteryLevel = 65;
  
    const handleStationPress = (stationId) => {
      const station = CHARGING_STATIONS.find(s => s.id === stationId);
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
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                if (
                  startLocationInput.trim().toLowerCase() === 'san francisco' &&
                  endLocationInput.trim().toLowerCase() === 'san jose'
                ) {
                  setNavigationStarted(true);
                } else {
                  Alert.alert('Unsupported Route', 'Only San Francisco to San Jose is supported for now.');
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
                  <Text style={styles.infoText}>1h 15m</Text>
                </View>
                <View style={styles.infoItem}>
                  <MaterialIcons name="directions-car" size={18} color="#5E5E5E" />
                  <Text style={styles.infoText}>48 miles</Text>
                </View>
              </View>
            </View>
  
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: 37.65,
                longitude: -122.25,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              }}
              showsUserLocation={true}
            >
              <Marker coordinate={START_LOCATION}>
                <View style={styles.currentMarker}>
                  <View style={styles.currentMarkerInner} />
                </View>
              </Marker>
  
              <Marker coordinate={DESTINATION}>
                <View style={styles.destinationMarker}>
                  <Ionicons name="flag" size={18} color="white" />
                </View>
              </Marker>
  
              {CHARGING_STATIONS.map(station => (
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
                        {station.availableSpots} spots • {station.distance} mi
                      </Text>
                      <Text style={styles.calloutSubtitle}>
                        {station.type === 'fast' ? '150kW • Fast charging' : '50kW • Standard'}
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              ))}
  
              <Polyline
                coordinates={ROUTE_POINTS}
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
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.buttonText}>Recalculate</Text>
              </TouchableOpacity>
            </View>
  
            <Animated.View 
              style={[
                styles.panel,
                { transform: [{ translateY: panelPosition }] },
                !selectedStation && styles.panelHidden
              ]}
            >
              {selectedStation && (
                <>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setSelectedStation(null)}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                  
                  <View style={styles.panelHeader}>
                    <View style={[
                      styles.stationTypeIcon,
                      selectedStation.type === 'fast' ? styles.fastIcon : styles.standardIcon
                    ]}>
                      <FontAwesome name="bolt" size={14} color="white" />
                    </View>
                    <Text style={styles.panelTitle}>{selectedStation.name}</Text>
                  </View>
                  
                  <View style={styles.panelRow}>
                    <Ionicons name="location" size={16} color="#4285F4" />
                    <Text style={styles.panelText}>{selectedStation.address}</Text>
                  </View>
                  
                  <View style={styles.panelRow}>
                    <Ionicons name="flash" size={16} color="#FF9500" />
                    <Text style={styles.panelText}>
                      {selectedStation.availableSpots} charging spots available
                    </Text>
                  </View>
                  
                  <View style={styles.panelRow}>
                    <MaterialIcons name="speed" size={16} color="#34C759" />
                    <Text style={styles.panelText}>
                      {selectedStation.type === 'fast' ? '150kW • Fast charging' : '50kW • Standard charging'}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.navigateButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.navigateButtonText}>Navigate to Station</Text>
                    <MaterialIcons name="navigation" size={20} color="white" />
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
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