import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, Image } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
      {/* Background with Gradient */}
      <LinearGradient
        colors={['#3a47b3', '#4a57c3', '#5a67d3']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
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

          // Define the tab colors based on the route name
          const getTabColor = (routeName: string) => {
            switch (routeName) {
              case 'home': // Time
                return '#FED797'; // Light orange/yellow
              case 'journal':
                return '#7DC6F4'; // Light blue
              case 'learn':
                return '#9CDDB2'; // Light green
              case 'settings':
                return '#D9D9DC'; // Light gray
              default:
                return '#D9D9DC';
            }
          };

          // Set the tab label based on route name
          const getTabLabel = (routeName: string) => {
            switch (routeName) {
              case 'home':
                return 'Time';
              case 'journal':
                return 'Journal';
              case 'learn':
                return 'Learn';
              case 'settings':
                return 'Settings';
              default:
                return routeName;
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[
                styles.tab,
                { backgroundColor: getTabColor(route.name) }
              ]}
            >
              <View style={styles.tabContent}>
                <MaterialCommunityIcons
                  name={getIconName(route.name)}
                  size={20}
                  color="#4A5568"
                />
                <Text style={styles.label}>
                  {getTabLabel(route.name)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Centered Chat Button */}
      <Link href="/chat" asChild>
        <TouchableOpacity style={styles.chatButton}>
          <View style={styles.chatButtonInner}>
            <Image 
              source={require('@/assets/images/face.png')} 
              style={styles.chatButtonImage} 
            />
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 70,
    position: 'relative',
    backgroundColor: '#6a77e3',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    paddingHorizontal: 12,
    paddingBottom: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginHorizontal: 5,
    height: 42,
    maxWidth: 70,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  label: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    marginTop: 2,
    color: '#4A5568',
  },
  chatButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    bottom: 35,
    left: '50%',
    marginLeft: -25,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  chatButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4665F9', // This blue color works well with the new theme
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  chatButtonImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
});

function getIconName(routeName: string): string {
  switch (routeName) {
    case 'home':
      return 'clock-outline'; // Time icon
    case 'journal':
      return 'notebook-outline'; // Journal icon
    case 'learn':
      return 'school'; // Learn/Education icon
    case 'settings':
      return 'cog-outline'; // Settings icon
    default:
      return 'cog-outline';
  }
}