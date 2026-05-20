import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

const { width } = Dimensions.get('window');
const SZ = Math.min(width * 0.78, 300);

const AnimatedG = Animated.createAnimatedComponent(G);

function useEntrance(delay = 0, dur = 700) {
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: dur, easing: Easing.out(Easing.cubic) }));
  }, []);
  return opacity;
}

function useGroupProps(sv: ReturnType<typeof useSharedValue<number>>) {
  return useAnimatedProps(() => ({ opacity: sv.value }));
}

// ─── Slide 1 — Schedule ──────────────────────────────────────────────────────

export function ScheduleIllustration() {
  const bg   = useEntrance(0, 600);
  const card = useEntrance(150, 500);
  const grid = useEntrance(380, 500);
  const appt = useEntrance(650, 500);

  const bgProps   = useGroupProps(bg);
  const cardProps = useGroupProps(card);
  const gridProps = useGroupProps(grid);
  const apptProps = useGroupProps(appt);

  const cx = SZ / 2;

  // Card
  const cX = SZ * 0.07, cY = SZ * 0.08;
  const cW = SZ * 0.86, cH = SZ * 0.76;
  const hH = SZ * 0.17;

  // Grid — 7 cols × 5 rows
  const COLS = 7, ROWS = 5;
  const gPad = SZ * 0.032;
  const cGap = SZ * 0.008;
  const cellW = (cW - gPad * 2 - cGap * (COLS - 1)) / COLS;
  const cellH = SZ * 0.068;
  const gX = cX + gPad;
  const gY = cY + hH + SZ * 0.048;
  const HI_ROW = 2, HI_COL = 4;

  // Appointment bar
  const apptY = gY + ROWS * (cellH + cGap) + SZ * 0.016;
  const apptH = SZ * 0.092;

  return (
    <Svg width={SZ} height={SZ}>
      <Defs>
        <LinearGradient id="sch-card" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0A1432" stopOpacity="0.98" />
          <Stop offset="1" stopColor="#05081C" stopOpacity="0.98" />
        </LinearGradient>
        <LinearGradient id="sch-hdr" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#0142C0" />
          <Stop offset="1" stopColor="#1E5FDC" />
        </LinearGradient>
        <LinearGradient id="sch-appt" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#0142C0" stopOpacity="0.92" />
          <Stop offset="1" stopColor="#1E5FDC" stopOpacity="0.92" />
        </LinearGradient>
      </Defs>

      {/* Ambient blobs */}
      <AnimatedG animatedProps={bgProps}>
        <Circle cx={cx} cy={cx - SZ*0.05} r={SZ*0.42}
          fill="rgba(51,133,255,0.28)"
          style={{ filter: `blur(${SZ*0.18}px)` } as any} />
        <Circle cx={SZ*0.80} cy={SZ*0.14} r={SZ*0.16}
          fill="rgba(100,50,240,0.20)"
          style={{ filter: `blur(${SZ*0.10}px)` } as any} />
      </AnimatedG>

      {/* Card */}
      <AnimatedG animatedProps={cardProps}>
        <Rect x={cX+SZ*0.01} y={cY+SZ*0.018} width={cW} height={cH} rx={SZ*0.045}
          fill="rgba(0,0,0,0.28)"
          style={{ filter: `blur(${SZ*0.04}px)` } as any} />
        <Rect x={cX} y={cY} width={cW} height={cH} rx={SZ*0.045} fill="url(#sch-card)" />
        <Rect x={cX} y={cY} width={cW} height={cH} rx={SZ*0.045}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        <Rect x={cX} y={cY} width={cW} height={hH} rx={SZ*0.045} fill="url(#sch-hdr)" />
        <Rect x={cX} y={cY+hH*0.55} width={cW} height={hH*0.45} fill="url(#sch-hdr)" />
        {/* Month label */}
        <Line x1={cX+cW*0.07} y1={cY+hH*0.36} x2={cX+cW*0.44} y2={cY+hH*0.36}
          stroke="rgba(255,255,255,0.95)" strokeWidth={3} strokeLinecap="round" />
        <Line x1={cX+cW*0.07} y1={cY+hH*0.66} x2={cX+cW*0.26} y2={cY+hH*0.66}
          stroke="rgba(255,255,255,0.50)" strokeWidth={2} strokeLinecap="round" />
        {/* Chevron */}
        <Path d={`M ${cX+cW*0.84} ${cY+hH*0.28} L ${cX+cW*0.90} ${cY+hH*0.52} L ${cX+cW*0.84} ${cY+hH*0.76}`}
          fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={2.2}
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Day-of-week dots */}
        {Array.from({ length: COLS }).map((_, c) => (
          <Circle key={c}
            cx={gX + c*(cellW+cGap) + cellW*0.5}
            cy={cY + hH + SZ*0.024}
            r={SZ*0.008}
            fill="rgba(107,122,163,0.55)" />
        ))}
      </AnimatedG>

      {/* Grid cells */}
      <AnimatedG animatedProps={gridProps}>
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => {
            const isHi   = r === HI_ROW && c === HI_COL;
            const isSoft = (r === HI_ROW && (c === HI_COL-1 || c === HI_COL+1))
                        || (r === HI_ROW-1 && c === HI_COL);
            const x = gX + c*(cellW+cGap);
            const y = gY + r*(cellH+cGap);
            return (
              <G key={`${r}-${c}`}>
                {isHi && (
                  <Rect x={x} y={y} width={cellW} height={cellH} rx={SZ*0.014}
                    fill="rgba(51,133,255,0.45)"
                    style={{ filter: 'blur(7px)' } as any} />
                )}
                <Rect x={x} y={y} width={cellW} height={cellH} rx={SZ*0.014}
                  fill={isHi ? 'rgba(1,66,192,0.92)' : isSoft ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.04)'} />
                <Line
                  x1={x + SZ*0.006} y1={y + cellH*0.50}
                  x2={x + cellW - SZ*0.006} y2={y + cellH*0.50}
                  stroke={isHi ? 'rgba(255,255,255,0.92)' : isSoft ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.16)'}
                  strokeWidth={isHi ? 3 : isSoft ? 2.2 : 1.6}
                  strokeLinecap="round" />
              </G>
            );
          })
        )}
      </AnimatedG>

      {/* Appointment bar */}
      <AnimatedG animatedProps={apptProps}>
        <Rect x={cX+gPad} y={apptY} width={cW-gPad*2} height={apptH} rx={SZ*0.022}
          fill="rgba(1,66,192,0.40)"
          style={{ filter: 'blur(10px)' } as any} />
        <Rect x={cX+gPad} y={apptY} width={cW-gPad*2} height={apptH} rx={SZ*0.022}
          fill="url(#sch-appt)" />
        <Rect x={cX+gPad} y={apptY} width={cW-gPad*2} height={apptH} rx={SZ*0.022}
          fill="none" stroke="rgba(100,160,255,0.28)" strokeWidth={1} />
        <Rect x={cX+gPad+SZ*0.007} y={apptY+SZ*0.009} width={SZ*0.014} height={apptH-SZ*0.018} rx={SZ*0.007}
          fill="rgba(255,255,255,0.95)" />
        <Line x1={cX+gPad+SZ*0.036} y1={apptY+apptH*0.35}
              x2={cX+cW-gPad-SZ*0.10} y2={apptY+apptH*0.35}
          stroke="rgba(255,255,255,0.95)" strokeWidth={2.8} strokeLinecap="round" />
        <Line x1={cX+gPad+SZ*0.036} y1={apptY+apptH*0.68}
              x2={cX+gPad+SZ*0.036+(cW-gPad*2)*0.42} y2={apptY+apptH*0.68}
          stroke="rgba(255,255,255,0.52)" strokeWidth={1.8} strokeLinecap="round" />
      </AnimatedG>
    </Svg>
  );
}

// ─── Slide 2 — Track ─────────────────────────────────────────────────────────

export function TrackIllustration() {
  const bg  = useEntrance(0, 600);
  const car = useEntrance(200, 700);
  const pin = useEntrance(750, 500);

  const bgProps  = useGroupProps(bg);
  const carProps = useGroupProps(car);
  const pinProps = useGroupProps(pin);

  const cx = SZ / 2;

  // Car geometry — proper sedan proportions
  const hoodY   = SZ * 0.48;
  const roofY   = SZ * 0.30;
  const carBotY = SZ * 0.63;
  const cL      = SZ * 0.06;
  const cR      = SZ * 0.94;
  const wsBaseX = SZ * 0.28;
  const roofSX  = SZ * 0.37;
  const roofEX  = SZ * 0.70;
  const cwBaseX = SZ * 0.79;
  const bPilX   = SZ * 0.535;

  const fWX = SZ * 0.23, rWX = SZ * 0.78;
  const wCY = SZ * 0.67, wR  = SZ * 0.082;
  const roadY = SZ * 0.80;

  const bodyD = [
    `M ${cL} ${carBotY}`,
    `L ${cL} ${hoodY+SZ*0.042}`,
    `Q ${cL+SZ*0.028} ${hoodY} ${cL+SZ*0.090} ${hoodY}`,
    `L ${wsBaseX} ${hoodY-SZ*0.022}`,
    `L ${roofSX} ${roofY}`,
    `L ${roofEX} ${roofY}`,
    `L ${cwBaseX} ${hoodY-SZ*0.016}`,
    `L ${cR-SZ*0.090} ${hoodY}`,
    `Q ${cR-SZ*0.028} ${hoodY} ${cR} ${hoodY+SZ*0.042}`,
    `L ${cR} ${carBotY} Z`,
  ].join(' ');

  const frontGlass = `M ${wsBaseX} ${hoodY-SZ*0.022} L ${roofSX} ${roofY} L ${bPilX} ${roofY} L ${bPilX} ${hoodY-SZ*0.022} Z`;
  const rearGlass  = `M ${bPilX} ${roofY} L ${roofEX} ${roofY} L ${cwBaseX} ${hoodY-SZ*0.016} L ${bPilX} ${hoodY-SZ*0.022} Z`;

  return (
    <Svg width={SZ} height={SZ}>
      <Defs>
        <LinearGradient id="trk-body" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0150D4" />
          <Stop offset="1" stopColor="#00287A" />
        </LinearGradient>
        <LinearGradient id="trk-wh" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#0E1D38" />
          <Stop offset="1" stopColor="#060D1C" />
        </LinearGradient>
        <LinearGradient id="trk-pin" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4498FF" />
          <Stop offset="1" stopColor="#0142C0" />
        </LinearGradient>
      </Defs>

      {/* Ambient */}
      <AnimatedG animatedProps={bgProps}>
        <Circle cx={cx} cy={SZ*0.58} r={SZ*0.38}
          fill="rgba(1,66,192,0.28)"
          style={{ filter: `blur(${SZ*0.16}px)` } as any} />
        <Circle cx={SZ*0.20} cy={SZ*0.24} r={SZ*0.18}
          fill="rgba(100,50,240,0.20)"
          style={{ filter: `blur(${SZ*0.10}px)` } as any} />
        <Circle cx={SZ*0.82} cy={SZ*0.26} r={SZ*0.14}
          fill="rgba(51,133,255,0.18)"
          style={{ filter: `blur(${SZ*0.08}px)` } as any} />
      </AnimatedG>

      {/* Car + road */}
      <AnimatedG animatedProps={carProps}>
        {/* Ground glow */}
        <Circle cx={cx} cy={wCY+SZ*0.06} r={SZ*0.30}
          fill="rgba(1,66,192,0.18)"
          style={{ filter: `blur(${SZ*0.10}px)` } as any} />

        {/* Road */}
        <Path d={`M ${SZ*0.02} ${roadY} Q ${cx} ${roadY-SZ*0.06} ${SZ*0.98} ${roadY}`}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SZ*0.075} />
        {[0.20, 0.43, 0.66].map((t, i) => (
          <Line key={i}
            x1={SZ*t} y1={roadY-SZ*0.002}
            x2={SZ*(t+0.10)} y2={roadY-SZ*0.002}
            stroke="rgba(51,133,255,0.50)" strokeWidth={2} strokeLinecap="round" />
        ))}

        {/* Body */}
        <Path d={bodyD} fill="url(#trk-body)" />
        <Path d={bodyD} fill="none" stroke="rgba(80,150,255,0.55)" strokeWidth={1.8} />

        {/* Glass */}
        <Path d={frontGlass} fill="rgba(51,133,255,0.28)" />
        <Path d={rearGlass}  fill="rgba(51,133,255,0.22)" />
        <Path d={`M ${wsBaseX} ${hoodY-SZ*0.022} L ${roofSX} ${roofY} L ${roofEX} ${roofY} L ${cwBaseX} ${hoodY-SZ*0.016}`}
          fill="none" stroke="rgba(140,195,255,0.55)" strokeWidth={1.5} strokeLinecap="round" />

        {/* B-pillar */}
        <Line x1={bPilX} y1={roofY} x2={bPilX} y2={hoodY-SZ*0.018}
          stroke="rgba(0,22,72,0.96)" strokeWidth={SZ*0.017} />
        <Line x1={bPilX} y1={hoodY-SZ*0.018} x2={bPilX} y2={carBotY}
          stroke="rgba(255,255,255,0.18)" strokeWidth={1.4} />

        {/* Door handle */}
        <Line x1={bPilX+SZ*0.055} y1={hoodY+SZ*0.056}
              x2={bPilX+SZ*0.155} y2={hoodY+SZ*0.056}
          stroke="rgba(255,255,255,0.88)" strokeWidth={3.5} strokeLinecap="round" />

        {/* Headlight beams */}
        {[0, SZ*0.036, SZ*0.068].map((off, i) => (
          <Line key={i}
            x1={cR} y1={hoodY+SZ*0.100+off}
            x2={cR+SZ*0.060} y2={hoodY+SZ*0.058+off-SZ*0.008*i}
            stroke={`rgba(51,133,255,${0.90-i*0.22})`} strokeWidth={2.8} strokeLinecap="round" />
        ))}

        {/* Taillights */}
        <Line x1={cL} y1={hoodY+SZ*0.080} x2={cL-SZ*0.038} y2={hoodY+SZ*0.080}
          stroke="rgba(229,57,53,0.88)" strokeWidth={4.5} strokeLinecap="round" />
        <Line x1={cL} y1={hoodY+SZ*0.160} x2={cL-SZ*0.028} y2={hoodY+SZ*0.160}
          stroke="rgba(229,57,53,0.50)" strokeWidth={3} strokeLinecap="round" />

        {/* Wheels */}
        {[fWX, rWX].map((wX, wi) => (
          <G key={wi}>
            <Circle cx={wX} cy={wCY} r={wR+SZ*0.022}
              fill="rgba(51,133,255,0.20)"
              style={{ filter: 'blur(8px)' } as any} />
            <Circle cx={wX} cy={wCY} r={wR} fill="url(#trk-wh)" />
            <Circle cx={wX} cy={wCY} r={wR}
              fill="none" stroke="rgba(51,133,255,0.72)" strokeWidth={2.5} />
            <Circle cx={wX} cy={wCY} r={wR*0.42}
              fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} />
            {[0, 60, 120].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <Line key={deg}
                  x1={wX + Math.cos(rad)*wR*0.42} y1={wCY + Math.sin(rad)*wR*0.42}
                  x2={wX + Math.cos(rad)*wR*0.85} y2={wCY + Math.sin(rad)*wR*0.85}
                  stroke="rgba(255,255,255,0.22)" strokeWidth={1.8} strokeLinecap="round" />
              );
            })}
            <Circle cx={wX} cy={wCY} r={SZ*0.012} fill="#3385FF" />
          </G>
        ))}
      </AnimatedG>

      {/* GPS pin */}
      <AnimatedG animatedProps={pinProps}>
        {[SZ*0.10, SZ*0.14, SZ*0.18].map((r, i) => (
          <Circle key={i} cx={cx} cy={SZ*0.17} r={r}
            fill="none" stroke={`rgba(51,133,255,${0.28-i*0.08})`} strokeWidth={1.5} />
        ))}
        <Circle cx={cx} cy={SZ*0.17} r={SZ*0.06}
          fill="rgba(51,133,255,0.38)"
          style={{ filter: 'blur(10px)' } as any} />
        <Path
          d={`M ${cx} ${SZ*0.29} Q ${cx-SZ*0.065} ${SZ*0.20} ${cx-SZ*0.065} ${SZ*0.15} Q ${cx-SZ*0.065} ${SZ*0.09} ${cx} ${SZ*0.09} Q ${cx+SZ*0.065} ${SZ*0.09} ${cx+SZ*0.065} ${SZ*0.15} Q ${cx+SZ*0.065} ${SZ*0.20} ${cx} ${SZ*0.29} Z`}
          fill="url(#trk-pin)" />
        <Circle cx={cx} cy={SZ*0.17} r={SZ*0.028} fill="rgba(255,255,255,0.96)" />
        <Circle cx={cx} cy={SZ*0.17} r={SZ*0.013} fill="#0142C0" />
        <Line x1={cx} y1={SZ*0.30} x2={cx} y2={SZ*0.35}
          stroke="rgba(255,255,255,0.28)" strokeWidth={2} strokeLinecap="round" />
      </AnimatedG>
    </Svg>
  );
}

// ─── Slide 3 — Support ───────────────────────────────────────────────────────

export function SupportIllustration() {
  const bg = useEntrance(0, 600);
  const b1 = useEntrance(100, 550);
  const b2 = useEntrance(400, 550);
  const b3 = useEntrance(680, 500);
  const sp = useEntrance(800, 500);

  const bgProps = useGroupProps(bg);
  const b1Props = useGroupProps(b1);
  const b2Props = useGroupProps(b2);
  const b3Props = useGroupProps(b3);
  const spProps = useGroupProps(sp);

  const cx = SZ / 2;

  const b1X = SZ*0.05, b1Y = SZ*0.08, b1W = SZ*0.66, b1H = SZ*0.22;
  const b2X = SZ*0.29, b2Y = SZ*0.38, b2W = SZ*0.66, b2H = SZ*0.22;
  const b3X = SZ*0.05, b3Y = SZ*0.68, b3W = SZ*0.36, b3H = SZ*0.14;

  return (
    <Svg width={SZ} height={SZ}>
      <Defs>
        <LinearGradient id="sup-b1" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0D1A3C" stopOpacity="0.97" />
          <Stop offset="1" stopColor="#08122D" stopOpacity="0.97" />
        </LinearGradient>
        <LinearGradient id="sup-b2" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#003CB4" stopOpacity="0.95" />
          <Stop offset="1" stopColor="#001E64" stopOpacity="0.95" />
        </LinearGradient>
        <LinearGradient id="sup-star" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="rgba(100,180,255,0.95)" />
          <Stop offset="1" stopColor="rgba(1,66,192,0.95)" />
        </LinearGradient>
      </Defs>

      {/* Ambient */}
      <AnimatedG animatedProps={bgProps}>
        <Circle cx={cx} cy={SZ*0.52} r={SZ*0.40}
          fill="rgba(51,133,255,0.30)"
          style={{ filter: `blur(${SZ*0.16}px)` } as any} />
        <Circle cx={SZ*0.80} cy={SZ*0.20} r={SZ*0.22}
          fill="rgba(107,53,240,0.28)"
          style={{ filter: `blur(${SZ*0.12}px)` } as any} />
        <Circle cx={SZ*0.15} cy={SZ*0.75} r={SZ*0.16}
          fill="rgba(1,66,192,0.22)"
          style={{ filter: `blur(${SZ*0.10}px)` } as any} />
      </AnimatedG>

      {/* Bubble 1 — user */}
      <AnimatedG animatedProps={b1Props}>
        <Rect x={b1X} y={b1Y} width={b1W} height={b1H} rx={SZ*0.045}
          fill="rgba(1,66,192,0.18)"
          style={{ filter: 'blur(10px)' } as any} />
        <Rect x={b1X} y={b1Y} width={b1W} height={b1H} rx={SZ*0.045} fill="url(#sup-b1)" />
        <Rect x={b1X} y={b1Y} width={b1W} height={b1H} rx={SZ*0.045}
          fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={1} />
        <Path d={`M ${b1X+SZ*0.06} ${b1Y+b1H} L ${b1X+SZ*0.02} ${b1Y+b1H+SZ*0.05} L ${b1X+SZ*0.16} ${b1Y+b1H}`}
          fill="#08122D" />
        <Line x1={b1X+SZ*0.08} y1={b1Y+b1H*0.38} x2={b1X+b1W-SZ*0.08} y2={b1Y+b1H*0.38}
          stroke="rgba(255,255,255,0.60)" strokeWidth={2.5} strokeLinecap="round" />
        <Line x1={b1X+SZ*0.08} y1={b1Y+b1H*0.65} x2={b1X+b1W*0.60} y2={b1Y+b1H*0.65}
          stroke="rgba(255,255,255,0.35)" strokeWidth={2} strokeLinecap="round" />
      </AnimatedG>

      {/* Bubble 2 — AI */}
      <AnimatedG animatedProps={b2Props}>
        <Rect x={b2X} y={b2Y} width={b2W} height={b2H} rx={SZ*0.045}
          fill="rgba(51,133,255,0.18)"
          style={{ filter: 'blur(12px)' } as any} />
        <Rect x={b2X} y={b2Y} width={b2W} height={b2H} rx={SZ*0.045} fill="url(#sup-b2)" />
        <Rect x={b2X} y={b2Y} width={b2W} height={b2H} rx={SZ*0.045}
          fill="none" stroke="rgba(100,160,255,0.30)" strokeWidth={1} />
        <Path d={`M ${b2X+b2W-SZ*0.16} ${b2Y+b2H} L ${b2X+b2W+SZ*0.02} ${b2Y+b2H+SZ*0.05} L ${b2X+b2W-SZ*0.06} ${b2Y+b2H}`}
          fill="#001E64" />
        <Line x1={b2X+SZ*0.08} y1={b2Y+b2H*0.38} x2={b2X+b2W-SZ*0.08} y2={b2Y+b2H*0.38}
          stroke="rgba(255,255,255,0.85)" strokeWidth={2.5} strokeLinecap="round" />
        <Line x1={b2X+SZ*0.08} y1={b2Y+b2H*0.65} x2={b2X+b2W*0.68} y2={b2Y+b2H*0.65}
          stroke="rgba(255,255,255,0.55)" strokeWidth={2} strokeLinecap="round" />
      </AnimatedG>

      {/* Bubble 3 — typing */}
      <AnimatedG animatedProps={b3Props}>
        <Rect x={b3X} y={b3Y} width={b3W} height={b3H} rx={SZ*0.035}
          fill="#08122D" fillOpacity={0.90} />
        <Rect x={b3X} y={b3Y} width={b3W} height={b3H} rx={SZ*0.035}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        {[0, SZ*0.08, SZ*0.16].map((offset, i) => (
          <Circle key={i}
            cx={b3X+b3W*0.22+offset} cy={b3Y+b3H*0.52}
            r={SZ*0.024}
            fill={`rgba(51,133,255,${1-i*0.28})`} />
        ))}
        <Path d={`M ${b3X+SZ*0.06} ${b3Y+b3H} L ${b3X+SZ*0.02} ${b3Y+b3H+SZ*0.04} L ${b3X+SZ*0.14} ${b3Y+b3H}`}
          fill="#08122D" />
      </AnimatedG>

      {/* AI sparkle */}
      <AnimatedG animatedProps={spProps}>
        <Circle cx={SZ*0.78} cy={SZ*0.16} r={SZ*0.09}
          fill="rgba(51,133,255,0.35)"
          style={{ filter: 'blur(12px)' } as any} />
        <Path
          d={`M ${SZ*0.78} ${SZ*0.07} L ${SZ*0.808} ${SZ*0.138} L ${SZ*0.876} ${SZ*0.16} L ${SZ*0.808} ${SZ*0.182} L ${SZ*0.78} ${SZ*0.25} L ${SZ*0.752} ${SZ*0.182} L ${SZ*0.684} ${SZ*0.16} L ${SZ*0.752} ${SZ*0.138} Z`}
          fill="url(#sup-star)" />
        <Path
          d={`M ${SZ*0.66} ${SZ*0.10} L ${SZ*0.674} ${SZ*0.128} L ${SZ*0.702} ${SZ*0.136} L ${SZ*0.674} ${SZ*0.144} L ${SZ*0.66} ${SZ*0.172} L ${SZ*0.646} ${SZ*0.144} L ${SZ*0.618} ${SZ*0.136} L ${SZ*0.646} ${SZ*0.128} Z`}
          fill="rgba(255,255,255,0.55)" />
      </AnimatedG>
    </Svg>
  );
}

// ─── Vehicle setup — Car silhouette (SVG, animated draw-on) ──────────────────

const AnimatedSvgPath   = Animated.createAnimatedComponent(Path);
const AnimatedSvgCircle = Animated.createAnimatedComponent(Circle);
const AnimatedSvgRect   = Animated.createAnimatedComponent(Rect);
const AnimatedSvgLine   = Animated.createAnimatedComponent(Line);

const BLUE_S   = '#3385FF';
const WHITE_S  = 'rgba(255,255,255,0.90)';
const WHITE2_S = 'rgba(255,255,255,0.32)';
const GLOW_S   = 'rgba(51,133,255,0.28)';
const FILL1_S  = 'rgba(1,66,192,0.30)';

function useDraw(len: number, delay = 0, dur = 800) {
  const sv = useSharedValue(len);
  useEffect(() => {
    sv.value = withDelay(delay, withTiming(0, { duration: dur, easing: Easing.out(Easing.cubic) }));
  }, []);
  return useAnimatedProps(() => ({ strokeDashoffset: sv.value }));
}

function useFillSvg(delay = 0, dur = 600) {
  const sv = useSharedValue(0);
  useEffect(() => {
    sv.value = withDelay(delay, withTiming(1, { duration: dur, easing: Easing.out(Easing.quad) }));
  }, []);
  return useAnimatedProps(() => ({ fillOpacity: sv.value }));
}

// Sedan profile in 300×156 viewBox — same paths as native version
export function CarSilhouette() {
  const glow    = useFillSvg(0, 800);
  const body    = useDraw(1000, 0, 1200);
  const roof    = useDraw(700, 300, 900);
  const winFill = useFillSvg(600, 600);
  const wheels  = useDraw(320, 900, 700);
  const details = useDraw(280, 1100, 600);
  const ground  = useDraw(900, 200, 1000);

  const W2 = SZ;
  const H2 = SZ * 0.52;

  return (
    <Svg width={W2} height={H2} viewBox="0 0 300 156">
      <AnimatedSvgCircle cx="150" cy="124" r="95" fill={GLOW_S} animatedProps={glow} stroke="none" />
      <AnimatedSvgPath d="M10 112 L290 112"
        stroke={WHITE2_S} strokeWidth="1.5" strokeLinecap="round"
        strokeDasharray="900" animatedProps={ground} fill="none" />

      {/* Car body */}
      <AnimatedSvgPath
        d="M16 104 L16 84 Q20 74 34 74 L82 70 L104 42 L200 42 L228 70 L264 74 Q278 74 284 84 L284 104 Z"
        stroke={BLUE_S} strokeWidth="3.5" fill={FILL1_S}
        strokeDasharray="1000" animatedProps={body} strokeLinejoin="round" />
      <AnimatedSvgPath d="M104 42 L200 42"
        stroke={BLUE_S} strokeWidth="3.5" strokeLinecap="round"
        strokeDasharray="700" animatedProps={roof} fill="none" />

      {/* Glass fills */}
      <AnimatedSvgRect x="82" y="42" width="74" height="32" rx="2"
        fill="rgba(51,133,255,0.26)" fillOpacity={0} stroke="none"
        animatedProps={winFill} />
      <AnimatedSvgRect x="156" y="42" width="72" height="32" rx="2"
        fill="rgba(51,133,255,0.20)" fillOpacity={0} stroke="none"
        animatedProps={winFill} />

      {/* B-pillar */}
      <AnimatedSvgLine x1="156" y1="42" x2="156" y2="74"
        stroke="rgba(0,20,60,0.90)" strokeWidth="8"
        strokeDasharray="280" animatedProps={details} />
      <AnimatedSvgLine x1="156" y1="74" x2="156" y2="104"
        stroke={WHITE2_S} strokeWidth="2"
        strokeDasharray="280" animatedProps={details} />

      {/* Door handle */}
      <AnimatedSvgLine x1="172" y1="88" x2="196" y2="88"
        stroke={WHITE_S} strokeWidth="4" strokeLinecap="round"
        strokeDasharray="280" animatedProps={details} />

      {/* Front wheel */}
      <AnimatedSvgCircle cx="72" cy="112" r="24"
        stroke={BLUE_S} strokeWidth="3.5" fill="rgba(2,8,20,0.94)"
        strokeDasharray="320" animatedProps={wheels} />
      <AnimatedSvgCircle cx="72" cy="112" r="11"
        stroke={WHITE2_S} strokeWidth="2" fill="none"
        strokeDasharray="200" animatedProps={wheels} />
      <AnimatedSvgCircle cx="72" cy="112" r="4"
        fill={BLUE_S} stroke="none" strokeDasharray="50" animatedProps={wheels} />

      {/* Rear wheel */}
      <AnimatedSvgCircle cx="228" cy="112" r="24"
        stroke={BLUE_S} strokeWidth="3.5" fill="rgba(2,8,20,0.94)"
        strokeDasharray="320" animatedProps={wheels} />
      <AnimatedSvgCircle cx="228" cy="112" r="11"
        stroke={WHITE2_S} strokeWidth="2" fill="none"
        strokeDasharray="200" animatedProps={wheels} />
      <AnimatedSvgCircle cx="228" cy="112" r="4"
        fill={BLUE_S} stroke="none" strokeDasharray="50" animatedProps={wheels} />

      {/* Headlights */}
      <AnimatedSvgPath d="M282 78 L294 72 M282 86 L295 86 M282 94 L294 100"
        stroke={BLUE_S} strokeWidth="3" strokeLinecap="round"
        strokeDasharray="280" animatedProps={details} fill="none" />

      {/* Taillights */}
      <AnimatedSvgPath d="M18 76 L6 76 M18 86 L5 86"
        stroke="rgba(229,57,53,0.75)" strokeWidth="3.5" strokeLinecap="round"
        strokeDasharray="280" animatedProps={details} fill="none" />
    </Svg>
  );
}
