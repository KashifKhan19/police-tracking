import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import * as Location from 'expo-location';


import LoginScreen from './components/SignInScreen';
import HomeScreen from './components/homeScreen';

const Stack = createStackNavigator();

const App = () => {
  const [isLogged, setIsLogged] = useState(false);

  const checkToken = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      setIsLogged(true);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  const requestPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }
  
    let backgroundPermission = await Location.requestBackgroundPermissionsAsync();
    if (backgroundPermission.status !== 'granted') {
      alert('Permission to access background location was denied');
      return;
    }
  };
  
  // Call this function in useEffect or componentDidMount
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLogged ? (<Stack.Screen name="HomeScreen" component={HomeScreen} />) 
        : (<><Stack.Screen name="LoginScreen" component={LoginScreen} /> 
        <Stack.Screen name="HomeScreen" component={HomeScreen} /> 
        </>)}
         
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
