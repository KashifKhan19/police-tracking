import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import axios from 'axios';

const TASK_NAME = 'background-location-task';
const SERVER_URL = 'https://example.com/api/location'; // Replace with your server endpoint

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
    try {
        if (error) {
            console.error('Background task error:', error);
            return;
        }

        if (data) {
            const { locations } = data;
            // Process background location updates
            console.log('Background location update:', locations);

            // Send location data to server
            await sendLocationToServer(locations);
        }

        console.log('Task ran successfully');
    } catch (err) {
        console.error('Error in background task:', err);
    }
});

// Function to send location data to server
async function sendLocationToServer(locations) {
    try {
        const response = await axios.post(SERVER_URL, { locations });
        console.log('Location data sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending location data:', error);
    }
}

// Start the background task
export async function startBackgroundTask() {
    try {
        await Location.startLocationUpdatesAsync(TASK_NAME, {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 60000, // Minimum interval in milliseconds
            distanceInterval: 100, // Minimum distance in meters
            foregroundService: {
                notificationTitle: 'Background location',
                notificationBody: 'Your app is tracking your location in the background',
            },
        });

        console.log('Background location updates started');
    } catch (err) {
        console.error('Error starting background task:', err);
    }
}

// Stop the background task
export async function stopBackgroundTask() {
    try {
        await Location.stopLocationUpdatesAsync(TASK_NAME);
        console.log('Background location updates stopped');
    } catch (err) {
        console.error('Error stopping background task:', err);
    }
}
