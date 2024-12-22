import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Text, Image, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
    const [cnic, setCNIC] = useState();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!cnic || !password) {
            Alert.alert('Please enter all fields');
            return;
        }
        setLoading(true);
        const cnicNumber = Number(cnic);
        try {
            const response = await axios.post('http://192.168.18.26:8080/signin', { cnic: cnicNumber, password: password });
            await AsyncStorage.setItem('userToken', response.data.token);
            navigation.navigate('HomeScreen');
        } catch (error) {
            console.error('Login error:', error);
            setError('Invalid CNIC or password. Please try again.');
        } finally {
            setLoading(false);
            const token = await AsyncStorage.getItem('userToken');
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.loginText}>
                    <Image style={{ width: "70%", height: '70%', resizeMode: 'contain', }} source={require('../assets/Balochistan_Police_Logo.png')} />
                    <Text style={{ fontSize: 26, fontWeight: 'bold' }}>Enter CNIC and password to Login</Text>
                </View>
                <View style={styles.content}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Enter Your CNIC</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={text => setCNIC(text)}
                        value={cnic}
                        placeholder="Enter CNIC"
                        keyboardType="numeric"
                    />
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Enter Password</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={text => setPassword(text)}
                        value={password}
                        placeholder="Enter Password"
                        secureTextEntry={true}
                    />
                    {loading ? (<ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 50 }} />)
                        : (<TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Login</Text>
                        </TouchableOpacity>
                        )}
                    {error && <View style={{ margin: 10 }}><Text style={{ color: 'red' }}>{error}</Text></View>}
                </View>
            </ScrollView>
        </KeyboardAvoidingView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    input: {
        padding: 20,
        borderWidth: 0.5,
        marginVertical: 20
    },
    button: {
        width: '80%',
        padding: 20,
        alignItems: 'center',
        marginHorizontal: 50,
        backgroundColor: '#b6c2e3',
        borderRadius: 10,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loginText: {
        flex: 1 / 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    content: {
        flex: 1 / 4,
        justifyContent: 'center',
        paddingHorizontal: 30,
        backgroundColor: "#e6e7e8",
        marginHorizontal: 10,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 5,
            height: 5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        top: 10
    }
});

export default LoginScreen;