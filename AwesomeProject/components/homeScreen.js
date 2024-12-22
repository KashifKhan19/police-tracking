import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation'; // For getting the current location
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
    const [location, setLocation] = useState(null);
    const [station, setStation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [userToken, setUserToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    const mapRef = useRef(null);

    const sendLocationToBackend = async (token) => {
        Geolocation.getCurrentPosition(
            async (position) => {
                const backendUrl = 'http://192.168.18.26:8080/updatelocation';

                // Example using axios (replace with fetch() if preferred)
                try {
                    await axios.post(backendUrl, {
                        authorization: token,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    console.log('Location sent successfully');
                } catch (error) {
                    console.error('Error sending location:', error);
                }
            },
            (error) => {
                console.error('Error getting location:', error);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    };

    useEffect(() => {
        (async () => {
            checkLocationPermission();
            Geolocation.getCurrentPosition(
                (position) => {
                    setLocation(position);
                    getUserToken();
                },
                (error) => {
                    setErrorMsg('Error getting location');
                    console.error(error);
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        })();
    }, []);

    useEffect(() => {
        if (location && station) {
            const markers = [
                { latitude: location.coords.latitude, longitude: location.coords.longitude },
                { latitude: station.stationLocation.cords[1], longitude: station.stationLocation.cords[0] }
            ];

            mapRef.current?.fitToCoordinates(markers, {
                edgePadding: { top: 50, bottom: 50, left: 50, right: 50 },
                animated: true,
            });
        }
    }, [location, station]);

    useEffect(() => {
        const sendLocationInterval = setInterval(() => {
            sendLocationToBackend(userToken);
        }, 5000); // Send location every 5 seconds

        // Clean up interval on component unmount
        return () => clearInterval(sendLocationInterval);
    }, [userToken]);

    const getUserToken = async () => {
        const token = await AsyncStorage.getItem('userToken');
        fetchStations(token);
        setUserToken(token);
        sendLocationToBackend(token);
    }

    const fetchStations = async (token) => {
        try {
            const response = await axios.get('http://192.168.18.26:8080/myStation', {
                headers: {
                    Authorization: token
                }
            });
            setStation(response.data.station);
            setUserData(response.data.user);
        } catch (error) {
            setErrorMsg("Error: " + error);
        } finally {
            setLoading(false);
        }
    }

    const moveToStation = () => {
        if (station && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: station.stationLocation.cords[0],
                longitude: station.stationLocation.cords[1],
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000); // 1000ms for animation duration
        }
    }

    const moveToMe = () => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000); // 1000ms for animation duration
        }
    }

    const checkLocationPermission = async () => {
        Geolocation.requestAuthorization('whenInUse');
    };

    return (
        <View style={[loading ? { flex: 1, justifyContent: 'center' } : styles.container]}>
            {loading ? (<Text>Loading...</Text>) : (
                <View style={styles.footer}>
                    <TouchableOpacity onPress={moveToMe}>
                        <Text style={styles.footerText}>Mr: {userData?.fullName}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={moveToStation}>
                        <Text style={styles.footerText}>Your Station: {station?.name}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? <ActivityIndicator /> : (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: location?.coords.latitude || 37.78825,
                        longitude: location?.coords.longitude || -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    <Marker coordinate={location?.coords} title="Your Location" />
                    {/* <Marker
                        coordinate={{
                            latitude: station?.stationLocation.cords[0],
                            longitude: station?.stationLocation.cords[1]
                        }}
                        title="Station Location"
                    /> */}

                    <Polygon
                        coordinates={station?.area.map(coord => ({ latitude: coord[0], longitude: coord[1] }))}
                        fillColor="rgba(255, 0, 0, 0.5)"
                        strokeColor="#FF0000"
                        strokeWidth={2}
                    />

                </MapView>
            )}

        </View>
    );
}

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#b6c2e3',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        paddingVertical: 20
    },
    footerText: {
        fontSize: 20,
    }
});
