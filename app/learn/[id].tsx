import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import learningsData from '../../assets/learnings/learnings.json';
import { router } from 'expo-router';

const ArticleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};
  const [article, setArticle] = useState(null);
  
  useEffect(() => {
    // Find the stage with the matching ID
    if (id) {
      const foundStage = learningsData.stages.find(stage => stage.id === id);
      if (foundStage) {
        // Combine blog info with stage info
        setArticle({
          ...foundStage,
          title: foundStage.title,
          author: {
            name: learningsData.blog.author_name,
            role: learningsData.blog.author_role,
            avatar: require('@/assets/images/emily.jpg')
          },
          duration: foundStage.estimated_duration || learningsData.blog.duration,
          audioUrl: learningsData.blog.audio_url
        });
      }
    }
  }, [id]);

  const handleAudioPlay = () => {
    // Implement audio playback functionality
    console.log('Playing audio from:', article?.audioUrl);
  };

  const handleBackPress = () => {
    // Check if we can go back
    const canGoBack = navigation.canGoBack();
    
    if (canGoBack) {
      navigation.goBack();
    } else {
      // Redirect to /learn if we can't go back
        router.replace('/tabs/learn');
    }
  };

  if (!article) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Loading article...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>

        {/* Article Title */}
        <Text style={styles.title}>{article.title}</Text>

        {/* Author Info */}
        <View style={styles.authorContainer}>
          <Image
            source={article.author.avatar}
            style={styles.authorAvatar}
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>By {article.author.name}</Text>
            <Text style={styles.authorRole}>{article.author.role}</Text>
          </View>
        </View>

        {/* Read Time */}
        <View style={styles.readTimeContainer}>
          <Feather name="clock" size={16} color="#666666" />
          <Text style={styles.readTime}>{article.duration} read</Text>
        </View>

        {/* Audio Player Button */}
        <TouchableOpacity 
          style={styles.audioButton}
          onPress={handleAudioPlay}
        >
          <Feather name="play" size={24} color="white" />
          <Text style={styles.audioButtonText}>Listen to article</Text>
        </TouchableOpacity>

        {/* Article Content with Markdown */}
        <Markdown style={markdownStyles}>
          {article.content}
        </Markdown>
      </View>
    </ScrollView>
  );
};

const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 24,
    marginBottom: 16,
  },
  heading3: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 16,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  authorRole: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  readTime: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 6,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4B69FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  audioButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8,
  },
  markdownContainer: {
    marginTop: 10,
  },
  headerLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 24,
    marginBottom: 16,
  },
  headerMedium: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 16,
  },
});

export default ArticleScreen;