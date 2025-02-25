import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Image, View, Text, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  updateUsername, 
  updateDepressionDuration, 
  updateLastEpisodeDate,
  updatePrimaryGoal,
  updateWantTips,
  updateIsSurveyCompleted
} from '@/services/surveyService'; // Import the survey service functions
import { useUser } from '@/hooks/useUser'; // Add this import

const SupportIcon = () => (
  <Image
    source={require('@/assets/images/react-logo.png')}
    style={styles.supportIcon}
  />
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
  const { user } = useUser(); // Use the useUser hook to get the current user

  const handleDateChange = (event: any, selectedDate: any) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate) {
      const newDate = selectedDate.toISOString();
      setAnswers({ ...answers, lastEpisodeDate: newDate });
      // Update the lastEpisodeDate in the database
      if (user?.id) {
        updateLastEpisodeDate(user.id, newDate);
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
      router.back();
    } else {
      setStep(step - 1);
    }
  };

  const handleNext = () => {
    if (step < 5 && hasAnswerForCurrentStep()) {
      // Save the current step's answer to the database
      saveCurrentStepAnswer();
      setStep(step + 1);
    }
  };

  // Save current step's answer to the database
  const saveCurrentStepAnswer = () => {
    if (!user?.id) return; // Add a guard clause
    
    switch (step) {
      case 1:
        updateUsername(user.id, answers.name);
        break;
      case 2:
        updateDepressionDuration(user.id, answers.depressionDuration);
        break;
      case 3:
        // Already handled in handleDateChange
        break;
      case 4:
        updatePrimaryGoal(user.id, answers.primaryGoal);
        break;
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

  const handleChoiceAndNavigate = (choice: boolean) => {
    setAnswers({ ...answers, wantsTips: choice });
    
    if (user?.id) {
      // Update want tips preference
      updateWantTips(user.id, choice);
      
      // Mark the survey as completed regardless of choice
      updateIsSurveyCompleted(user.id, true);
    }
    
    // Navigate to tabs/home
    router.replace('/tabs/home');
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <SupportIcon />
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          Hi! I'm Kufu, your panda buddy. I'm here to help you create a healthier lifestyle. What's your name?
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
          How long have you been experiencing depression?
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
        <Text style={styles.messageText}>When did your most recent depressive episode begin?</Text>
      </View>
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
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
      <Image
        source={require('@/assets/images/react-logo.png')}
        style={styles.notificationPreview}
      />
      <View style={styles.choiceContainer}>
        <TouchableOpacity 
          style={[styles.choiceButton]}
          onPress={() => handleChoiceAndNavigate(false)}
        >
          <Text style={styles.choiceButtonText}>Not now</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.choiceButton, styles.primaryButton]}
          onPress={() => handleChoiceAndNavigate(true)}
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
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.nextButton,
            !hasAnswerForCurrentStep() && styles.nextButtonDisabled
          ]}
          onPress={hasAnswerForCurrentStep() ? handleNext : null}
        >
          <Text style={[
            styles.nextButtonText,
            !hasAnswerForCurrentStep() && styles.nextButtonTextDisabled
          ]}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
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
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  stepContainer: {
    flex: 1,
    padding: 24,
  },
  supportIcon: {
    width: 48,
    height: 48,
    marginBottom: 16,
  },
  messageContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  messageText: {
    fontSize: 24,
    color: '#1F2937',
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
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  durationText: {
    fontSize: 16,
    color: '#1F2937',
  },
  dateButton: {
    backgroundColor: '#4F46E5',
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
  notificationPreview: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 24,
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
    backgroundColor: '#4F46E5',
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
    backgroundColor: '#4F46E5',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default SurveyScreen;