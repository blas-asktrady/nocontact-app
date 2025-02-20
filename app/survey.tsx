import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Image, View, Text, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react';

const BeeIcon = () => (
  <Image
    source={require('@/assets/images/react-logo.png')}
    style={styles.beeIcon}
  />
);

const SurveyScreen = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedSubstance, setSelectedSubstance] = useState('');
  const [quitDate, setQuitDate] = useState('about 1 month ago');
  const [selectedStyle, setSelectedStyle] = useState('');

  const handleBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(step - 1);
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <BeeIcon />
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          Hi friend my name is Sam! I'm going to be your AI Sponsor.
          It's really nice to meet you! What should I call you?
        </Text>
      </View>
      <Text style={styles.inputLabel}>Your name (or nickname)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#A0A0A0"
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <BeeIcon />
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          What are you trying to stop using? This will help me be a better sponsor.
        </Text>
      </View>
      {['Alcohol', 'Nicotine', 'Cannabis', 'Cocaine', 'Oxycontin'].map((substance) => (
        <TouchableOpacity
          key={substance}
          style={[
            styles.substanceButton,
            selectedSubstance === substance && styles.selectedButton
          ]}
          onPress={() => setSelectedSubstance(substance)}
        >
          <Text style={styles.substanceText}>{substance}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.somethingElseButton}>
        <Text style={styles.somethingElseText}>+ Something Else</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <BeeIcon />
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>When did you quit using?</Text>
      </View>
      <TouchableOpacity style={styles.dateButton}>
        <Text style={styles.dateButtonText}>Select Date</Text>
      </TouchableOpacity>
      <Text style={styles.dateText}>{quitDate}</Text>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <BeeIcon />
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>Which style field do you prefer?</Text>
      </View>
      <Text style={styles.subtitleText}>
        Each day sober, you'll grow a sunflower in your field
      </Text>
      <View style={styles.styleOptionsContainer}>
        {/* Add your style field images here */}
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <BeeIcon />
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          Would you like me to send you messages along the way?
        </Text>
      </View>
      <Image
        source={require('@/assets/images/react-logo.png')}
        style={styles.notificationPreview}
      />
      <View style={styles.choiceContainer}>
        <TouchableOpacity style={styles.choiceButton}>
          <Text style={styles.choiceButtonText}>No, thanks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.choiceButton, styles.primaryButton]}>
          <Text style={styles.primaryButtonText}>Go for it</Text>
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
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
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
  beeIcon: {
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
  inputLabel: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
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
  substanceButton: {
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
  substanceText: {
    fontSize: 16,
    color: '#1F2937',
  },
  somethingElseButton: {
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  somethingElseText: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 16,
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
  subtitleText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  styleOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
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
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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