import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Alert, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';

// Extend AxiosInstance with our custom methods
interface CustomAxiosInstance extends AxiosInstance {
    setToken(token: string): Promise<void>;
    clearToken(): Promise<void>;
}

// Get the API URL from environment
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://your-api.com';
const ENV = Constants.expoConfig?.extra?.environment || 'development';

// Create the axios instance
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor with enhanced security
axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            // Add auth token
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Add security headers
            const timestamp = Date.now().toString();
            const nonce = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                timestamp + Math.random().toString()
            );

            config.headers['X-Request-Timestamp'] = timestamp;
            config.headers['X-Request-Nonce'] = nonce;
            config.headers['X-App-Environment'] = ENV;

            // Remove sensitive data from logs in development
            if (ENV === 'development') {
                const sanitizedConfig = {
                    ...config,
                    headers: {
                        ...config.headers,
                        Authorization: config.headers.Authorization ? '[REDACTED]' : undefined,
                    }
                };
                console.debug('API Request:', sanitizedConfig);
            }

            return config;
        } catch (error) {
            return Promise.reject(error);
        }
    },
    (error) => Promise.reject(error)
);

// Response interceptor with enhanced error handling
axiosInstance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
        return response;
    },
    async (error) => {
        let message = '';

        if (error.response?.status === 401) {
            // Handle unauthorized access
            message = 'Session expired. Please login again';
            
            // Clear the stored token
            await SecureStore.deleteItemAsync('userToken');
            
            // You can add your navigation logic here
            // navigation.replace('Login');
        } else if (error.response?.status === 403) {
            message = 'You don\'t have permission to access this feature';
        } else if (error.response?.status === 429) {
            message = 'Too many requests. Please try again later';
        } else {
            message = error?.response?.data?.error || error.message || error.toString();
        }

        error.message = typeof message === 'string' ? message : JSON.stringify(message);

        // Log error without sensitive data
        console.error('API Error:', {
            status: error.response?.status,
            message: error.message,
            endpoint: error.config?.url,
            method: error.config?.method,
        });

        // Show error using React Native Alert
        Alert.alert(
            'Error',
            error.message || 'Something went wrong...',
            [{ text: 'OK', style: 'cancel' }]
        );

        return Promise.reject(error);
    }
);

// Add custom methods to the axios instance
const apiClient = axiosInstance as CustomAxiosInstance;

// Helper function to store the auth token securely
apiClient.setToken = async (token: string) => {
    try {
        const options: SecureStore.SecureStoreOptions = {
            keychainAccessible: SecureStore.WHEN_UNLOCKED
        };
        
        await SecureStore.setItemAsync('userToken', token, options);
    } catch (error) {
        console.error('Error storing token:', error);
        throw error;
    }
};

// Helper function to clear the auth token
apiClient.clearToken = async () => {
    try {
        await SecureStore.deleteItemAsync('userToken');
    } catch (error) {
        console.error('Error clearing token:', error);
        throw error;
    }
};

export default apiClient;
