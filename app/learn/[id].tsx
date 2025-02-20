import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const ArticleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { article } = route.params;

  const handleAudioPlay = () => {
    // Implement audio playback functionality
    console.log('Playing audio from:', article.audioUrl);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>

        {/* Article Title */}
        <Text style={styles.title}>{article.title}</Text>

        {/* Author Info */}
        <View style={styles.authorContainer}>
          <Image
            source={{ uri: article.author.avatar }}
            style={styles.authorAvatar}
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>By {article.author.name}</Text>
            <Text style={styles.authorRole}>{article.author.role}</Text>
          </View>
        </View>

        {/* Read Time */}
        <Text style={styles.readTime}>{article.duration} read</Text>

        {/* Audio Player Button */}
        <TouchableOpacity 
          style={styles.audioButton}
          onPress={handleAudioPlay}
        >
          <Feather name="play" size={24} color="white" />
          <Text style={styles.audioButtonText}>Listen to article</Text>
        </TouchableOpacity>

        {/* Article Content */}
        <Text style={styles.articleContent}>{article.content}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
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
  readTime: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
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
  articleContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
});

export default ArticleScreen;