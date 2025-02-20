import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

const { width } = Dimensions.get('window');

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const visibleRoutes = state.routes.filter((route: any) => route.name !== 'chat');
  
  return (
    <View style={styles.container}>
      {/* Curved Background */}
      <View style={styles.backgroundContainer}>
        <View style={styles.background} />
        <View style={styles.centerCurve} />
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabsContainer}>
        {visibleRoutes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
            >
              <MaterialCommunityIcons
                name={getIconName(route.name)}
                size={24}
                color={isFocused ? '#4B7BF5' : '#8E8E93'}
              />
              <Text style={[
                styles.label,
                { color: isFocused ? '#4B7BF5' : '#8E8E93' }
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Centered Chat Button */}
      <Link href="/chat" asChild>
        <TouchableOpacity style={styles.chatButton}>
          <View style={styles.chatButtonInner}>
            <MaterialCommunityIcons name="bee" size={32} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 85,
    position: 'relative',
  },
  backgroundContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    width: '100%',
  },
  background: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  centerCurve: {
    position: 'absolute',
    width: 90,
    height: 45,
    backgroundColor: '#ffffff',
    top: -20,
    left: '50%',
    marginLeft: -45,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    zIndex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    paddingHorizontal: 20,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingTop: 10,
    flex: 1,
  },
  label: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    marginTop: 5,
  },
  chatButton: {
    position: 'absolute',
    width: 70,
    height: 70,
    bottom: 40,
    left: '50%',
    marginLeft: -35,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  chatButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4B7BF5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4B7BF5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

function getIconName(routeName: string): string {
  switch (routeName) {
    case 'home':
      return 'clock-outline';
    case 'journal':
      return 'pencil';
    case 'learn':
      return 'book-outline';
    case 'settings':
      return 'cog-outline';
    default:
      return 'cog-outline';
  }
}