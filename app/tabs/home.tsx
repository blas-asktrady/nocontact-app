import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = () => {
  // State for progress
  const [progress, setProgress] = useState(0);
  const maxProgress = 15;
  
  // Completed tasks
  const completedTasks = [
    { id: 1, title: 'Take 3 deep breaths', icon: '🍃', points: 5 },
    { id: 2, title: 'Take a stretch break', icon: '🦒', points: 5 },
    { id: 3, title: 'Brush teeth', icon: '🪥', points: 5 },
    { id: 4, title: 'Drink water', icon: '🥤', points: 5 },
    { id: 5, title: 'Wash my face', icon: '🧼', points: 5 },
  ];
  
  // Goals remaining message
  const goalsLeft = 8;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Main content area */}
        <View style={styles.mainContent}>
          
          {/* Central character - PANDA instead of blue bird */}
          <View style={styles.characterContainer}>
            <Image 
              source={require('@/assets/images/panda.png')} 
              style={styles.character}
              resizeMode="contain"
            />
          </View>
          
          {/* Adventure progress bar */}
          <LinearGradient
            colors={['#2EC4B6', '#26A69A']}
            style={styles.adventureCard}
          >
            <View style={styles.adventureHeader}>
              <View style={styles.adventureIcon}>
                <Text style={styles.adventureIconText}>⚡</Text>
              </View>
              <Text style={styles.adventureTitle}>3rd Adventure</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(progress / maxProgress) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{progress} / {maxProgress}</Text>
            </View>
          </LinearGradient>
          
          {/* Goals remaining */}
          <View style={styles.goalsContainer}>
            <View style={styles.goalsLeft}>

              <Text style={styles.goalsText}>{goalsLeft} goals left for today!</Text>
            </View>
            
            <View style={styles.goalControls}>
              <TouchableOpacity style={styles.goalControl}>
                <Text>≡</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.goalControl}>
                <Text>⊕</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Completed tasks */}
          {completedTasks.map(task => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskInfo}>
                <TouchableOpacity style={styles.taskOptions}>
                  <Text>⋮</Text>
                </TouchableOpacity>
                <View style={styles.taskIconContainer}>
                  <Text style={styles.taskIcon}>{task.icon}</Text>
                </View>
                <Text style={styles.taskTitle}>{task.title}</Text>
              </View>
              
              <View style={styles.taskActions}>
                <View style={styles.taskPoints}>
                  <Text style={styles.taskPointsValue}>{task.points}</Text>
                  <Text style={styles.taskPointsIcon}>⚡</Text>
                </View>
                <View style={styles.taskCheckbox}>
                  <Text style={styles.taskCheckmark}>✓</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2EC4B6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#2EC4B6',
  },
  contentContainer: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  mainContent: {
    flex: 1,
    paddingBottom: 80,
  },
  characterContainer: {
    alignItems: 'center',
    marginTop: 10,
    zIndex: 10,
  },
  character: {
    width: 160,
    height: 160,
  },
  adventureCard: {
    margin: 20,
    borderRadius: 20,
    padding: 15,
    marginTop: 30,
  },
  adventureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adventureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  adventureIconText: {
    fontSize: 20,
  },
  adventureTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 10,
  },
  progressText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  goalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  goalsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  goalsText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  goalControls: {
    flexDirection: 'row',
  },
  goalControl: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskOptions: {
    marginRight: 10,
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  taskIcon: {
    fontSize: 20,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  taskPointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  taskPointsIcon: {
    fontSize: 16,
    color: '#FFD700',
  },
  taskCheckbox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckmark: {
    color: '#4CAF50',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomeScreen;