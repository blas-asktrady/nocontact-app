import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Image, View, Text, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Bell } from 'lucide-react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  updateUsername, 
  updateDepressionDuration, 
  updateLastEpisodeDate,
  updatePrimaryGoal,
  updateWantTips,
  updateIsSurveyCompleted
} from '@/services/surveyService';
import { useUser } from '@/hooks/useUser';

const SupportIcon = () => (
  <View style={styles.buddyCircle}>
    <Image
      source={require('@/assets/mascot/face.png')}
      style={styles.buddyImage}
    />
  </View>
);

const SurveyScreen = () => {
  // Track all answers in a single state object
  const [answers, setAnswers] = useState({
    name: '',
    depressionDuration: '',
    lastEpisodeDate: '',
    primaryGoal: '',
    wantsTips: false
  });

  const [step, setStep] = useState(1);
  const [showPicker, setShowPicker] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const { user, isLoading, signOut } = useUser();
  
  // Add ref to store current user ID to prevent stale values
  const userIdRef = useRef(null);
  
  // When user changes, update the ref
  useEffect(() => {
    if (user?.id) {
      userIdRef.current = user.id;
      console.log('Updated userIdRef:', userIdRef.current);
    }
  }, [user]);
  
  useEffect(() => {
    console.log('survey user:', user);
  }, [user]);

  const handleDateChange = async (event: any, selectedDate: any) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate) {
      setIsProcessing(true);
      setError('');
      
      const newDate = selectedDate.toISOString();
      setAnswers({ ...answers, lastEpisodeDate: newDate });
      
      // Use the ref instead of the user object directly
      const currentUserId = userIdRef.current;
      
      if (currentUserId) {
        try {
          // Set a timeout to prevent UI from getting stuck
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timed out')), 8000)
          );
          
          // Race the actual API call against the timeout
          await Promise.race([
            updateLastEpisodeDate(currentUserId, newDate),
            timeoutPromise
          ]);
          
          console.log('Last episode date updated successfully');
        } catch (err) {
          console.error('Failed to update last episode date:', err);
          setError(err.message || 'Failed to save date. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      } else {
        console.error('No user ID available for update');
        setError('Authentication error. Please try again.');
        setIsProcessing(false);
      }
    }
  };

  // Helper to check if current step has an answer
  const hasAnswerForCurrentStep = () => {
    switch (step) {
      case 1:
        return answers.name.trim().length > 0;
      case 2:
        return answers.depressionDuration !== '';
      case 3:
        return answers.lastEpisodeDate !== '';
      case 4:
        return answers.primaryGoal !== '';
      case 5:
        return answers.wantsTips !== null;
      default:
        return false;
    }
  };

  const handleBack = () => {
    if (step === 1) {
      // Log out the user instead of just navigating back
      if (user) {
        signOut();
      } else {
        router.replace('/');
      }
    } else {
      setStep(step - 1);
    }
  };

  // Save current step's answer to the database
  const saveCurrentStepAnswer = async () => {
    console.log('Saving answer for step:', step);
    
    // Use the ref instead of accessing user.id directly
    const currentUserId = userIdRef.current;
    console.log('Current userId from ref:', currentUserId);
    
    if (!currentUserId) {
      console.error('No user ID available for update');
      setError('Your session may have expired. Please refresh the page.');
      return false;
    }
    
    try {
      // Set a timeout to prevent UI from getting stuck
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 8000)
      );
      
      // Use local copies of data to avoid closure issues
      const currentStepData = { ...answers };
      
      let apiCall;
      switch (step) {
        case 1:
          console.log('updateUsername', currentUserId, currentStepData.name);
          apiCall = updateUsername(currentUserId, currentStepData.name);
          break;
        case 2:
          console.log('updateDepressionDuration', currentUserId, currentStepData.depressionDuration);
          apiCall = updateDepressionDuration(currentUserId, currentStepData.depressionDuration);
          break;
        case 3:
          // Already handled in handleDateChange
          return true;
        case 4:
          console.log('updatePrimaryGoal', currentUserId, currentStepData.primaryGoal);
          apiCall = updatePrimaryGoal(currentUserId, currentStepData.primaryGoal);
          break;
        default:
          return false;
      }
      
      // Race the actual API call against the timeout
      await Promise.race([apiCall, timeoutPromise]);
      
      console.log(`Step ${step} data saved successfully`);
      return true;
    } catch (err) {
      console.error('Error saving step answer:', err);
      setError(err.message || 'Failed to save your answer. Please try again.');
      return false;
    }
  };

  const handleNext = async () => {
    if (step < 5 && hasAnswerForCurrentStep() && !isProcessing) {
      setIsProcessing(true);
      setError('');
      
      try {
        // Save the current step's answer to the database
        const saveSuccess = await saveCurrentStepAnswer();
        
        // Only proceed to next step if save was successful
        if (saveSuccess) {
          setStep(step + 1);
        }
      } catch (err) {
        console.error('Failed to proceed to next step:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSkip = () => {
    // Reset the current step's answer to indicate it was skipped
    const updatedAnswers = { ...answers };
    switch (step) {
      case 1:
        updatedAnswers.name = '';
        break;
      case 2:
        updatedAnswers.depressionDuration = '';
        break;
      case 3:
        updatedAnswers.lastEpisodeDate = '';
        break;
      case 4:
        updatedAnswers.primaryGoal = '';
        break;
      case 5:
        updatedAnswers.wantsTips = false;
        break;
    }
    setAnswers(updatedAnswers);
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleChoiceAndNavigate = async (choice: boolean) => {
    // Use the ref instead of accessing user.id directly
    const currentUserId = userIdRef.current;
    
    if (!currentUserId) {
      console.error('No user ID available for final update');
      router.replace('/tabs/home');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setAnswers({ ...answers, wantsTips: choice });
    
    // Set a timeout that will navigate regardless
    const navigationTimeout = setTimeout(() => {
      console.log('Final step timed out, navigating anyway');
      router.replace('/tabs/home');
    }, 8000);
    
    try {
      // Use Promise.all to run both operations concurrently
      await Promise.all([
        updateWantTips(currentUserId, choice),
        updateIsSurveyCompleted(currentUserId, true)
      ]);
      
      clearTimeout(navigationTimeout);
      console.log('Preferences saved successfully');
      
      // Only navigate after DB operations complete
      router.replace('/tabs/home');
    } catch (err) {
      console.error('Failed to save preferences:', err);
      clearTimeout(navigationTimeout);
      
      setError('Failed to save preferences. Continuing anyway.');
      
      // Navigate even if there was an error, after a short delay so the error can be seen
      setTimeout(() => {
        router.replace('/tabs/home');
      }, 1500);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <SupportIcon />
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          Hi! I'm NoContact Panda, your panda buddy. I'm here to help you go through your breakup. What's your name?
        </Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={answers.name}
        onChangeText={(text) => setAnswers({ ...answers, name: text })}
        placeholderTextColor="#A0A0A0"
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <SupportIcon />
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          How long was your relationship?
        </Text>
      </View>
      {[
        'Less than a month',
        '1-3 months',
        '3-6 months',
        '6-12 months',
        'More than a year'
      ].map((duration) => (
        <TouchableOpacity
          key={duration}
          style={[
            styles.durationButton,
            answers.depressionDuration === duration && styles.selectedButton
          ]}
          onPress={() => {
            setAnswers({ ...answers, depressionDuration: duration });
          }}
        >
          <Text style={styles.durationText}>{duration}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <SupportIcon />
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>When did you break up with your ex?</Text>
      </View>
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
        disabled={isProcessing}
      >
        <Text style={styles.dateButtonText}>Pick date</Text>
      </TouchableOpacity>
      <Text style={styles.dateText}>
        {answers.lastEpisodeDate ? new Date(answers.lastEpisodeDate).toLocaleDateString() : ''}
      </Text>
      {showPicker && (
        <DateTimePicker
          value={answers.lastEpisodeDate ? new Date(answers.lastEpisodeDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <SupportIcon />
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>What's your primary goal right now?</Text>
      </View>
      <View style={styles.goalOptionsContainer}>
        {[
          'Manage symptoms',
          'Understand causes',
          'Build coping skills',
          'Improve daily functioning',
        ].map((goal) => (
          <TouchableOpacity
            key={goal}
            style={[styles.goalButton, answers.primaryGoal === goal && styles.selectedButton]}
            onPress={() => setAnswers({ ...answers, primaryGoal: goal })}
            disabled={isProcessing}
          >
            <Text style={styles.goalText}>{goal}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <SupportIcon />
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          Would you like to receive daily mental wellness tips?
        </Text>
      </View>
      <View style={styles.notificationPreviewContainer}>
        <Text style={[styles.notificationPreview, { fontSize: 96 }]}>
          🧘
        </Text>
      </View>
      <View style={styles.choiceContainer}>
        <TouchableOpacity 
          style={[styles.choiceButton]}
          onPress={() => handleChoiceAndNavigate(false)}
          disabled={isProcessing}
        >
          <Text style={styles.choiceButtonText}>Not now</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.choiceButton, styles.primaryButton]}
          onPress={() => handleChoiceAndNavigate(true)}
          disabled={isProcessing}
        >
          <Text style={styles.primaryButtonText}>Yes, please</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  const renderFooter = () => {
    if (step === 5) return null;
    
    return (
      <View style={styles.footer}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={isProcessing}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.nextButton,
            (!hasAnswerForCurrentStep() || isProcessing) && styles.nextButtonDisabled
          ]}
          onPress={hasAnswerForCurrentStep() && !isProcessing ? handleNext : null}
          disabled={!hasAnswerForCurrentStep() || isProcessing}
        >
          <Text style={[
            styles.nextButtonText,
            (!hasAnswerForCurrentStep() || isProcessing) && styles.nextButtonTextDisabled
          ]}>
            {isProcessing ? 'Saving...' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} disabled={isProcessing}>
            <ChevronLeft size={24} color="#000000" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${(step / 5) * 100}%` }]} 
            />
          </View>
        </View>
        {renderCurrentStep()}
        {renderFooter()}
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
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6a77e3',
    borderRadius: 2,
  },
  stepContainer: {
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
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  durationButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  selectedButton: {
    borderColor: '#6a77e3',
    backgroundColor: '#EEF2FF',
  },
  durationText: {
    fontSize: 16,
    color: '#1F2937',
  },
  dateButton: {
    backgroundColor: '#6a77e3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  dateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 16,
    color: '#6B7280',
  },
  goalOptionsContainer: {
    gap: 12,
  },
  goalButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  goalText: {
    fontSize: 16,
    color: '#1F2937',
  },
  notificationPreviewContainer: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  notificationPreview: {
    fontSize: 24,
    color: '#FFFFFF',
    lineHeight: 32,
  },
  choiceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  choiceButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  choiceButtonText: {
    color: '#1F2937',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  skipButton: {
    padding: 16,
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#6a77e3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: '#9CA3AF',
  },
  primaryButton: {
    backgroundColor: '#6a77e3',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
});

export default SurveyScreen;