import { Tabs, Stack } from 'expo-router';
import { CustomTabBar } from './components/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
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