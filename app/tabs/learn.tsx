import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';

// Import the learnings data
import learningsData from '@/assets/learnings/learnings.json';

type RootStackParamList = {
  'learn/[id]': {
    id: string;
    stage: typeof learningsData.stages[0];
  };
};

type NavigationProps = NavigationProp<RootStackParamList>;

const LearnScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const [stages, setStages] = useState<typeof learningsData.stages>([]);
  const [blog, setBlog] = useState<typeof learningsData.blog | null>(null);

  useEffect(() => {
    setStages(learningsData.stages);
    setBlog(learningsData.blog);
  }, []);

  const StageCard = ({ stage }: { stage: typeof learningsData.stages[0] }) => (
    <TouchableOpacity 
      style={styles.stageCard}
      onPress={() => navigation.navigate('learn/[id]', { 
        id: stage.id,
        stage: stage
      })}
    >
      <View style={styles.stageNumberContainer}>
        <Text style={styles.stageNumber}>{stage.number}</Text>
      </View>
      
      <View style={styles.stageContentContainer}>
        <Text style={styles.stageTitle}>{stage.title}</Text>
        <Text style={styles.stageDescription} numberOfLines={2}>
          {stage.short_description}
        </Text>
        
        <View style={styles.stageMetaContainer}>
          <View style={styles.stageMetaIconContainer}>
            <Feather name="clock" size={14} color="#6B7280" />
            <Text style={styles.stageMetaText}>
              {stage.estimated_duration} | Stage {stage.number}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.stageChevronContainer}>
        <Feather name="chevron-right" size={24} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>
          {blog?.title || "Understanding Grief"}
        </Text>
        <Text style={styles.headerSubtitle}>
          {blog?.description || ""}
        </Text>
      </View>

      <View style={styles.stagesContainer}>
        <Text style={styles.sectionTitle}>Stages of Grief</Text>
        {stages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6a77e3',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#5a67d3',
    borderBottomWidth: 1,
    borderBottomColor: '#4a57c3',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 24,
  },
  stagesContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  stageCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    padding: 16,
  },
  stageNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stageNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  stageContentContainer: {
    flex: 1,
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stageDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  stageMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageMetaIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageMetaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  stageChevronContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LearnScreen;