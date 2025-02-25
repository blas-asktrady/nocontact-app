import { Platform } from 'react-native';

// You might need to adjust this based on your Expo environment configuration
const getChatUrl = () => {
  // Use environment variables from your Expo config
  const baseUrl = process.env.EXPO_PUBLIC_PANDA_URL || 'ws://0.0.0.0:8080';
  return baseUrl;
};

export async function sendChatMessage(
  message: string,
  characterId: string
): Promise<ReadableStream<Uint8Array> | string> {
  try {
    // In React Native, we'll directly establish the WebSocket connection
    // instead of going through a Next.js API route
    const baseUrl = getChatUrl();
    
    // Use the correct WebSocket URL format with the /ws/chat/ path
    const wsUrl = `${baseUrl}/ws/chat/${characterId}`;
    
    console.log('Connecting to WebSocket URL:', wsUrl);

    // Create a promise that resolves to a ReadableStream
    return new Promise((resolve, reject) => {
      let ws: WebSocket;
      
      try {
        ws = new WebSocket(wsUrl);
        
        // Once the connection is open, we'll create a ReadableStream and resolve the promise with it
        ws.onopen = () => {
          console.log('WebSocket connection established');
          
          // Create a structured message object
          const messageData = {
            message,
          };
          
          // Send the structured message as JSON
          ws.send(JSON.stringify(messageData));
          
          // Create a ReadableStream to handle the WebSocket responses
          const stream = new ReadableStream({
            start(controller) {
              // Handle incoming messages
              ws.onmessage = (event) => {
                try {
                  // Encode and enqueue each chunk received from the WebSocket
                  const chunk = event.data + '\n';
                  const encoder = new TextEncoder();
                  controller.enqueue(encoder.encode(chunk));
                } catch (err) {
                  console.error('Error processing message:', err);
                }
              };
              
              // Handle WebSocket errors
              ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                controller.error(new Error('WebSocket connection failed'));
              };
              
              // Handle WebSocket closure
              ws.onclose = (event) => {
                console.log('WebSocket connection closed:', event.code, event.reason);
                if (!event.wasClean) {
                  controller.error(new Error(`WebSocket connection closed unexpectedly: ${event.reason}`));
                } else {
                  controller.close();
                }
              };
            },
            
            cancel() {
              // Clean up WebSocket connection if the stream is cancelled
              if (ws?.readyState === WebSocket.OPEN) {
                ws.close();
              }
            },
          });
          
          // Resolve the promise with the stream
          resolve(stream);
        };
        
        // Handle connection errors
        ws.onerror = (error) => {
          console.error('WebSocket connection error:', error);
          reject(new Error('Failed to establish WebSocket connection'));
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
}

// For environments that don't support ReadableStream (older React Native versions)
// You might need this alternative implementation
export async function sendChatMessageAlternative(
  message: string,
  characterId: string
): Promise<(onMessage: (message: string) => void) => void> {
  try {
    const baseUrl = getChatUrl();
    
    // Use the correct WebSocket URL format with the /ws/chat/ path
    const wsUrl = `${baseUrl}/ws/chat/${characterId}`;
    
    console.log('Connecting to WebSocket URL:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    
    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        console.log('WebSocket connection established');
        
        // Send the message
        const messageData = {
          message,
        };
        ws.send(JSON.stringify(messageData));
        
        // Return a function that accepts a callback for handling messages
        resolve((onMessage: (message: string) => void) => {
          ws.onmessage = (event) => {
            onMessage(event.data);
          };
          
          // Return a cleanup function
          return () => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.close();
            }
          };
        });
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(new Error('WebSocket connection failed'));
      };
    });
  } catch (error) {
    console.error('Error in sendChatMessageAlternative:', error);
    throw error;
  }
}