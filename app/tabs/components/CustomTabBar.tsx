import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, Image } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const visibleRoutes = state.routes.filter((route: any) => route.name !== 'chat');
  
  // Calculate positions to create more space around the center
  const leftTabs = visibleRoutes.slice(0, 2); // First two tabs
  const rightTabs = visibleRoutes.slice(2);   // Last two tabs
  
  // Check if home is the selected tab
  const isHomeSelected = state.routes[state.index]?.name === 'home';
  
  return (
    <View style={[styles.container, isHomeSelected && styles.homeContainer]}>
      {/* Background with Gradient */}
      <LinearGradient
        colors={['#3a47b3', '#4a57c3', '#5a67d3']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      {/* Tab Buttons - Split into left and right groups */}
      <View style={styles.tabsContainer}>
        {/* Left side tabs */}
        <View style={styles.tabGroup}>
          {leftTabs.map((route: any, index: number) => {
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

            // Set the tab label based on route name
            const getTabLabel = (routeName: string) => {
              switch (routeName) {
                case 'home':
                  return 'Home';
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
                ]}
              >
                <View style={styles.tabContent}>
                  <Image 
                    source={getIconSource(route.name)}
                    style={styles.tabIcon}
                  />
                  <Text style={[
                    styles.label,
                    route.name === 'home' ? styles.homeLabel : null
                  ]}>
                    {getTabLabel(route.name)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Center space for chat button */}
        <View style={styles.centerSpace} />
        
        {/* Right side tabs */}
        <View style={styles.tabGroup}>
          {rightTabs.map((route: any, index: number) => {
            const actualIndex = index + leftTabs.length;
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel ?? options.title ?? route.name;
            const isFocused = state.index === actualIndex;

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

            // Set the tab label based on route name
            const getTabLabel = (routeName: string) => {
              switch (routeName) {
                case 'home':
                  return 'Home';
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
                ]}
              >
                <View style={styles.tabContent}>
                  <Image 
                    source={getIconSource(route.name)}
                    style={styles.tabIcon}
                  />
                  <Text style={[
                    styles.label,
                    route.name === 'home' ? styles.homeLabel : null
                  ]}>
                    {getTabLabel(route.name)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Centered Chat Button */}
      <Link href="/chat" asChild>
        <TouchableOpacity style={styles.chatButton}>
          <View style={styles.chatButtonInner}>
            <Image 
              source={require('@/assets/navbar/icons-face.png')} 
              style={styles.chatButtonImage} 
            />
          </View>
          <Text style={styles.chatLabel}>Chat</Text>
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
    backgroundColor: '#fff',
  },
  homeContainer: {
    backgroundColor: '#57a836',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    paddingHorizontal: 12,
    paddingBottom: 5,
  },
  tabGroup: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  centerSpace: {
    width: 65, // Reduced from 80 to 65 to create less separation
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
    fontFamily: 'System',
    fontSize: 13,
    marginTop: 4,
    color: 'white',
    fontWeight: '500',
  },
  homeLabel: {
    color: 'white', 
    fontWeight: '600',
    fontSize: 13,
    fontFamily: 'System',
  },
  homeIcon: {
    // You can remove this style completely
  },
  chatButton: {
    position: 'absolute',
    width: 50,
    height: 70, 
    bottom: 15, // Increased from 10 to 15 to move it higher
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
    backgroundColor: '#4665F9',
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
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  chatLabel: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    fontFamily: 'System',
  },
  tabIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
});

function getIconSource(routeName: string): any {
  switch (routeName) {
    case 'home':
      return require('@/assets/navbar/icons8-house-96.png');
    case 'journal':
      return require('@/assets/navbar/icons8-journal-96.png');
    case 'learn':
      return require('@/assets/navbar/icons8-school-96.png');
    case 'settings':
      return require('@/assets/navbar/icons8-settings-96.png');
    default:
      return require('@/assets/navbar/icons8-settings-96.png');
  }
}