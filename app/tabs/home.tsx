import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = () => {
  const [timeElapsed, setTimeElapsed] = useState({
    months: 1,
    days: 1,
    hours: 18,
    minutes: 37,
    seconds: 50,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      // Update time elapsed logic here
      // This is a placeholder for actual time calculation
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <ImageBackground 
      source={require('@/assets/home/garden.png')}
      style={styles.container}
      resizeMode="cover"
    >
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
            source={require('@/assets/home/zen_rock.png')} 
            style={styles.rock}
            resizeMode="contain"
          />
          <Image 
            source={require('@/assets/home/panda.png')} 
            style={styles.character}
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
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  timeBlock: {
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    position: 'relative',
    height: 280,
  },
  rock: {
    width: 280,
    height: 120,
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
  },
  character: {
    width: 180,
    height: 180,
    zIndex: 2,
    position: 'absolute',
    bottom: 60,
  },
});

export default HomeScreen;