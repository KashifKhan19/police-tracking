import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { Marker, Polygon } from "react-native-maps";
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; 0

// import { startLocationUpdates, isLocationUpdateRunning } from "../task/locationTask";
// import { startBackgroundTask, stopBackgroundTask } from "../task/locationTask";


const HomeScreen = () => {
    const [location, setLocation] = useState(null);
    const [station, setStation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [userToken, setUserToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    const mapRef = useRef(null);

    // useEffect(() => {
    //     async function initializeBackgroundTask() {
    //       try {
    //         await startBackgroundTask();
    //         console.log('Background task started successfully');
    //       } catch (error) {
    //         console.error('Failed to start background task:', error);
    //       }
    //     }

    //     initializeBackgroundTask();

    //     // Clean up: Stop background task when component unmounts
    //     return () => {
    //       async function cleanupBackgroundTask() {
    //         try {
    //           await stopBackgroundTask();
    //           console.log('Background task stopped successfully');
    //         } catch (error) {
    //           console.error('Failed to stop background task:', error);
    //         }
    //       }

    //       cleanupBackgroundTask();
    //     };
    //   }, []);


    const sendLocationToBackend = async (token) => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }
        console.log(userToken)
        const backendUrl = 'http://192.168.18.26:8080/updatelocation';

        // Example using axios (replace with fetch() if preferred)
        axios.post(backendUrl, {
            authorization: userToken,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        })
            .then(response => {
                console.log('Location sent successfully:', response.data);
            })
            .catch(error => {
                console.error('Error sending location:', error);
            });
    };

    useEffect(() => {
        (async () => {
            checkLocationPermission()
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setLocation(location)
            getUserToken();
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
            sendLocationToBackend();
        }, 5000); // Send location every 5 seconds

        // Clean up interval on component unmount
        return () => clearInterval(sendLocationInterval);
    }, []);


    const getUserToken = async () => {
        const token = await AsyncStorage.getItem('userToken');
        fetchStations(token)
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
            setUserData(response.data.user)

        } catch (error) {
            setErrorMsg("Error: ", error);
        } finally {
            setLoading(false)
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
        if (station && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000); // 1000ms for animation duration
        }
    }

    const checkLocationPermission = async () => {
        const foregroundPermission = await Location.requestForegroundPermissionsAsync();
        if (foregroundPermission.status !== 'granted') {
            setErrorMsg('Foreground permission to access location was denied');
            console / log(errorMsg)
            return false;
        }

        const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
        if (backgroundPermission.status !== 'granted') {
            setErrorMsg('Background permission to access location was denied');
            console / log(errorMsg)
            return false;
        }

        return true;
    };


    return (
        <View style={[loading ? { flex: 1, justifyContent: 'center' } : styles.container]}>
            {loading ? (<Text></Text>) : (
                <View style={styles.footer}>
                    <TouchableOpacity onPress={moveToMe}>
                        <Text style={styles.footerText}>Mr: {userData.fullName}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={moveToStation}>
                        <Text style={styles.footerText}>Your Station: {station.name}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? <ActivityIndicator /> : (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >

                    <Marker coordinate={location.coords} title="Your Location" />
                    {/* <Marker
                        coordinate={{
                            latitude: station.stationLocation.cords[0],
                            longitude: station.stationLocation.cords[1]
                        }}
                        title="Station Location"
                    /> */}

                    <Polygon
                        coordinates={station.area.map(coord => ({ latitude: coord[0], longitude: coord[1] }))}
                        fillColor="rgba(255, 0, 0, 0.5)"
                        strokeColor="#FF0000"
                        strokeWidth={2}
                    />

                </MapView>
            )}

        </View>
    )

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
        borderRadius: 10,
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
})


