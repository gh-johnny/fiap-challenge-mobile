import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Easing, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import {
  BlurMask, Canvas, Circle, Group, Line, LinearGradient,
  Paint, Path, RoundedRect, vec,
} from '@shopify/react-native-skia';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, {
  Circle as SvgCircle,
  Line as SvgLine,
  Path as SvgPath,
  Rect as SvgRect,
} from 'react-native-svg';

const { width } = Dimensions.get('window');
const SZ = Math.min(width * 0.78, 300);

function useEntrance(delay = 0, dur = 700) {
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: dur, easing: Easing.out(Easing.cubic) }));
  }, []);
  return opacity;
}

// ─── Slide 1 — Schedule ──────────────────────────────────────────────────────

export function ScheduleIllustration() {
  const bg   = useEntrance(0, 600);
  const card = useEntrance(150, 500);
  const grid = useEntrance(380, 500);
  const appt = useEntrance(650, 500);

  const cx = SZ / 2;

  // Card
  const cX = SZ * 0.07, cY = SZ * 0.08;
  const cW = SZ * 0.86, cH = SZ * 0.76;
  const hH = SZ * 0.17;

  // Grid — 7 cols × 5 rows of cells
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
    <Canvas style={{ width: SZ, height: SZ }}>
      {/* Ambient blobs */}
      <Group opacity={bg}>
        <Circle cx={cx} cy={cx - SZ * 0.05} r={SZ * 0.42}>
          <Paint color="rgba(51,133,255,0.28)">
            <BlurMask blur={SZ * 0.18} style="normal" />
          </Paint>
        </Circle>
        <Circle cx={SZ * 0.80} cy={SZ * 0.14} r={SZ * 0.16}>
          <Paint color="rgba(100,50,240,0.20)">
            <BlurMask blur={SZ * 0.10} style="normal" />
          </Paint>
        </Circle>
      </Group>

      {/* Card */}
      <Group opacity={card}>
        <RoundedRect x={cX + SZ*0.01} y={cY + SZ*0.018} width={cW} height={cH} r={SZ * 0.045}>
          <Paint color="rgba(0,0,0,0.28)">
            <BlurMask blur={SZ * 0.04} style="normal" />
          </Paint>
        </RoundedRect>
        <RoundedRect x={cX} y={cY} width={cW} height={cH} r={SZ * 0.045}>
          <LinearGradient
            start={vec(cX, cY)} end={vec(cX, cY + cH)}
            colors={['rgba(10,20,50,0.98)', 'rgba(5,12,28,0.98)']}
          />
        </RoundedRect>
        <RoundedRect x={cX} y={cY} width={cW} height={cH} r={SZ * 0.045}>
          <Paint color="rgba(255,255,255,0.08)" style="stroke" strokeWidth={1} />
        </RoundedRect>

        {/* Blue header */}
        <RoundedRect x={cX} y={cY} width={cW} height={hH} r={SZ * 0.045}>
          <LinearGradient
            start={vec(cX, cY)} end={vec(cX + cW, cY)}
            colors={['#0142C0', '#1E5FDC']}
          />
        </RoundedRect>
        <RoundedRect x={cX} y={cY + hH * 0.55} width={cW} height={hH * 0.45} r={0}>
          <LinearGradient
            start={vec(cX, cY)} end={vec(cX + cW, cY)}
            colors={['#0142C0', '#1E5FDC']}
          />
        </RoundedRect>

        {/* Month label lines */}
        <Line p1={vec(cX + cW*0.07, cY + hH*0.36)} p2={vec(cX + cW*0.44, cY + hH*0.36)}>
          <Paint color="rgba(255,255,255,0.95)" strokeWidth={3} strokeCap="round" />
        </Line>
        <Line p1={vec(cX + cW*0.07, cY + hH*0.66)} p2={vec(cX + cW*0.26, cY + hH*0.66)}>
          <Paint color="rgba(255,255,255,0.50)" strokeWidth={2} strokeCap="round" />
        </Line>

        {/* Chevron */}
        <Path path={`M ${cX+cW*0.84} ${cY+hH*0.28} L ${cX+cW*0.90} ${cY+hH*0.52} L ${cX+cW*0.84} ${cY+hH*0.76}`}>
          <Paint color="rgba(255,255,255,0.85)" style="stroke" strokeWidth={2.2} strokeCap="round" strokeJoin="round" />
        </Path>

        {/* Day-of-week dots */}
        {Array.from({ length: COLS }).map((_, c) => (
          <Circle key={c}
            cx={gX + c * (cellW + cGap) + cellW * 0.5}
            cy={cY + hH + SZ * 0.024}
            r={SZ * 0.008}
          >
            <Paint color="rgba(107,122,163,0.55)" />
          </Circle>
        ))}
      </Group>

      {/* Grid cells */}
      <Group opacity={grid}>
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => {
            const isHi   = r === HI_ROW && c === HI_COL;
            const isSoft = (r === HI_ROW && (c === HI_COL - 1 || c === HI_COL + 1))
                        || (r === HI_ROW - 1 && c === HI_COL);
            const x = gX + c * (cellW + cGap);
            const y = gY + r * (cellH + cGap);
            return (
              <Group key={`${r}-${c}`}>
                {isHi && (
                  <RoundedRect x={x} y={y} width={cellW} height={cellH} r={SZ * 0.014}>
                    <Paint color="rgba(51,133,255,0.45)">
                      <BlurMask blur={7} style="normal" />
                    </Paint>
                  </RoundedRect>
                )}
                <RoundedRect x={x} y={y} width={cellW} height={cellH} r={SZ * 0.014}>
                  <Paint color={
                    isHi   ? 'rgba(1,66,192,0.92)' :
                    isSoft ? 'rgba(255,255,255,0.09)' :
                             'rgba(255,255,255,0.04)'
                  } />
                </RoundedRect>
                <Line
                  p1={vec(x + SZ*0.006, y + cellH * 0.50)}
                  p2={vec(x + cellW - SZ*0.006, y + cellH * 0.50)}
                >
                  <Paint
                    color={isHi ? 'rgba(255,255,255,0.92)' : isSoft ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.16)'}
                    strokeWidth={isHi ? 3 : isSoft ? 2.2 : 1.6}
                    strokeCap="round"
                  />
                </Line>
              </Group>
            );
          })
        )}
      </Group>

      {/* Appointment bar */}
      <Group opacity={appt}>
        <RoundedRect x={cX + gPad} y={apptY} width={cW - gPad * 2} height={apptH} r={SZ * 0.022}>
          <Paint color="rgba(1,66,192,0.40)">
            <BlurMask blur={10} style="normal" />
          </Paint>
        </RoundedRect>
        <RoundedRect x={cX + gPad} y={apptY} width={cW - gPad * 2} height={apptH} r={SZ * 0.022}>
          <LinearGradient
            start={vec(cX + gPad, apptY)} end={vec(cX + cW - gPad, apptY)}
            colors={['rgba(1,66,192,0.92)', 'rgba(30,95,220,0.92)']}
          />
        </RoundedRect>
        <RoundedRect x={cX + gPad} y={apptY} width={cW - gPad * 2} height={apptH} r={SZ * 0.022}>
          <Paint color="rgba(100,160,255,0.28)" style="stroke" strokeWidth={1} />
        </RoundedRect>
        {/* Accent bar */}
        <RoundedRect x={cX+gPad+SZ*0.007} y={apptY+SZ*0.009} width={SZ*0.014} height={apptH-SZ*0.018} r={SZ*0.007}>
          <Paint color="rgba(255,255,255,0.95)" />
        </RoundedRect>
        {/* Text lines */}
        <Line p1={vec(cX+gPad+SZ*0.036, apptY+apptH*0.35)} p2={vec(cX+cW-gPad-SZ*0.10, apptY+apptH*0.35)}>
          <Paint color="rgba(255,255,255,0.95)" strokeWidth={2.8} strokeCap="round" />
        </Line>
        <Line p1={vec(cX+gPad+SZ*0.036, apptY+apptH*0.68)} p2={vec(cX+gPad+SZ*0.036+(cW-gPad*2)*0.42, apptY+apptH*0.68)}>
          <Paint color="rgba(255,255,255,0.52)" strokeWidth={1.8} strokeCap="round" />
        </Line>
      </Group>
    </Canvas>
  );
}

// ─── Slide 2 — Track ─────────────────────────────────────────────────────────

export function TrackIllustration() {
  const bg  = useEntrance(0, 600);
  const car = useEntrance(200, 700);
  const pin = useEntrance(750, 500);

  const cx = SZ / 2;

  // Car geometry — proper sedan proportions
  const hoodY   = SZ * 0.48;  // door-top / hood / trunk level
  const roofY   = SZ * 0.30;  // cabin roof level
  const carBotY = SZ * 0.63;  // body bottom (between wheels)
  const cL      = SZ * 0.06;  // front bumper x
  const cR      = SZ * 0.94;  // rear bumper x
  const wsBaseX = SZ * 0.28;  // windshield base (hood–A-pillar junction)
  const roofSX  = SZ * 0.37;  // A-pillar top / roof start
  const roofEX  = SZ * 0.70;  // C-pillar top / roof end
  const cwBaseX = SZ * 0.79;  // C-pillar base / rear-window bottom
  const bPilX   = SZ * 0.535; // B-pillar x

  const fWX = SZ * 0.23, rWX = SZ * 0.78;
  const wCY = SZ * 0.67, wR  = SZ * 0.082;

  const roadY = SZ * 0.80;

  const body = [
    `M ${cL} ${carBotY}`,
    `L ${cL} ${hoodY + SZ*0.042}`,
    `Q ${cL+SZ*0.028} ${hoodY} ${cL+SZ*0.090} ${hoodY}`,
    `L ${wsBaseX} ${hoodY - SZ*0.022}`,
    `L ${roofSX} ${roofY}`,
    `L ${roofEX} ${roofY}`,
    `L ${cwBaseX} ${hoodY - SZ*0.016}`,
    `L ${cR-SZ*0.090} ${hoodY}`,
    `Q ${cR-SZ*0.028} ${hoodY} ${cR} ${hoodY+SZ*0.042}`,
    `L ${cR} ${carBotY} Z`,
  ].join(' ');

  return (
    <Canvas style={{ width: SZ, height: SZ }}>
      {/* Ambient blobs */}
      <Group opacity={bg}>
        <Circle cx={cx} cy={SZ * 0.58} r={SZ * 0.38}>
          <Paint color="rgba(1,66,192,0.28)">
            <BlurMask blur={SZ * 0.16} style="normal" />
          </Paint>
        </Circle>
        <Circle cx={SZ * 0.20} cy={SZ * 0.24} r={SZ * 0.18}>
          <Paint color="rgba(100,50,240,0.20)">
            <BlurMask blur={SZ * 0.10} style="normal" />
          </Paint>
        </Circle>
        <Circle cx={SZ * 0.82} cy={SZ * 0.26} r={SZ * 0.14}>
          <Paint color="rgba(51,133,255,0.18)">
            <BlurMask blur={SZ * 0.08} style="normal" />
          </Paint>
        </Circle>
      </Group>

      {/* Car + road */}
      <Group opacity={car}>
        {/* Ground glow */}
        <Circle cx={cx} cy={wCY + SZ * 0.06} r={SZ * 0.30}>
          <Paint color="rgba(1,66,192,0.18)">
            <BlurMask blur={SZ * 0.10} style="normal" />
          </Paint>
        </Circle>

        {/* Road */}
        <Path path={`M ${SZ*0.02} ${roadY} Q ${cx} ${roadY-SZ*0.06} ${SZ*0.98} ${roadY}`}>
          <Paint color="rgba(255,255,255,0.07)" style="stroke" strokeWidth={SZ*0.075} strokeCap="butt" />
        </Path>
        {[0.20, 0.43, 0.66].map((t, i) => (
          <Line key={i} p1={vec(SZ*t, roadY - SZ*0.002)} p2={vec(SZ*(t+0.10), roadY - SZ*0.002)}>
            <Paint color="rgba(51,133,255,0.50)" strokeWidth={2} strokeCap="round" />
          </Line>
        ))}

        {/* Car body */}
        <Path path={body}>
          <LinearGradient
            start={vec(cx, roofY)} end={vec(cx, carBotY)}
            colors={['#0150D4', '#00287A']}
          />
        </Path>
        <Path path={body}>
          <Paint color="rgba(80,150,255,0.55)" style="stroke" strokeWidth={1.8} />
        </Path>

        {/* Hood gloss highlight */}
        <Path path={`M ${cL+SZ*0.09} ${hoodY} L ${wsBaseX} ${hoodY-SZ*0.022} L ${wsBaseX-SZ*0.04} ${hoodY} Z`}>
          <LinearGradient
            start={vec(cL, roofY)} end={vec(cL, hoodY)}
            colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.02)']}
          />
        </Path>

        {/* Front glass (windshield + front side window) */}
        <Path path={`M ${wsBaseX} ${hoodY-SZ*0.022} L ${roofSX} ${roofY} L ${bPilX} ${roofY} L ${bPilX} ${hoodY-SZ*0.022} Z`}>
          <Paint color="rgba(51,133,255,0.28)" />
        </Path>
        {/* Rear glass (rear side window) */}
        <Path path={`M ${bPilX} ${roofY} L ${roofEX} ${roofY} L ${cwBaseX} ${hoodY-SZ*0.016} L ${bPilX} ${hoodY-SZ*0.022} Z`}>
          <Paint color="rgba(51,133,255,0.22)" />
        </Path>
        {/* Glass top edge highlight */}
        <Path path={`M ${wsBaseX} ${hoodY-SZ*0.022} L ${roofSX} ${roofY} L ${roofEX} ${roofY} L ${cwBaseX} ${hoodY-SZ*0.016}`}>
          <Paint color="rgba(140,195,255,0.55)" style="stroke" strokeWidth={1.5} strokeCap="round" />
        </Path>

        {/* B-pillar (opaque column between windows) */}
        <Line p1={vec(bPilX, roofY)} p2={vec(bPilX, hoodY - SZ*0.018)}>
          <Paint color="rgba(0,22,72,0.96)" strokeWidth={SZ * 0.017} />
        </Line>
        {/* Door division line below beltline */}
        <Line p1={vec(bPilX, hoodY - SZ*0.018)} p2={vec(bPilX, carBotY)}>
          <Paint color="rgba(255,255,255,0.18)" strokeWidth={1.4} />
        </Line>

        {/* Door handle */}
        <Line p1={vec(bPilX+SZ*0.055, hoodY+SZ*0.056)} p2={vec(bPilX+SZ*0.155, hoodY+SZ*0.056)}>
          <Paint color="rgba(255,255,255,0.88)" strokeWidth={3.5} strokeCap="round" />
        </Line>

        {/* Headlight beams */}
        {[0, SZ*0.036, SZ*0.068].map((off, i) => (
          <Line key={i}
            p1={vec(cR, hoodY + SZ*0.100 + off)}
            p2={vec(cR + SZ*0.060, hoodY + SZ*0.058 + off - SZ*0.008*i)}
          >
            <Paint color={`rgba(51,133,255,${0.90 - i*0.22})`} strokeWidth={2.8} strokeCap="round" />
          </Line>
        ))}

        {/* Taillights */}
        <Line p1={vec(cL, hoodY+SZ*0.080)} p2={vec(cL-SZ*0.038, hoodY+SZ*0.080)}>
          <Paint color="rgba(229,57,53,0.88)" strokeWidth={4.5} strokeCap="round" />
        </Line>
        <Line p1={vec(cL, hoodY+SZ*0.160)} p2={vec(cL-SZ*0.028, hoodY+SZ*0.160)}>
          <Paint color="rgba(229,57,53,0.50)" strokeWidth={3} strokeCap="round" />
        </Line>

        {/* Wheels */}
        {[fWX, rWX].map((wX, wi) => (
          <Group key={wi}>
            <Circle cx={wX} cy={wCY} r={wR + SZ*0.022}>
              <Paint color="rgba(51,133,255,0.20)">
                <BlurMask blur={8} style="normal" />
              </Paint>
            </Circle>
            <Circle cx={wX} cy={wCY} r={wR}>
              <LinearGradient
                start={vec(wX-wR, wCY-wR)} end={vec(wX+wR, wCY+wR)}
                colors={['#0E1D38', '#060D1C']}
              />
            </Circle>
            <Circle cx={wX} cy={wCY} r={wR}>
              <Paint color="rgba(51,133,255,0.72)" style="stroke" strokeWidth={2.5} />
            </Circle>
            <Circle cx={wX} cy={wCY} r={wR * 0.42}>
              <Paint color="rgba(255,255,255,0.18)" style="stroke" strokeWidth={1.5} />
            </Circle>
            {[0, 60, 120].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <Line key={deg}
                  p1={vec(wX + Math.cos(rad)*wR*0.42, wCY + Math.sin(rad)*wR*0.42)}
                  p2={vec(wX + Math.cos(rad)*wR*0.85, wCY + Math.sin(rad)*wR*0.85)}
                >
                  <Paint color="rgba(255,255,255,0.22)" strokeWidth={1.8} strokeCap="round" />
                </Line>
              );
            })}
            <Circle cx={wX} cy={wCY} r={SZ * 0.012}>
              <Paint color="#3385FF" />
            </Circle>
          </Group>
        ))}
      </Group>

      {/* GPS pin */}
      <Group opacity={pin}>
        {[SZ*0.10, SZ*0.14, SZ*0.18].map((r, i) => (
          <Circle key={i} cx={cx} cy={SZ*0.17} r={r}>
            <Paint color={`rgba(51,133,255,${0.28 - i*0.08})`} style="stroke" strokeWidth={1.5} />
          </Circle>
        ))}
        <Circle cx={cx} cy={SZ*0.17} r={SZ*0.06}>
          <Paint color="rgba(51,133,255,0.38)">
            <BlurMask blur={10} style="normal" />
          </Paint>
        </Circle>
        {/* Pin drop */}
        <Path path={
          `M ${cx} ${SZ*0.29} ` +
          `Q ${cx-SZ*0.065} ${SZ*0.20} ${cx-SZ*0.065} ${SZ*0.15} ` +
          `Q ${cx-SZ*0.065} ${SZ*0.09} ${cx} ${SZ*0.09} ` +
          `Q ${cx+SZ*0.065} ${SZ*0.09} ${cx+SZ*0.065} ${SZ*0.15} ` +
          `Q ${cx+SZ*0.065} ${SZ*0.20} ${cx} ${SZ*0.29} Z`
        }>
          <LinearGradient
            start={vec(cx, SZ*0.09)} end={vec(cx, SZ*0.29)}
            colors={['#4498FF', '#0142C0']}
          />
        </Path>
        <Circle cx={cx} cy={SZ*0.17} r={SZ*0.028}>
          <Paint color="rgba(255,255,255,0.96)" />
        </Circle>
        <Circle cx={cx} cy={SZ*0.17} r={SZ*0.013}>
          <Paint color="#0142C0" />
        </Circle>
        <Line p1={vec(cx, SZ*0.30)} p2={vec(cx, SZ*0.35)}>
          <Paint color="rgba(255,255,255,0.28)" strokeWidth={2} strokeCap="round" />
        </Line>
      </Group>
    </Canvas>
  );
}

// ─── Slide 3 — Support ───────────────────────────────────────────────────────

export function SupportIllustration() {
  const bg = useEntrance(0, 600);
  const b1 = useEntrance(100, 550);
  const b2 = useEntrance(400, 550);
  const b3 = useEntrance(680, 500);
  const sp = useEntrance(800, 500);

  const cx = SZ / 2;
  const cy = SZ / 2;

  const b1X = SZ*0.05, b1Y = SZ*0.08, b1W = SZ*0.66, b1H = SZ*0.22;
  const b2X = SZ*0.29, b2Y = SZ*0.38, b2W = SZ*0.66, b2H = SZ*0.22;
  const b3X = SZ*0.05, b3Y = SZ*0.68, b3W = SZ*0.36, b3H = SZ*0.14;

  return (
    <Canvas style={{ width: SZ, height: SZ }}>
      {/* Ambient */}
      <Group opacity={bg}>
        <Circle cx={cx} cy={cy + SZ*0.05} r={SZ*0.40}>
          <Paint color="rgba(51,133,255,0.30)">
            <BlurMask blur={SZ * 0.16} style="normal" />
          </Paint>
        </Circle>
        <Circle cx={SZ*0.80} cy={SZ*0.20} r={SZ*0.22}>
          <Paint color="rgba(107,53,240,0.28)">
            <BlurMask blur={SZ * 0.12} style="normal" />
          </Paint>
        </Circle>
        <Circle cx={SZ*0.15} cy={SZ*0.75} r={SZ*0.16}>
          <Paint color="rgba(1,66,192,0.22)">
            <BlurMask blur={SZ * 0.10} style="normal" />
          </Paint>
        </Circle>
      </Group>

      {/* Bubble 1 — user */}
      <Group opacity={b1}>
        <RoundedRect x={b1X} y={b1Y} width={b1W} height={b1H} r={SZ*0.045}>
          <Paint color="rgba(1,66,192,0.18)">
            <BlurMask blur={10} style="normal" />
          </Paint>
        </RoundedRect>
        <RoundedRect x={b1X} y={b1Y} width={b1W} height={b1H} r={SZ*0.045}>
          <LinearGradient
            start={vec(b1X, b1Y)} end={vec(b1X, b1Y+b1H)}
            colors={['rgba(13,26,60,0.97)', 'rgba(8,18,45,0.97)']}
          />
        </RoundedRect>
        <RoundedRect x={b1X} y={b1Y} width={b1W} height={b1H} r={SZ*0.045}>
          <Paint color="rgba(255,255,255,0.10)" style="stroke" strokeWidth={1} />
        </RoundedRect>
        <Path path={`M ${b1X+SZ*0.06} ${b1Y+b1H} L ${b1X+SZ*0.02} ${b1Y+b1H+SZ*0.05} L ${b1X+SZ*0.16} ${b1Y+b1H}`}>
          <LinearGradient
            start={vec(b1X, b1Y+b1H)} end={vec(b1X, b1Y+b1H+SZ*0.05)}
            colors={['rgba(8,18,45,0.97)', 'rgba(8,18,45,0)']}
          />
        </Path>
        <Line p1={vec(b1X+SZ*0.08, b1Y+b1H*0.38)} p2={vec(b1X+b1W-SZ*0.08, b1Y+b1H*0.38)}>
          <Paint color="rgba(255,255,255,0.60)" strokeWidth={2.5} strokeCap="round" />
        </Line>
        <Line p1={vec(b1X+SZ*0.08, b1Y+b1H*0.65)} p2={vec(b1X+b1W*0.60, b1Y+b1H*0.65)}>
          <Paint color="rgba(255,255,255,0.35)" strokeWidth={2} strokeCap="round" />
        </Line>
      </Group>

      {/* Bubble 2 — AI */}
      <Group opacity={b2}>
        <RoundedRect x={b2X} y={b2Y} width={b2W} height={b2H} r={SZ*0.045}>
          <Paint color="rgba(51,133,255,0.18)">
            <BlurMask blur={12} style="normal" />
          </Paint>
        </RoundedRect>
        <RoundedRect x={b2X} y={b2Y} width={b2W} height={b2H} r={SZ*0.045}>
          <LinearGradient
            start={vec(b2X, b2Y)} end={vec(b2X+b2W, b2Y+b2H)}
            colors={['rgba(0,60,180,0.95)', 'rgba(0,30,100,0.95)']}
          />
        </RoundedRect>
        <RoundedRect x={b2X} y={b2Y} width={b2W} height={b2H} r={SZ*0.045}>
          <Paint color="rgba(100,160,255,0.30)" style="stroke" strokeWidth={1} />
        </RoundedRect>
        <Path path={`M ${b2X+b2W-SZ*0.16} ${b2Y+b2H} L ${b2X+b2W+SZ*0.02} ${b2Y+b2H+SZ*0.05} L ${b2X+b2W-SZ*0.06} ${b2Y+b2H}`}>
          <LinearGradient
            start={vec(b2X+b2W, b2Y+b2H)} end={vec(b2X+b2W, b2Y+b2H+SZ*0.05)}
            colors={['rgba(0,30,100,0.95)', 'rgba(0,30,100,0)']}
          />
        </Path>
        <Line p1={vec(b2X+SZ*0.08, b2Y+b2H*0.38)} p2={vec(b2X+b2W-SZ*0.08, b2Y+b2H*0.38)}>
          <Paint color="rgba(255,255,255,0.85)" strokeWidth={2.5} strokeCap="round" />
        </Line>
        <Line p1={vec(b2X+SZ*0.08, b2Y+b2H*0.65)} p2={vec(b2X+b2W*0.68, b2Y+b2H*0.65)}>
          <Paint color="rgba(255,255,255,0.55)" strokeWidth={2} strokeCap="round" />
        </Line>
      </Group>

      {/* Bubble 3 — typing */}
      <Group opacity={b3}>
        <RoundedRect x={b3X} y={b3Y} width={b3W} height={b3H} r={SZ*0.035}>
          <LinearGradient
            start={vec(b3X, b3Y)} end={vec(b3X, b3Y+b3H)}
            colors={['rgba(13,26,60,0.90)', 'rgba(8,18,45,0.90)']}
          />
        </RoundedRect>
        <RoundedRect x={b3X} y={b3Y} width={b3W} height={b3H} r={SZ*0.035}>
          <Paint color="rgba(255,255,255,0.08)" style="stroke" strokeWidth={1} />
        </RoundedRect>
        {[0, SZ*0.08, SZ*0.16].map((offset, i) => (
          <Circle key={i} cx={b3X+b3W*0.22+offset} cy={b3Y+b3H*0.52} r={SZ*0.024}>
            <Paint color={`rgba(51,133,255,${1 - i*0.28})`} />
          </Circle>
        ))}
        <Path path={`M ${b3X+SZ*0.06} ${b3Y+b3H} L ${b3X+SZ*0.02} ${b3Y+b3H+SZ*0.04} L ${b3X+SZ*0.14} ${b3Y+b3H}`}>
          <LinearGradient
            start={vec(b3X, b3Y+b3H)} end={vec(b3X, b3Y+b3H+SZ*0.04)}
            colors={['rgba(8,18,45,0.90)', 'rgba(8,18,45,0)']}
          />
        </Path>
      </Group>

      {/* AI sparkle */}
      <Group opacity={sp}>
        <Circle cx={SZ*0.78} cy={SZ*0.16} r={SZ*0.09}>
          <Paint color="rgba(51,133,255,0.35)">
            <BlurMask blur={12} style="normal" />
          </Paint>
        </Circle>
        <Path path={`M ${SZ*0.78} ${SZ*0.07} L ${SZ*0.808} ${SZ*0.138} L ${SZ*0.876} ${SZ*0.16} L ${SZ*0.808} ${SZ*0.182} L ${SZ*0.78} ${SZ*0.25} L ${SZ*0.752} ${SZ*0.182} L ${SZ*0.684} ${SZ*0.16} L ${SZ*0.752} ${SZ*0.138} Z`}>
          <LinearGradient
            start={vec(SZ*0.684, SZ*0.07)} end={vec(SZ*0.876, SZ*0.25)}
            colors={['rgba(100,180,255,0.95)', 'rgba(1,66,192,0.95)']}
          />
        </Path>
        <Path path={`M ${SZ*0.66} ${SZ*0.10} L ${SZ*0.674} ${SZ*0.128} L ${SZ*0.702} ${SZ*0.136} L ${SZ*0.674} ${SZ*0.144} L ${SZ*0.66} ${SZ*0.172} L ${SZ*0.646} ${SZ*0.144} L ${SZ*0.618} ${SZ*0.136} L ${SZ*0.646} ${SZ*0.128} Z`}>
          <Paint color="rgba(255,255,255,0.55)" />
        </Path>
      </Group>
    </Canvas>
  );
}

// ─── Vehicle setup — Car silhouette (SVG, animated draw-on) ──────────────────

const AnimatedSvgPath   = Animated.createAnimatedComponent(SvgPath);
const AnimatedSvgCircle = Animated.createAnimatedComponent(SvgCircle);
const AnimatedSvgRect   = Animated.createAnimatedComponent(SvgRect);
const AnimatedSvgLine   = Animated.createAnimatedComponent(SvgLine);

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

// Sedan profile in 300×156 viewBox
// Body: x 16–284, hood/trunk top y=74, roofline y=42, wheel centers y=112 r=22
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
      {/* Ground glow */}
      <AnimatedSvgCircle cx="150" cy="124" r="95" fill={GLOW_S} animatedProps={glow} stroke="none" />
      {/* Ground line */}
      <AnimatedSvgPath d="M10 112 L290 112"
        stroke={WHITE2_S} strokeWidth="1.5" strokeLinecap="round"
        strokeDasharray="900" animatedProps={ground} fill="none" />

      {/* Car body — proper sedan: hood, windshield, roof, rear window, trunk */}
      <AnimatedSvgPath
        d="M16 104 L16 84 Q20 74 34 74 L82 70 L104 42 L200 42 L228 70 L264 74 Q278 74 284 84 L284 104 Z"
        stroke={BLUE_S} strokeWidth="3.5" fill={FILL1_S}
        strokeDasharray="1000" animatedProps={body} strokeLinejoin="round" />

      {/* Roof cap (connects A-pillar to C-pillar at top) */}
      <AnimatedSvgPath d="M104 42 L200 42"
        stroke={BLUE_S} strokeWidth="3.5" strokeLinecap="round"
        strokeDasharray="700" animatedProps={roof} fill="none" />

      {/* Front glass fill (windshield + front side window, B-pillar at x=156) */}
      <AnimatedSvgRect x="82" y="42" width="74" height="32" rx="2"
        fill="rgba(51,133,255,0.26)" fillOpacity={0} stroke="none"
        animatedProps={winFill} />
      {/* Rear glass fill */}
      <AnimatedSvgRect x="156" y="42" width="72" height="32" rx="2"
        fill="rgba(51,133,255,0.20)" fillOpacity={0} stroke="none"
        animatedProps={winFill} />

      {/* B-pillar */}
      <AnimatedSvgLine x1="156" y1="42" x2="156" y2="74"
        stroke="rgba(0,20,60,0.90)" strokeWidth="8"
        strokeDasharray="280" animatedProps={details} />

      {/* Door line below beltline */}
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
