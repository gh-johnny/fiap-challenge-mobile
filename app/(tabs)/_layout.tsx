import { Tabs } from 'expo-router';

import { LiquidGlassTabBar } from '@/components/liquid-glass-tab-bar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="my-car" />
      <Tabs.Screen name="schedule" />
      <Tabs.Screen name="ai-assistant" />
    </Tabs>
  );
}
