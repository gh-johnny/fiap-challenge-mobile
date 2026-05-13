import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');
const W = width * 0.85;
const H = W;
const STROKE = 1.8;
const COLOR = '#3385FF';
const DIM = 'rgba(255,255,255,0.15)';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedLine = Animated.createAnimatedComponent(Line);

function useDraw(length: number, delay = 0, duration = 900) {
  const progress = useSharedValue(length);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.cubic) }));
  }, []);
  return useAnimatedProps(() => ({ strokeDashoffset: progress.value }));
}

// Slide 1 — Calendar with clock hands + checkmark
export function ScheduleIllustration() {
  const calBody = useDraw(600, 0, 900);
  const grid1 = useDraw(200, 200, 600);
  const grid2 = useDraw(200, 350, 600);
  const grid3 = useDraw(200, 500, 600);
  const check = useDraw(120, 800, 500);
  const clockFace = useDraw(300, 300, 700);
  const hourHand = useDraw(60, 900, 400);
  const minHand = useDraw(80, 1000, 400);

  return (
    <Svg width={W} height={H} viewBox="0 0 200 200">
      {/* Calendar body */}
      <AnimatedPath
        d="M30 50 L30 160 Q30 165 35 165 L165 165 Q170 165 170 160 L170 50 Z"
        stroke={COLOR} strokeWidth={STROKE} fill="none"
        strokeDasharray="600" animatedProps={calBody}
      />
      {/* Header bar */}
      <AnimatedPath
        d="M30 50 L170 50 L170 72 L30 72 Z"
        stroke={COLOR} strokeWidth={STROKE} fill="rgba(51,133,255,0.12)"
        strokeDasharray="600" animatedProps={calBody}
      />
      {/* Rings */}
      <AnimatedPath d="M70 40 L70 58" stroke={COLOR} strokeWidth={STROKE * 1.5} strokeLinecap="round" strokeDasharray="200" animatedProps={grid1} />
      <AnimatedPath d="M100 40 L100 58" stroke={COLOR} strokeWidth={STROKE * 1.5} strokeLinecap="round" strokeDasharray="200" animatedProps={grid1} />
      <AnimatedPath d="M130 40 L130 58" stroke={COLOR} strokeWidth={STROKE * 1.5} strokeLinecap="round" strokeDasharray="200" animatedProps={grid1} />
      {/* Grid cells row 1 */}
      <AnimatedPath d="M48 90 L58 90 M78 90 L88 90 M108 90 L118 90 M138 90 L148 90" stroke={DIM} strokeWidth={STROKE} strokeLinecap="round" strokeDasharray="200" animatedProps={grid1} />
      {/* Grid cells row 2 */}
      <AnimatedPath d="M48 108 L58 108 M78 108 L88 108 M108 108 L118 108 M138 108 L148 108" stroke={DIM} strokeWidth={STROKE} strokeLinecap="round" strokeDasharray="200" animatedProps={grid2} />
      {/* Grid cells row 3 */}
      <AnimatedPath d="M48 126 L58 126 M78 126 L88 126 M108 126 L118 126" stroke={DIM} strokeWidth={STROKE} strokeLinecap="round" strokeDasharray="200" animatedProps={grid3} />
      {/* Highlighted cell */}
      <AnimatedRect x="128" y="118" width="20" height="16" rx="3" stroke={COLOR} strokeWidth={STROKE} fill="rgba(51,133,255,0.2)" strokeDasharray="200" animatedProps={grid3} />
      {/* Checkmark */}
      <AnimatedPath d="M132 126 L136 130 L144 122" stroke={COLOR} strokeWidth={STROKE * 1.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="120" animatedProps={check} />
      {/* Clock overlay bottom right */}
      <AnimatedCircle cx="155" cy="155" r="20" stroke={COLOR} strokeWidth={STROKE} fill="rgba(2,8,18,0.9)" strokeDasharray="300" animatedProps={clockFace} />
      <AnimatedLine x1="155" y1="155" x2="155" y2="143" stroke={COLOR} strokeWidth={STROKE * 1.2} strokeLinecap="round" strokeDasharray="60" animatedProps={hourHand} />
      <AnimatedLine x1="155" y1="155" x2="163" y2="155" stroke={COLOR} strokeWidth={STROKE} strokeLinecap="round" strokeDasharray="80" animatedProps={minHand} />
    </Svg>
  );
}

// Slide 2 — Car on road with location pin
export function TrackIllustration() {
  const road = useDraw(500, 0, 800);
  const carBody = useDraw(400, 300, 800);
  const wheels = useDraw(200, 700, 500);
  const pin = useDraw(200, 900, 600);
  const signal1 = useDraw(100, 1100, 400);
  const signal2 = useDraw(120, 1250, 400);
  const signal3 = useDraw(140, 1400, 400);

  return (
    <Svg width={W} height={H} viewBox="0 0 200 200">
      {/* Road */}
      <AnimatedPath d="M0 140 Q100 130 200 140" stroke={DIM} strokeWidth={STROKE * 3} fill="none" strokeDasharray="500" animatedProps={road} />
      <AnimatedPath d="M20 140 L40 140 M80 140 L100 140 M140 140 L160 140" stroke={COLOR} strokeWidth={STROKE} fill="none" strokeLinecap="round" strokeDasharray="500" animatedProps={road} />
      {/* Car body */}
      <AnimatedPath
        d="M50 130 L50 118 Q52 110 62 108 L90 104 Q100 100 108 104 L130 108 Q140 110 142 118 L142 130 Z"
        stroke={COLOR} strokeWidth={STROKE} fill="rgba(51,133,255,0.1)" strokeDasharray="400" animatedProps={carBody}
      />
      {/* Windshield */}
      <AnimatedPath d="M68 108 L66 118 L126 118 L122 108 Z" stroke={COLOR} strokeWidth={STROKE} fill="rgba(51,133,255,0.2)" strokeDasharray="400" animatedProps={carBody} />
      {/* Wheels */}
      <AnimatedCircle cx="72" cy="132" r="8" stroke={COLOR} strokeWidth={STROKE} fill="rgba(2,8,18,0.9)" strokeDasharray="200" animatedProps={wheels} />
      <AnimatedCircle cx="120" cy="132" r="8" stroke={COLOR} strokeWidth={STROKE} fill="rgba(2,8,18,0.9)" strokeDasharray="200" animatedProps={wheels} />
      <AnimatedCircle cx="72" cy="132" r="3" stroke={COLOR} strokeWidth={STROKE} fill="none" strokeDasharray="200" animatedProps={wheels} />
      <AnimatedCircle cx="120" cy="132" r="3" stroke={COLOR} strokeWidth={STROKE} fill="none" strokeDasharray="200" animatedProps={wheels} />
      {/* Location pin */}
      <AnimatedPath
        d="M96 30 Q96 20 106 20 Q116 20 116 30 Q116 42 106 52 Q96 42 96 30 Z"
        stroke={COLOR} strokeWidth={STROKE} fill="rgba(51,133,255,0.15)" strokeDasharray="200" animatedProps={pin}
      />
      <AnimatedCircle cx="106" cy="30" r="4" stroke={COLOR} strokeWidth={STROKE} fill="none" strokeDasharray="200" animatedProps={pin} />
      {/* Signal arcs */}
      <AnimatedPath d="M118 18 Q126 26 118 34" stroke={COLOR} strokeWidth={STROKE} fill="none" strokeLinecap="round" strokeDasharray="100" animatedProps={signal1} />
      <AnimatedPath d="M123 13 Q134 26 123 39" stroke={COLOR} strokeWidth={STROKE * 0.8} fill="none" strokeLinecap="round" strokeDasharray="120" animatedProps={signal2} />
      <AnimatedPath d="M128 8 Q142 26 128 44" stroke={DIM} strokeWidth={STROKE * 0.6} fill="none" strokeLinecap="round" strokeDasharray="140" animatedProps={signal3} />
      {/* Dashed line from pin to car */}
      <AnimatedPath d="M106 52 L106 100" stroke={DIM} strokeWidth={STROKE} strokeDasharray="4 6" animatedProps={pin} />
    </Svg>
  );
}

// Slide 3 — Chat bubbles with AI spark
export function SupportIllustration() {
  const bubble1 = useDraw(300, 0, 700);
  const bubble2 = useDraw(250, 400, 650);
  const bubble3 = useDraw(200, 750, 600);
  const spark = useDraw(150, 1000, 500);
  const dots = useDraw(100, 500, 400);

  return (
    <Svg width={W} height={H} viewBox="0 0 200 200">
      {/* Left bubble 1 */}
      <AnimatedPath
        d="M20 55 Q20 45 30 45 L120 45 Q130 45 130 55 L130 75 Q130 85 120 85 L40 85 L30 95 L34 85 Q20 85 20 75 Z"
        stroke={COLOR} strokeWidth={STROKE} fill="rgba(51,133,255,0.1)" strokeDasharray="300" animatedProps={bubble1}
      />
      <AnimatedPath d="M32 62 L118 62 M32 72 L88 72" stroke={DIM} strokeWidth={STROKE} strokeLinecap="round" strokeDasharray="300" animatedProps={bubble1} />

      {/* Right bubble 2 — AI response */}
      <AnimatedPath
        d="M180 105 Q180 95 170 95 L70 95 Q60 95 60 105 L60 125 Q60 135 70 135 L160 135 L170 145 L166 135 Q180 135 180 125 Z"
        stroke={COLOR} strokeWidth={STROKE} fill="rgba(51,133,255,0.18)" strokeDasharray="250" animatedProps={bubble2}
      />
      <AnimatedPath d="M72 112 L168 112 M72 122 L130 122" stroke={COLOR} strokeWidth={STROKE * 0.8} strokeLinecap="round" strokeDasharray="250" animatedProps={bubble2} />

      {/* Left bubble 3 — typing */}
      <AnimatedPath
        d="M20 150 Q20 140 30 140 L90 140 Q100 140 100 150 L100 165 Q100 175 90 175 L40 175 L30 183 L34 175 Q20 175 20 165 Z"
        stroke={DIM} strokeWidth={STROKE} fill="none" strokeDasharray="200" animatedProps={bubble3}
      />
      {/* Typing dots */}
      <AnimatedCircle cx="42" cy="157" r="3" stroke={COLOR} strokeWidth={STROKE} fill="none" strokeDasharray="100" animatedProps={dots} />
      <AnimatedCircle cx="57" cy="157" r="3" stroke={COLOR} strokeWidth={STROKE} fill="none" strokeDasharray="100" animatedProps={dots} />
      <AnimatedCircle cx="72" cy="157" r="3" stroke={COLOR} strokeWidth={STROKE} fill="none" strokeDasharray="100" animatedProps={dots} />

      {/* AI spark top right */}
      <AnimatedPath
        d="M160 30 L163 38 L171 41 L163 44 L160 52 L157 44 L149 41 L157 38 Z"
        stroke={COLOR} strokeWidth={STROKE} fill="rgba(51,133,255,0.2)" strokeLinejoin="round" strokeDasharray="150" animatedProps={spark}
      />
      <AnimatedPath d="M148 22 L150 26 L154 28 L150 30 L148 34 L146 30 L142 28 L146 26 Z" stroke={DIM} strokeWidth={STROKE * 0.8} fill="none" strokeLinejoin="round" strokeDasharray="80" animatedProps={spark} />
    </Svg>
  );
}

// Vehicle setup — Ford car silhouette (side view)
export function CarSilhouette() {
  const body = useDraw(800, 0, 1200);
  const windows = useDraw(300, 600, 700);
  const wheels = useDraw(250, 900, 600);
  const details = useDraw(200, 1100, 500);

  return (
    <Svg width={W} height={W * 0.5} viewBox="0 0 300 150">
      {/* Car body */}
      <AnimatedPath
        d="M20 100 L20 80 Q22 65 40 60 L90 48 Q110 38 140 36 L180 36 Q210 38 230 48 L260 60 Q278 65 280 80 L280 100 Z"
        stroke={COLOR} strokeWidth={STROKE * 1.2} fill="rgba(51,133,255,0.07)" strokeDasharray="800" animatedProps={body}
      />
      {/* Roof line */}
      <AnimatedPath
        d="M80 60 Q100 36 140 32 L180 32 Q215 34 240 60"
        stroke={COLOR} strokeWidth={STROKE * 1.2} fill="none" strokeDasharray="800" animatedProps={body}
      />
      {/* Windshield */}
      <AnimatedPath d="M100 60 L112 36 L162 36 L162 60 Z" stroke={COLOR} strokeWidth={STROKE} fill="rgba(51,133,255,0.15)" strokeDasharray="300" animatedProps={windows} />
      {/* Rear window */}
      <AnimatedPath d="M168 60 L178 36 L220 36 L235 60 Z" stroke={COLOR} strokeWidth={STROKE} fill="rgba(51,133,255,0.15)" strokeDasharray="300" animatedProps={windows} />
      {/* Door line */}
      <AnimatedPath d="M163 60 L163 98" stroke={DIM} strokeWidth={STROKE} strokeDasharray="200" animatedProps={details} />
      {/* Handle */}
      <AnimatedPath d="M175 80 L190 80" stroke={COLOR} strokeWidth={STROKE * 1.5} strokeLinecap="round" strokeDasharray="200" animatedProps={details} />
      {/* Front wheel */}
      <AnimatedCircle cx="80" cy="104" r="22" stroke={COLOR} strokeWidth={STROKE * 1.2} fill="rgba(2,8,18,0.9)" strokeDasharray="250" animatedProps={wheels} />
      <AnimatedCircle cx="80" cy="104" r="10" stroke={DIM} strokeWidth={STROKE} fill="none" strokeDasharray="200" animatedProps={wheels} />
      <AnimatedCircle cx="80" cy="104" r="4" stroke={COLOR} strokeWidth={STROKE} fill="none" strokeDasharray="100" animatedProps={wheels} />
      {/* Rear wheel */}
      <AnimatedCircle cx="222" cy="104" r="22" stroke={COLOR} strokeWidth={STROKE * 1.2} fill="rgba(2,8,18,0.9)" strokeDasharray="250" animatedProps={wheels} />
      <AnimatedCircle cx="222" cy="104" r="10" stroke={DIM} strokeWidth={STROKE} fill="none" strokeDasharray="200" animatedProps={wheels} />
      <AnimatedCircle cx="222" cy="104" r="4" stroke={COLOR} strokeWidth={STROKE} fill="none" strokeDasharray="100" animatedProps={wheels} />
      {/* Ground line */}
      <AnimatedPath d="M10 126 L290 126" stroke={DIM} strokeWidth={STROKE * 0.8} strokeDasharray="800" animatedProps={body} />
      {/* Headlight */}
      <AnimatedPath d="M278 72 L285 68 M278 78 L286 78 M278 84 L285 88" stroke={COLOR} strokeWidth={STROKE} strokeLinecap="round" strokeDasharray="200" animatedProps={details} />
    </Svg>
  );
}
