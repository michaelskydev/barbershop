import { Platform } from 'react-native';

const localhost = Platform.select({
    android: '10.2.32.31', // Updated for physical device
    ios: '10.2.32.31',
    default: '10.2.32.31',
});

// Using machine's LAN IP for physical device connectivity
export const API_URL = `http://${localhost}:3000/api`;
