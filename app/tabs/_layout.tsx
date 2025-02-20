// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case 'home':
              return <MaterialCommunityIcons name="clock-outline" size={24} color={focused ? '#4B7BF5' : '#8E8E93'} />;
            case 'journal':
              return <MaterialCommunityIcons name="pencil" size={24} color={focused ? '#4B7BF5' : '#8E8E93'} />;
            case 'learn':
              return <MaterialCommunityIcons name="book-outline" size={24} color={focused ? '#4B7BF5' : '#8E8E93'} />;
            case 'settings':
              return <MaterialCommunityIcons name="cog-outline" size={24} color={focused ? '#4B7BF5' : '#8E8E93'} />;
            default:
              return <MaterialCommunityIcons name="alert-circle-outline" size={24} color={focused ? '#4B7BF5' : '#8E8E93'} />;
          }
        },
        tabBarActiveTintColor: '#4B7BF5',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: styles.tabBar,
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: 'SpaceMono',
          fontSize: 12,
          marginTop: 5,
        },
        tabBarShowLabel: true,
        tabBarItemStyle: {
          paddingBottom: 0,
        },
      })}
    >
      <Tabs.Screen 
        name="home"
        options={{
          title: 'Time',
        }}
      />
      <Tabs.Screen 
        name="journal"
        options={{
          title: 'Journal',
        }}
      />
      <Tabs.Screen 
        name="learn"
        options={{
          title: 'Learn',
        }}
      />
      <Tabs.Screen 
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    height: 85,
    paddingTop: 10,
    paddingBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});