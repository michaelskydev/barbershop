import { Platform } from 'react-native';

const localhost = Platform.select({
    android: '10.0.2.2',
    ios: 'localhost',
    default: 'localhost',
});

// If you are running on a physical device, replace 'localhost' with your computer's LAN IP address.
// e.g., '192.168.1.50'
export const API_URL = `http://${localhost}:3000/api`;
