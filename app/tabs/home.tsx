import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useMascot from '@/hooks/useMascot';
import { useUser } from '@/hooks/useUser';

const HomeScreen = () => {
  // Get user and mascot data
  const { user } = useUser();
  const { mascot, loading, addXp } = useMascot(user?.id || '');
  
  // State for animations
  const [animatingStars, setAnimatingStars] = useState<{id: number, animation: Animated.Value, top: number, left: number}[]>([]);
  
  // Available tasks
  const [availableTasks, setAvailableTasks] = useState([
    { id: 1, title: 'Take 3 deep breaths', icon: '🍃', points: 5 },
    { id: 2, title: 'Take a stretch break', icon: '🦒', points: 5 },
    { id: 3, title: 'Brush teeth', icon: '🪥', points: 5 },
    { id: 4, title: 'Drink water', icon: '🥤', points: 5 },
    { id: 5, title: 'Wash my face', icon: '🧼', points: 5 },
  ]);
  
  // Completed tasks
  const [completedTasks, setCompletedTasks] = useState<typeof availableTasks>([]);
  
  // Goals remaining message
  const goalsLeft = availableTasks.length;

  // Handle task completion
  const handleTaskComplete = (task: typeof availableTasks[0], event: any) => {
    // Create a new animated star
    const newStar = {
      id: Date.now(),
      animation: new Animated.Value(0),
      top: event.nativeEvent.pageY - 20,
      left: event.nativeEvent.pageX - 20,
    };
    
    setAnimatingStars(prev => [...prev, newStar]);
    
    // Remove task from available tasks
    setAvailableTasks(prev => prev.filter(t => t.id !== task.id));
    
    // Add task to completed tasks
    setCompletedTasks(prev => [...prev, task]);
    
    // Animate the star
    Animated.timing(newStar.animation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      // Remove the star after animation completes
      setAnimatingStars(prev => prev.filter(star => star.id !== newStar.id));
      
      // Add XP to mascot
      addXp(task.points);
    });
  };

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
            colors={['#5a67d3', '#4a57c3']}
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
                    { width: `${((mascot?.xp || 0) / 15) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{mascot?.xp || 0} / 15</Text>
            </View>
          </LinearGradient>
          
          {/* Goals remaining */}
          <View style={styles.goalsContainer}>
            <View style={styles.goalsLeft}>
              <Text style={styles.goalsText}>{goalsLeft} goals left for today!</Text>
            </View>
            
          </View>
          
          {/* Available tasks */}
          {availableTasks.map(task => (
            <TouchableOpacity 
              key={task.id} 
              style={styles.taskCard}
              onPress={(event) => handleTaskComplete(task, event)}
            >
              <View style={styles.taskInfo}>
                <TouchableOpacity 
                  style={styles.taskOptions}
                  onPress={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent onPress
                    // Handle options menu here
                  }}
                >
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
            </TouchableOpacity>
          ))}
          
          {/* Completed tasks section (optional) */}
          {completedTasks.length > 0 && (
            <View style={styles.completedSection}>
              <Text style={styles.completedHeader}>Completed Tasks</Text>
              {completedTasks.map(task => (
                <View key={task.id} style={[styles.taskCard, styles.completedTaskCard]}>
                  <View style={styles.taskInfo}>
                    <View style={styles.taskIconContainer}>
                      <Text style={styles.taskIcon}>{task.icon}</Text>
                    </View>
                    <Text style={[styles.taskTitle, styles.completedTaskTitle]}>{task.title}</Text>
                  </View>
                  
                  <View style={styles.taskActions}>
                    <View style={styles.taskPoints}>
                      <Text style={styles.taskPointsValue}>{task.points}</Text>
                      <Text style={styles.taskPointsIcon}>⚡</Text>
                    </View>
                    <View style={[styles.taskCheckbox, styles.completedCheckbox]}>
                      <Text style={styles.taskCheckmark}>✓</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Animated stars */}
      {animatingStars.map(star => (
        <Animated.View
          key={star.id}
          style={{
            position: 'absolute',
            top: star.animation.interpolate({
              inputRange: [0, 1],
              outputRange: [star.top, 100]
            }),
            left: star.animation.interpolate({
              inputRange: [0, 1],
              outputRange: [star.left, 200]
            }),
            opacity: star.animation.interpolate({
              inputRange: [0, 0.7, 1],
              outputRange: [1, 1, 0]
            }),
            transform: [{
              scale: star.animation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.5, 0.5]
              })
            }],
            zIndex: 1000,
          }}
        >
          <Text style={styles.starAnimation}>⭐</Text>
        </Animated.View>
      ))}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#6a77e3',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#6a77e3',
  },
  contentContainer: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  mainContent: {
    flex: 1,
    paddingBottom: 20,
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
  starAnimation: {
    fontSize: 30,
    color: '#FFD700',
  },
  completedSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  completedHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  completedTaskCard: {
    opacity: 0.7,
    backgroundColor: '#F5F5F5',
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  completedCheckbox: {
    backgroundColor: '#4CAF50',
  },
});

export default HomeScreen;