import { Platform } from 'react-native';

const localhost = Platform.select({
    android: '10.0.2.2',
    ios: '10.2.23.12', // Updated for physical device
    default: '10.2.23.12', // Updated for physical device
});

// Using machine's LAN IP for physical device connectivity
export const API_URL = `http://10.2.23.12:3000/api`;
