import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MeshGradient } from '@/components/mesh-gradient';
import { ScheduleIllustration, SupportIllustration, TrackIllustration } from '@/components/slide-illustrations';
import { Colors, Spacing } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Schedule Service',
    subtitle: 'Book maintenance, repairs, and inspections at any Ford dealer — in seconds.',
    Illustration: ScheduleIllustration,
    accent: '#0057FF',
  },
  {
    id: '2',
    title: 'Track Your Vehicle',
    subtitle: "Real-time status on your car's service progress. No more waiting on hold.",
    Illustration: TrackIllustration,
    accent: '#1A6BFF',
  },
  {
    id: '3',
    title: 'Get Support',
    subtitle: 'AI-powered assistance and live chat with Ford specialists, 24/7.',
    Illustration: SupportIllustration,
    accent: '#3385FF',
  },
];

function AnimatedWords({ text, baseDelay = 0, small = false }: { text: string; baseDelay?: number; small?: boolean }) {
  const words = text.split(' ');
  return (
    <View style={styles.wordsRow}>
      {words.map((word, i) => (
        <AnimatedWord key={i} word={word} delay={baseDelay + i * 50} small={small} />
      ))}
    </View>
  );
}

function AnimatedWord({ word, delay, small }: { word: string; delay: number; small?: boolean }) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(14);

  useEffect(() => {
    const cfg = { duration: 380, easing: Easing.out(Easing.cubic) };
    opacity.value = withDelay(delay, withTiming(1, cfg));
    y.value = withDelay(delay, withTiming(0, cfg));
  }, [delay]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.Text style={[small ? styles.wordSmall : styles.wordChunk, style]}>{word} </Animated.Text>
  );
}

// Vertical segmented progress bar
function ProgressBar({ total, active }: { total: number; active: number }) {
  return (
    <View style={styles.progressBar}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.progressSegment, i === active && styles.progressSegmentActive]}
        />
      ))}
    </View>
  );
}

function Slide({ slide, isActive }: { slide: typeof SLIDES[0]; isActive: boolean }) {
  const { Illustration } = slide;

  return (
    <View style={styles.slide}>
      {/* Illustration — top 60% */}
      <View style={styles.illustrationArea}>
        {isActive && <Illustration />}
      </View>

      {/* Text — bottom 40% */}
      <View style={styles.textArea}>
        {isActive && (
          <>
            <View style={styles.titleRow}>
              <AnimatedWords text={slide.title} baseDelay={200} />
            </View>
            <View style={styles.subtitleRow}>
              <AnimatedWords text={slide.subtitle} baseDelay={500} small />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

export default function SlidesScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const isScrolling = useRef(false);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / height);
    if (index !== activeIndex && index >= 0 && index < SLIDES.length) {
      setActiveIndex(index);
      Haptics.selectionAsync();
    }
  }

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / height);
    if (index >= SLIDES.length) {
      router.replace('/(onboarding)/vehicle-setup');
    }
  }

  return (
    <View style={styles.root}>
      <MeshGradient />

      <ScrollView
        ref={scrollRef}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        // Extra snap point to trigger navigation on swipe past last slide
        contentContainerStyle={{ height: height * (SLIDES.length + 0.3) }}
      >
        {SLIDES.map((slide, i) => (
          <Slide key={slide.id} slide={slide} isActive={activeIndex === i} />
        ))}
      </ScrollView>

      {/* Right-edge progress */}
      <SafeAreaView style={styles.progressWrapper} pointerEvents="none">
        <ProgressBar total={SLIDES.length} active={activeIndex} />
      </SafeAreaView>

      {/* Swipe hint on first slide */}
      {activeIndex === 0 && (
        <SafeAreaView style={styles.hintWrapper} pointerEvents="none">
          <Text style={styles.hint}>swipe up</Text>
          <Text style={styles.hintArrow}>↑</Text>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationArea: {
    height: height * 0.52,
    width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    height: height * 0.35,
    width,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    gap: Spacing.md,
  },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap' },
  subtitleRow: { flexDirection: 'row', flexWrap: 'wrap' },
  wordsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  wordChunk: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
  },
  wordSmall: {
    color: Colors.mutedLight,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
  },
  progressWrapper: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  progressBar: { gap: 8 },
  progressSegment: {
    width: 3,
    height: 36,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressSegmentActive: {
    backgroundColor: Colors.blue,
    height: 52,
  },
  hintWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  hint: { color: Colors.muted, fontSize: 12, letterSpacing: 2 },
  hintArrow: { color: Colors.muted, fontSize: 18, marginTop: 4 },
});
