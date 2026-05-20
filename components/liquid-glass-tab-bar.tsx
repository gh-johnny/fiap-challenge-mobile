import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { Colors, Radius } from '@/constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  index:          { active: 'home',           inactive: 'home-outline' },
  'my-car':       { active: 'car-sport',      inactive: 'car-sport-outline' },
  schedule:       { active: 'calendar',       inactive: 'calendar-outline' },
  'ai-assistant': { active: 'sparkles',       inactive: 'sparkles-outline' },
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  'my-car': 'My Car',
  schedule: 'Schedule',
  'ai-assistant': 'AI',
};

export function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 8 }]}>
      <BlurView
        intensity={Platform.OS === 'android' ? 40 : 60}
        tint="light"
        style={styles.blur}
      >
        <View style={styles.inner}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const icons = TAB_ICONS[route.name];
            const iconName = icons ? (isFocused ? icons.active : icons.inactive) : 'ellipse';
            const label = TAB_LABELS[route.name] ?? route.name;

            function onPress() {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tab}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
              >
                {isFocused && <View style={styles.activeBlob} />}
                <Ionicons
                  name={iconName}
                  size={22}
                  color={isFocused ? Colors.blue : Colors.muted}
                />
                <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
  },
  blur: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(1,66,192,0.20)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(238,242,255,0.92)' : 'transparent',
  },
  inner: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
    position: 'relative',
  },
  activeBlob: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 8,
    right: 8,
    backgroundColor: Colors.blue,
    borderRadius: Radius.lg,
    opacity: 0.2,
  },
  label: { fontSize: 10, color: Colors.muted, fontWeight: '500' },
  labelActive: { color: Colors.blue, fontWeight: '700' },
});
