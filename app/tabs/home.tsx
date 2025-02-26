import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
    <LinearGradient
      colors={['#E9D5FF', '#EDE9FF', '#FFF7ED']}
      style={styles.container}
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
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 100,
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
});

export default HomeScreen;