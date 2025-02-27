import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, Dimensions, Platform } from 'react-native';
import * as Storage from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get screen dimensions for positioning calculations
const { width, height } = Dimensions.get('window');

// Create a storage helper that works across platforms
const storage = {
  setItem: async (key, value) => {
    try {
      // Use different storage mechanisms based on platform
      if (Platform.OS === 'web') {
        // For web, use localStorage directly
        localStorage.setItem(key, value);
        return true;
      } else {
        // For native platforms, use AsyncStorage
        await AsyncStorage.setItem(key, value);
        return true;
      }
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  },
  
  getItem: async (key) => {
    try {
      if (Platform.OS === 'web') {
        // For web, use localStorage directly
        return localStorage.getItem(key);
      } else {
        // For native platforms, use AsyncStorage
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }
};

const HomeScreen = () => {
  const [timeElapsed, setTimeElapsed] = useState({
    months: 50,
    days: 1,
    hours: 18,
    minutes: 37,
    seconds: 50,
  });
  
  // Add state for saved flower positions
  const [savedFlowerPositions, setSavedFlowerPositions] = useState(null);

  // Calculate total days for flower count
  const totalDays = useMemo(() => {
    return (timeElapsed.months * 30) + timeElapsed.days;
  }, [timeElapsed.months, timeElapsed.days]);

  // Define the garden area boundaries - expand to use more of the available space
  const gardenArea = {
    top: height * 0.25, // Moved higher to use more of the garden area
    bottom: height * 0.9, // End before the navigation
    left: width * 0.02, // Extended further left to fill corners
    right: width * 0.98, // Extended further right to fill corners
  };

  // Define panda's rock area - we'll place flowers around it, including ears
  const pandaRockArea = {
    top: height * 0.4, // Moved up more to protect the panda's ears
    bottom: height * 0.63,
    left: width * 0.32, // Widened slightly to protect the ears from the sides
    right: width * 0.68,
  };

  // Load saved flower positions from storage
  useEffect(() => {
    const loadSavedFlowers = async () => {
      try {
        const savedData = await storage.getItem('flowerPositions');
        if (savedData) {
          setSavedFlowerPositions(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Error loading saved flower positions:', error);
      }
    };
    
    loadSavedFlowers();
  }, []);

  // Generate flower positions based on total days
  const flowers = useMemo(() => {
    // If we have saved positions and the total days matches, use the saved positions
    if (savedFlowerPositions && savedFlowerPositions.totalDays === totalDays) {
      return savedFlowerPositions.flowers;
    }
    
    const flowerPositions = [];
    
    // Use totalDays directly for flower count
    const totalFlowers = totalDays;
    
    // Create a mix of distribution patterns to fill the garden more naturally
    for (let i = 0; i < totalFlowers; i++) {
      let x, y;
      
      // Different placement strategies based on flower index
      if (i % 4 === 0) {
        // Strategy 1: Completely random within garden boundaries (25% of flowers)
        x = gardenArea.left + Math.random() * (gardenArea.right - gardenArea.left);
        y = gardenArea.top + Math.random() * (gardenArea.bottom - gardenArea.top);
      } else if (i % 4 === 1) {
        // Strategy 2: Clustered in small groups throughout garden (25% of flowers)
        // Create 5-10 cluster centers and distribute flowers around them
        const clusterCount = 8;
        const clusterIndex = i % clusterCount;
        
        // Create random cluster centers throughout garden
        const clusterCenterX = gardenArea.left + (clusterIndex / clusterCount) * (gardenArea.right - gardenArea.left);
        const clusterCenterY = gardenArea.top + ((clusterIndex * 1.7) % clusterCount / clusterCount) * (gardenArea.bottom - gardenArea.top);
        
        // Add some randomness around the cluster center
        x = clusterCenterX + (Math.random() - 0.5) * width * 0.15;
        y = clusterCenterY + (Math.random() - 0.5) * height * 0.15;
      } else if (i % 4 === 2) {
        // Strategy 3: Denser at the edges and corners, creating a frame effect (25% of flowers)
        // Determine which edge or corner to place the flower
        const position = Math.floor(Math.random() * 8);
        
        switch (position) {
          case 0: // Top edge
            x = gardenArea.left + Math.random() * (gardenArea.right - gardenArea.left);
            y = gardenArea.top + Math.random() * (gardenArea.bottom - gardenArea.top) * 0.2;
            break;
          case 1: // Right edge
            x = gardenArea.right - Math.random() * (gardenArea.right - gardenArea.left) * 0.2;
            y = gardenArea.top + Math.random() * (gardenArea.bottom - gardenArea.top);
            break;
          case 2: // Bottom edge
            x = gardenArea.left + Math.random() * (gardenArea.right - gardenArea.left);
            y = gardenArea.bottom - Math.random() * (gardenArea.bottom - gardenArea.top) * 0.2;
            break;
          case 3: // Left edge
            x = gardenArea.left + Math.random() * (gardenArea.right - gardenArea.left) * 0.2;
            y = gardenArea.top + Math.random() * (gardenArea.bottom - gardenArea.top);
            break;
          case 4: // Top-left corner
            x = gardenArea.left + Math.random() * (gardenArea.right - gardenArea.left) * 0.15;
            y = gardenArea.top + Math.random() * (gardenArea.bottom - gardenArea.top) * 0.15;
            break;
          case 5: // Top-right corner
            x = gardenArea.right - Math.random() * (gardenArea.right - gardenArea.left) * 0.15;
            y = gardenArea.top + Math.random() * (gardenArea.bottom - gardenArea.top) * 0.15;
            break;
          case 6: // Bottom-right corner
            x = gardenArea.right - Math.random() * (gardenArea.right - gardenArea.left) * 0.15;
            y = gardenArea.bottom - Math.random() * (gardenArea.bottom - gardenArea.top) * 0.15;
            break;
          case 7: // Bottom-left corner
            x = gardenArea.left + Math.random() * (gardenArea.right - gardenArea.left) * 0.15;
            y = gardenArea.bottom - Math.random() * (gardenArea.bottom - gardenArea.top) * 0.15;
            break;
        }
      } else {
        // Strategy 4: Some still around the panda but in a wider area (25% of flowers)
        // Calculate angle for positioning in a wider circular pattern
        const angle = (i / (totalFlowers / 4)) * 2 * Math.PI;
        
        // Calculate distance from center with more variation
        const randomVariation = 0.7 + (Math.random() * 0.6); // 0.7-1.3 range for wider distribution
        const baseDistance = width * 0.4 * randomVariation; // Wider base distance from center
        
        // Calculate center point (centered on panda)
        const centerX = width / 2;
        const centerY = (pandaRockArea.top + pandaRockArea.bottom) / 2;
        
        // Calculate position based on angle and distance
        x = centerX + Math.cos(angle) * baseDistance;
        y = centerY + Math.sin(angle) * baseDistance;
        
        // Add more randomness to each position
        x += (Math.random() - 0.5) * width * 0.2;
        y += (Math.random() - 0.5) * height * 0.2;
      }
      
      // Ensure it's within garden area boundaries
      x = Math.max(gardenArea.left, Math.min(gardenArea.right, x));
      y = Math.max(gardenArea.top, Math.min(gardenArea.bottom, y));
      
      // Check if flower is inside panda's area - if so, move it
      if (
        x > pandaRockArea.left && 
        x < pandaRockArea.right && 
        y > pandaRockArea.top && 
        y < pandaRockArea.bottom
      ) {
        // Move flower to a random edge of the garden
        const moveToEdge = Math.floor(Math.random() * 4);
        switch (moveToEdge) {
          case 0: // Move to left
            x = gardenArea.left + Math.random() * (pandaRockArea.left - gardenArea.left) * 0.8;
            break;
          case 1: // Move to right
            x = pandaRockArea.right + Math.random() * (gardenArea.right - pandaRockArea.right) * 0.8;
            break;
          case 2: // Move to top
            y = gardenArea.top + Math.random() * (pandaRockArea.top - gardenArea.top) * 0.8;
            break;
          case 3: // Move to bottom
            y = pandaRockArea.bottom + Math.random() * (gardenArea.bottom - pandaRockArea.bottom) * 0.8;
            break;
        }
      }
      
      // Scale based on y-position (perspective effect)
      const sizeScale = 0.4 + ((y - gardenArea.top) / (gardenArea.bottom - gardenArea.top)) * 0.6;
      
      // Vary flower size based on streak length - longer streaks get slightly larger flowers
      const streakBonus = Math.min(0.3, totalDays / 500); // Max 30% size increase at 500 days
      const size = 40 * sizeScale * (1 + streakBonus);
      
      // Add more variation to flower appearance, but keep flowers upright
      flowerPositions.push({
        x,
        y, 
        size: size * (0.8 + Math.random() * 0.4), // 80-120% size variation
        mirrored: Math.random() > 0.5, // 50% chance to mirror horizontally
        rotation: 0, // Keep flowers in their original upright position
        opacity: 0.7 + Math.random() * 0.3, // Slight opacity variation
      });
    }
    
    // Save the generated flower positions to storage
    const saveFlowerPositions = async () => {
      try {
        const dataToSave = {
          totalDays,
          flowers: flowerPositions,
          timestamp: new Date().toISOString()
        };
        await storage.setItem('flowerPositions', JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving flower positions:', error);
      }
    };
    
    saveFlowerPositions();
    
    return flowerPositions;
  }, [totalDays, savedFlowerPositions]);

  useEffect(() => {
    // Set the start date (current date minus the time elapsed)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - timeElapsed.months);
    startDate.setDate(startDate.getDate() - timeElapsed.days);
    startDate.setHours(startDate.getHours() - timeElapsed.hours);
    startDate.setMinutes(startDate.getMinutes() - timeElapsed.minutes);
    startDate.setSeconds(startDate.getSeconds() - timeElapsed.seconds);
    
    const timer = setInterval(() => {
      const now = new Date();
      const diff = now - startDate;
      
      // Convert milliseconds to readable units
      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      
      // Calculate days and months (approximate)
      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      const months = Math.floor(totalDays / 30);
      const days = totalDays % 30;
      
      const newTimeElapsed = {
        months,
        days,
        hours,
        minutes,
        seconds,
      };
      
      setTimeElapsed(newTimeElapsed);
      
      // Save time elapsed to storage
      const saveTimeElapsed = async () => {
        try {
          await storage.setItem('timeElapsed', JSON.stringify(newTimeElapsed));
        } catch (error) {
          console.error('Error saving time elapsed:', error);
        }
      };
      
      // Only save every minute to reduce writes
      if (seconds === 0) {
        saveTimeElapsed();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load saved time elapsed on initial mount
  useEffect(() => {
    const loadSavedTime = async () => {
      try {
        const savedTime = await storage.getItem('timeElapsed');
        if (savedTime) {
          setTimeElapsed(JSON.parse(savedTime));
        }
      } catch (error) {
        console.error('Error loading saved time:', error);
      }
    };
    
    loadSavedTime();
  }, []);

  return (
    <ImageBackground 
      source={require('@/assets/home/garden.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Preload the flower image once */}
      <Image 
        source={require('@/assets/home/flower.png')} 
        style={{ width: 0, height: 0 }}
      />
      
      {/* Use absolute positioning to place flowers */}
      <View style={styles.flowersContainer}>
        {flowers.map((flower, index) => (
          <View 
            key={`flower-${index}`}
            style={[
              styles.flowerWrapper,
              {
                left: flower.x - (flower.size / 2),
                top: flower.y - (flower.size / 2),
                width: flower.size,
                height: flower.size,
                opacity: flower.opacity,
                transform: [
                  { scaleX: flower.mirrored ? -1 : 1 }
                ],
                zIndex: Math.floor(flower.y), // Higher y-values (lower on screen) get higher z-index
              }
            ]}
          >
            <View style={styles.flowerImageContainer}>
              <Image 
                source={require('@/assets/home/flower.png')} 
                style={styles.flowerImage}
                resizeMode="contain"
              />
            </View>
          </View>
        ))}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.label}>NoContact 🐼</Text>
        <Text style={styles.title}>You've stayed strong for</Text>
        
        <View style={styles.timeContainer}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeValue}>{String(timeElapsed.months).padStart(2, '0')}</Text>
            <Text style={styles.timeLabel}>MO</Text>
          </View>
          
          <View style={styles.timeBlock}>
            <Text style={styles.timeValue}>{String(timeElapsed.days).padStart(2, '0')}</Text>
            <Text style={styles.timeLabel}>DAYS</Text>
          </View>
          
          <View style={styles.timeBlock}>
            <Text style={styles.timeValue}>{String(timeElapsed.hours).padStart(2, '0')}</Text>
            <Text style={styles.timeLabel}>HRS</Text>
          </View>
          
          <View style={styles.timeBlock}>
            <Text style={styles.timeValue}>{String(timeElapsed.minutes).padStart(2, '0')}</Text>
            <Text style={styles.timeLabel}>MIN</Text>
          </View>
          
          <View style={styles.timeBlock}>
            <Text style={styles.timeValue}>{String(timeElapsed.seconds).padStart(2, '0')}</Text>
            <Text style={styles.timeLabel}>SEC</Text>
          </View>
        </View>
        
        <View style={styles.characterContainer}>
          <Image 
            source={require('@/assets/home/zen_panda.png')} 
            style={styles.zenPanda}
            resizeMode="contain"
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    zIndex: 1000, // Dramatically increased to ensure it's above everything
    elevation: 1000, // Added elevation for Android
    position: 'absolute', // Make it absolute positioned
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: 'white',
    backgroundColor: '#6a77e3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    zIndex: 1500, // Dramatically increased
    elevation: 1500, // Added elevation for Android
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
    color: 'white',
    backgroundColor: '#6a77e3',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    overflow: 'hidden',
    alignSelf: 'center',
    zIndex: 1500,
    elevation: 1500,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    zIndex: 1500, // Dramatically increased
    elevation: 1500, // Added elevation for Android
  },
  timeBlock: {
    alignItems: 'center',
    zIndex: 1500, // Added zIndex
    elevation: 1500, // Added elevation for Android
  },
  timeValue: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    textShadowColor: '#6a77e3',
    textShadowOffset: { width: 2.5, height: 2.5 },
    textShadowRadius: 4.5,
    textShadowRadius: 2,
    textShadowColor: '#6a77e3',
    textShadowOffset: { width: -1.5, height: -1.5 },
    textShadow: '2px 2px 0 #6a77e3, -2px -2px 0 #6a77e3, 2px -2px 0 #6a77e3, -2px 2px 0 #6a77e3, 0px 2px 0 #6a77e3, 2px 0px 0 #6a77e3, 0px -2px 0 #6a77e3, -2px 0px 0 #6a77e3',
    zIndex: 1500,
    elevation: 1500,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
    marginTop: 5,
    textShadowColor: '#6a77e3',
    textShadowOffset: { width: 1.5, height: 1.5 },
    textShadowRadius: 3.5,
    textShadow: '1px 1px 0 #6a77e3, -1px -1px 0 #6a77e3, 1px -1px 0 #6a77e3, -1px 1px 0 #6a77e3',
    zIndex: 1500,
    elevation: 1500,
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    position: 'relative',
    height: 280,
  },
  zenPanda: {
    width: 240,
    height: 200,
    position: 'absolute',
    bottom: 0,
    zIndex: 10, // Ensure panda is above flowers
  },
  flowersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10, // Increased zIndex to be higher than zen_panda
  },
  flowerWrapper: {
    position: 'absolute',
    overflow: 'hidden',
  },
  flowerImageContainer: {
    width: '100%',
    height: '100%',
  },
  flowerImage: {
    width: '100%',
    height: '100%',
  },
});

export default HomeScreen;