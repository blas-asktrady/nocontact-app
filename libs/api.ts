import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig, AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
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

// Flag to determine if we should use local handlers or make actual HTTP requests
// Disable local handlers on web platform to avoid Metro bundling errors
const USE_LOCAL_HANDLERS = 
    Platform.OS !== 'web' && 
    (Constants.expoConfig?.extra?.useLocalHandlers || true);

// Create the axios instance
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('Axios instance created with baseURL:', API_URL);

// Create a simple storage fallback for web platform
const webStorage = {
    getItem: async (key: string) => localStorage.getItem(key),
    setItem: async (key: string, value: string) => localStorage.setItem(key, value),
    deleteItem: async (key: string) => localStorage.removeItem(key)
};

// Use appropriate storage based on platform
const storage = Platform.OS === 'web' ? webStorage : SecureStore;

// Request interceptor with enhanced security
axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            // Add auth token using platform-appropriate storage
            const token = await storage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Log request details regardless of environment
            const sanitizedConfig = {
                url: config.url,
                method: config.method,
                headers: {
                    ...config.headers,
                    Authorization: config.headers.Authorization ? '[REDACTED]' : undefined,
                }
            };
            console.log('Making API request:', sanitizedConfig);

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
            await storage.deleteItem('userToken');
            
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
        if (Platform.OS === 'web') {
            await storage.setItem('userToken', token);
        } else {
            const options: SecureStore.SecureStoreOptions = {
                keychainAccessible: SecureStore.WHEN_UNLOCKED
            };
            await storage.setItem('userToken', token, options);
        }
    } catch (error) {
        console.error('Error storing token:', error);
        throw error;
    }
};

// Helper function to clear the auth token
apiClient.clearToken = async () => {
    try {
        await storage.deleteItem('userToken');
    } catch (error) {
        console.error('Error clearing token:', error);
        throw error;
    }
};

// ===== DYNAMIC ROUTE HANDLER SYSTEM =====

// Create a mapping of route handlers for efficient lookup
// Import all your route handlers explicitly at the top of your file
// For example:
// import getUserGetHandler from '../api/user/get/route';
// import userCreateHandler from '../api/user/create/post/route';

// Then add them to this map
const routeHandlers: Record<string, any> = {
    // Example mappings:
    // 'GET /user/get': getUserGetHandler,
    // 'POST /user/create': userCreateHandler,
};

/**
 * Function to get a route handler based on method and path
 */
function getRouteHandler(method: string, path: string) {
    if (!USE_LOCAL_HANDLERS) return null;
    
    const key = `${method.toUpperCase()} ${path}`;
    return routeHandlers[key] || null;
}

/**
 * Handle a request using the local route handlers if available
 */
async function handleRequestLocally<T = any>(
    method: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
): Promise<AxiosResponse<T> | null> {
    try {
        // Get the route handler
        const handler = getRouteHandler(method, url);
        
        // If no handler found, return null to use the original axios implementation
        if (!handler) return null;
        
        let result;
        
        // Call the appropriate handler with the correct arguments
        if (method.toUpperCase() === 'GET') {
            // For GET requests, params are in config
            result = await handler(config?.params || {});
        } else {
            // For other requests, data is in the body
            result = await handler(data);
        }
        
        // Return a response in the axios format
        return {
            data: result as T,
            status: 200,
            statusText: 'OK',
            headers: {} as AxiosRequestHeaders,
            config: config as InternalAxiosRequestConfig || {},
            request: {}
        };
    } catch (error: any) {
        // Format errors to match axios error format
        console.error(`Error in local route handler for ${method} ${url}:`, error);
        
        throw {
            response: {
                status: error.statusCode || 500,
                data: { error: error.message || `Error processing ${method} ${url}` }
            }
        };
    }
}

// Override all axios methods to check for local handlers first

// Override GET method
const originalGet = apiClient.get;
apiClient.get = async function<T = any, R = AxiosResponse<T>, D = any>(
    url: string, 
    config?: AxiosRequestConfig<D>
): Promise<R> {
    try {
        console.log(`GET request initiated for: ${url}`, { config });
        const localResponse = await handleRequestLocally<T>('GET', url, null, config);
        if (localResponse) return localResponse as R;
        return originalGet.call(this, url, config) as Promise<R>;
    } catch (error) {
        throw error;
    }
};

// Override POST method
const originalPost = apiClient.post;
apiClient.post = async function<T = any, R = AxiosResponse<T>, D = any>(
    url: string, 
    data?: D, 
    config?: AxiosRequestConfig<D>
): Promise<R> {
    try {
        const localResponse = await handleRequestLocally<T>('POST', url, data, config);
        if (localResponse) return localResponse as R;
        return originalPost.apply(this, [url, data, config]) as Promise<R>;
    } catch (error) {
        throw error;
    }
};

// Override PUT method
const originalPut = apiClient.put;
apiClient.put = async function<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
): Promise<R> {
    try {
        const localResponse = await handleRequestLocally<T>('PUT', url, data, config);
        if (localResponse) return localResponse as R;
        return originalPut.call(this, url, data, config) as Promise<R>;
    } catch (error) {
        throw error;
    }
};

// Override PATCH method
const originalPatch = apiClient.patch;
apiClient.patch = async function<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
): Promise<R> {
    try {
        const localResponse = await handleRequestLocally<T>('PATCH', url, data, config);
        if (localResponse) return localResponse as R;
        return originalPatch.call(this, url, data, config) as Promise<R>;
    } catch (error) {
        throw error;
    }
};

// Override DELETE method
const originalDelete = apiClient.delete;
apiClient.delete = async function<T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
): Promise<R> {
    try {
        const localResponse = await handleRequestLocally<T>('DELETE', url, null, config);
        if (localResponse) return localResponse as R;
        return originalDelete.call(this, url, config) as Promise<R>;
    } catch (error) {
        throw error;
    }
};

export default apiClient;