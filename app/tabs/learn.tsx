import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';

type RootStackParamList = {
  'learn/[id]': {
    id: number;
    article: typeof articles[0];
  };
};

type NavigationProps = NavigationProp<RootStackParamList>;

const LearnScreen = () => {
  const navigation = useNavigation<NavigationProps>();

  const articles = [
    {
      id: 1,
      title: 'How to know if you have a problem',
      duration: '9 min',
      type: 'Article',
      author: {
        name: 'Emily Jacobson',
        role: 'Education Lead @ Sunflower',
        avatar: require('@/assets/images/react-logo.png')
      },
      content: 'The journey to understanding addiction begins with recognizing the signs...',
      audioUrl: '/path/to/audio1.mp3'
    },
    {
      id: 2,
      title: 'Why Is Admitting the Problem Powerful?',
      duration: '10 min',
      type: 'Article',
      author: {
        name: 'Emily Jacobson',
        role: 'Education Lead @ Sunflower',
        avatar: require('@/assets/images/react-logo.png')
      },
      content: 'The journey to recovery often begins with a simple yet profound step: admitting theres a problem. It\'s a decision that, though challenging, can spark remarkable transformation...',
      audioUrl: '/path/to/audio2.mp3'
    },
    {
      id: 3,
      title: 'How Do You Actually "Admit the Problem"?',
      duration: '9 min',
      type: 'Article',
      author: {
        name: 'Emily Jacobson',
        role: 'Education Lead @ Sunflower',
        avatar: require('@/assets/images/react-logo.png')
      },
      content: 'Taking the step to admit a problem requires both courage and strategy...',
      audioUrl: '/path/to/audio3.mp3'
    }
  ];

  const ArticleCard = ({ article }: { article: typeof articles[0] }) => (
    <TouchableOpacity 
      style={styles.articleCard}
      onPress={() => navigation.navigate('learn/[id]', { 
        id: article.id,
        article: article
      })}
    >
      <View style={styles.iconContainer}>
        <Feather name="file-text" size={24} color="#4B69FF" />
      </View>
      <View style={styles.articleInfo}>
        <Text style={styles.articleTitle}>{article.title}</Text>
        <View style={styles.articleMeta}>
          <Feather name="clock" size={16} color="#666" />
          <Text style={styles.metaText}>{article.duration}</Text>
          <Text style={styles.metaDivider}>|</Text>
          <Text style={styles.metaText}>{article.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Understanding Addiction</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progress} />
          </View>
          <Text style={styles.progressText}>Completed 0%</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Text style={styles.sectionNumber}>01. </Text>
          Admitting you have a problem
        </Text>

        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E8EAF6',
    borderRadius: 4,
    marginBottom: 8,
  },
  progress: {
    width: '0%',
    height: 8,
    backgroundColor: '#4B69FF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 18,
    color: '#666',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  sectionNumber: {
    color: '#4B69FF',
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#EEF0FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  articleInfo: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#666',
    marginLeft: 4,
  },
  metaDivider: {
    color: '#666',
    marginHorizontal: 8,
  },
});

export default LearnScreen;