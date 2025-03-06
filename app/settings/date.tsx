import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Image, View, Text, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateLastEpisodeDate } from '@/services/surveyService';
import { useUser } from '@/hooks/useUser';

const SupportIcon = () => (
  <View style={styles.buddyCircle}>
    <Image
      source={require('@/assets/mascot/face.png')}
      style={styles.buddyImage}
    />
  </View>
);

const DateScreen = () => {
  const [lastEpisodeDate, setLastEpisodeDate] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const { user, isLoading } = useUser();
  
  // Add these state declarations for the date and time
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [tempTime, setTempTime] = useState<Date | null>(null);

  // Set default date if no date is selected yet
  useEffect(() => {
    if (!lastEpisodeDate) {
      const defaultDate = new Date().toISOString();
      setLastEpisodeDate(defaultDate);
      
      // Also update in database if user has an ID
      if (user?.id) {
        updateLastEpisodeDate(user.id, defaultDate)
          .catch(err => console.error('Failed to save default date:', err));
      }
    }
  }, [lastEpisodeDate, user]);

  const handleDateChange = async (event: any, selectedDate: any) => {
    if (event.type === 'set' && selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleTimeChange = async (event: any, selectedTime: any) => {
    if (event.type === 'set' && selectedTime) {
      setTempTime(selectedTime);
    }
  };

  // Handle saving the date when the button is clicked
  const handleSaveDate = async () => {
    if (!tempDate && !tempTime) return;
    
    setShowPicker(false);
    setShowTimePicker(false);
    setIsProcessing(true);
    setError('');
    
    // Create a new date object combining the date and time if both are selected
    let newDate = new Date();
    
    if (tempDate) {
      newDate = new Date(tempDate);
    } else if (lastEpisodeDate) {
      newDate = new Date(lastEpisodeDate);
    }
    
    if (tempTime) {
      newDate.setHours(tempTime.getHours());
      newDate.setMinutes(tempTime.getMinutes());
    }
    
    const newDateIso = newDate.toISOString();
    setLastEpisodeDate(newDateIso);
    
    if (user?.id) {
      try {
        // Set a timeout to prevent UI from getting stuck
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 8000)
        );
        
        // Race the actual API call against the timeout
        await Promise.race([
          updateLastEpisodeDate(user.id, newDateIso),
          timeoutPromise
        ]);
        
        console.log('Last episode date updated successfully');
        // Navigate back immediately after successful update
        router.back();
      } catch (err) {
        console.error('Failed to update last episode date:', err);
        setError(err.message || 'Failed to save date. Please try again.');
      } finally {
        setIsProcessing(false);
        setTempDate(null);
        setTempTime(null);
      }
    } else {
      console.error('No user ID available for update');
      setError('Authentication error. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Initialize with current date/time if nothing is selected
  const now = new Date();
  
  // Use temp values first, then saved values, then default to current date/time
  const currentDate = tempDate || (lastEpisodeDate ? new Date(lastEpisodeDate) : now);
  const currentTime = tempTime || (lastEpisodeDate ? new Date(lastEpisodeDate) : now);
  
  const hasSelectedDate = lastEpisodeDate || tempDate;
  const hasNewSelection = tempDate !== null || tempTime !== null;
  
  // Determine if the date has changed to enable/disable save button
  const hasDateChanged = hasNewSelection;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} disabled={isProcessing}>
            <Ionicons name="chevron-back" size={24} color="#000000" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.mainContainer}>
          <SupportIcon />
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>When did you last contact your ex?</Text>
          </View>
          
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity 
              style={[
                styles.dateTimeButton, 
                showPicker ? styles.activeButton : styles.inactiveButton
              ]}
              onPress={() => {
                setShowPicker(true);
                setShowTimePicker(false);
              }}
            >
              <Text style={showPicker ? styles.activeButtonText : styles.inactiveButtonText}>
                {hasSelectedDate ? currentDate.toLocaleDateString() : now.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.dateTimeButton, 
                showTimePicker ? styles.activeButton : styles.inactiveButton
              ]}
              onPress={() => {
                setShowTimePicker(true);
                setShowPicker(false);
              }}
            >
              <Text style={showTimePicker ? styles.activeButtonText : styles.inactiveButtonText}>
                {lastEpisodeDate || tempTime ? 
                  currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                  now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Always show one of the pickers */}
          {showPicker && (
            <DateTimePicker
              value={currentDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
              themeVariant="light"
              textColor="#000000"
            />
          )}
          
          {showTimePicker && (
            <DateTimePicker
              value={currentTime}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
              themeVariant="light"
              textColor="#000000"
            />
          )}
          
          {/* If neither picker is showing, default to date picker */}
          {!showPicker && !showTimePicker && (
            <>
              {setShowPicker(true)}
              <DateTimePicker
                value={currentDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                themeVariant="light"
                textColor="#000000"
              />
            </>
          )}
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <TouchableOpacity 
            style={[
              styles.saveDateButton,
              (isProcessing || !hasDateChanged) && styles.saveDateButtonDisabled
            ]}
            onPress={handleSaveDate}
            disabled={isProcessing || !hasDateChanged}
          >
            <Text style={styles.saveDateButtonText}>
              {isProcessing ? 'Saving...' : 'Save Date & Time'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  mainContainer: {
    flex: 1,
    padding: 24,
  },
  buddyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6a77e3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  buddyImage: {
    width: '75%',
    height: '75%',
  },
  messageContainer: {
    backgroundColor: '#6a77e3',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  messageText: {
    fontSize: 24,
    color: '#FFFFFF',
    lineHeight: 32,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  dateTimeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#6a77e3',
  },
  inactiveButton: {
    backgroundColor: '#F3F4F6',
  },
  activeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  inactiveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  saveDateButton: {
    backgroundColor: '#6a77e3',
    padding: 16,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 24,
  },
  saveDateButtonDisabled: {
    backgroundColor: '#A5ACEA',
  },
  saveDateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default DateScreen;