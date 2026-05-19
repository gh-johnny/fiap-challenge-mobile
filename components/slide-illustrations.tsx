import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import {
  Easing,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {
  BlurMask,
  Canvas,
  Circle,
  Fill,
  Group,
  Line,
  LinearGradient,
  Paint,
  Path,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';

// ─── SVG imports (CarSilhouette only) ─────────────────────────────────────────
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle as SvgCircle, Line as SvgLine, Path as SvgPath, Rect as SvgRect } from 'react-native-svg';

const { width } = Dimensions.get('window');
const SZ = Math.min(width * 0.78, 300);

// ─── Shared entrance hook ─────────────────────────────────────────────────────

function useEntrance(delay = 0, dur = 700) {
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: dur, easing: Easing.out(Easing.cubic) }));
  }, []);
  return opacity;
}

// ─── Slide 1 — Schedule ──────────────────────────────────────────────────────

export function ScheduleIllustration() {
  const bg     = useEntrance(0, 600);
  const card   = useEntrance(200, 500);
  const detail = useEntrance(500, 500);
  const badge  = useEntrance(700, 500);

  const cx = SZ / 2;
  const cy = SZ / 2;

  // Card dimensions
  const cX = SZ * 0.1;
  const cY = SZ * 0.16;
  const cW = SZ * 0.72;
  const cH = SZ * 0.58;
  const hH = SZ * 0.16; // header height

  // Clock badge
  const bCx = SZ * 0.76;
  const bCy = SZ * 0.76;
  const bR  = SZ * 0.12;

  return (
    <Canvas style={{ width: SZ, height: SZ }}>
      {/* ── Ambient blobs ── */}
      <Group opacity={bg}>
        <Circle cx={cx} cy={cy - SZ * 0.05} r={SZ * 0.42}>
          <Paint color="rgba(51,133,255,0.38)">
            <BlurMask blur={SZ * 0.18} style="normal" />
          </Paint>
        </Circle>
        <Circle cx={SZ * 0.75} cy={SZ * 0.22} r={SZ * 0.22}>
          <Paint color="rgba(107,53,240,0.30)">
            <BlurMask blur={SZ * 0.12} style="normal" />
          </Paint>
        </Circle>
        <Circle cx={SZ * 0.18} cy={SZ * 0.72} r={SZ * 0.18}>
          <Paint color="rgba(1,66,192,0.28)">
            <BlurMask blur={SZ * 0.10} style="normal" />
          </Paint>
        </Circle>
      </Group>

      {/* ── Calendar card ── */}
      <Group opacity={card}>
        {/* Card body */}
        <RoundedRect x={cX} y={cY} width={cW} height={cH} r={SZ * 0.055}>
          <LinearGradient
            start={vec(cX, cY)}
            end={vec(cX, cY + cH)}
            colors={['rgba(13,26,58,0.96)', 'rgba(8,16,40,0.96)']}
          />
        </RoundedRect>
        {/* Card border */}
        <RoundedRect x={cX} y={cY} width={cW} height={cH} r={SZ * 0.055}>
          <Paint color="rgba(255,255,255,0.10)" style="stroke" strokeWidth={1.2} />
        </RoundedRect>

        {/* Header band */}
        <RoundedRect x={cX} y={cY} width={cW} height={hH} r={SZ * 0.055}>
          <LinearGradient
            start={vec(cX, cY)}
            end={vec(cX + cW, cY)}
            colors={['#0142C0', '#3385FF']}
          />
        </RoundedRect>
        {/* header bottom fill (covers lower rounded corners of header) */}
        <RoundedRect x={cX} y={cY + hH * 0.55} width={cW} height={hH * 0.45} r={0}>
          <LinearGradient
            start={vec(cX, cY + hH * 0.55)}
            end={vec(cX + cW, cY + hH * 0.55)}
            colors={['#0142C0', '#3385FF']}
          />
        </RoundedRect>

        {/* Header label line */}
        <Line p1={vec(cX + cW * 0.13, cY + hH * 0.55)} p2={vec(cX + cW * 0.55, cY + hH * 0.55)}>
          <Paint color="rgba(255,255,255,0.70)" strokeWidth={2.5} strokeCap="round" />
        </Line>

        {/* Ring knobs */}
        {[0.28, 0.50, 0.72].map((t, i) => (
          <Circle key={i} cx={cX + cW * t} cy={cY} r={SZ * 0.022}>
            <Paint color="#0A1830" />
          </Circle>
        ))}
        {[0.28, 0.50, 0.72].map((t, i) => (
          <Circle key={i} cx={cX + cW * t} cy={cY} r={SZ * 0.022}>
            <Paint color="rgba(51,133,255,0.9)" style="stroke" strokeWidth={2} />
          </Circle>
        ))}
      </Group>

      {/* ── Calendar grid + highlight ── */}
      <Group opacity={detail}>
        {/* Grid dots 4×3 */}
        {[0, 1, 2, 3].map(col =>
          [0, 1, 2].map(row => (
            <Circle
              key={`${col}-${row}`}
              cx={cX + cW * (0.16 + col * 0.22)}
              cy={cY + hH + SZ * 0.09 + row * SZ * 0.1}
              r={SZ * 0.014}
            >
              <Paint color="rgba(160,174,207,0.4)" />
            </Circle>
          ))
        )}

        {/* Highlighted cell with glow */}
        <RoundedRect
          x={cX + cW * 0.52}
          y={cY + hH + SZ * 0.21}
          width={cW * 0.22}
          height={SZ * 0.09}
          r={SZ * 0.025}
        >
          <Paint color="rgba(51,133,255,0.25)">
            <BlurMask blur={4} style="normal" />
          </Paint>
        </RoundedRect>
        <RoundedRect
          x={cX + cW * 0.52}
          y={cY + hH + SZ * 0.21}
          width={cW * 0.22}
          height={SZ * 0.09}
          r={SZ * 0.025}
        >
          <Paint color="rgba(51,133,255,0.85)" style="stroke" strokeWidth={1.5} />
        </RoundedRect>

        {/* Checkmark */}
        <Path
          path={`M ${cX + cW * 0.558} ${cY + hH + SZ * 0.265} L ${cX + cW * 0.590} ${cY + hH + SZ * 0.298} L ${cX + cW * 0.645} ${cY + hH + SZ * 0.234}`}
        >
          <Paint color="rgba(255,255,255,0.95)" style="stroke" strokeWidth={2.8} strokeCap="round" strokeJoin="round" />
        </Path>
      </Group>

      {/* ── Clock badge ── */}
      <Group opacity={badge}>
        {/* Glow ring */}
        <Circle cx={bCx} cy={bCy} r={bR + SZ * 0.04}>
          <Paint color="rgba(51,133,255,0.22)">
            <BlurMask blur={10} style="normal" />
          </Paint>
        </Circle>
        {/* Badge body */}
        <Circle cx={bCx} cy={bCy} r={bR}>
          <LinearGradient
            start={vec(bCx - bR, bCy - bR)}
            end={vec(bCx + bR, bCy + bR)}
            colors={['rgba(13,21,38,0.98)', 'rgba(10,26,60,0.98)']}
          />
        </Circle>
        <Circle cx={bCx} cy={bCy} r={bR}>
          <Paint color="rgba(51,133,255,0.45)" style="stroke" strokeWidth={1.5} />
        </Circle>
        {/* Hour hand */}
        <Line p1={vec(bCx, bCy)} p2={vec(bCx, bCy - bR * 0.58)}>
          <Paint color="rgba(255,255,255,0.90)" strokeWidth={2.2} strokeCap="round" />
        </Line>
        {/* Minute hand */}
        <Line p1={vec(bCx, bCy)} p2={vec(bCx + bR * 0.48, bCy)}>
          <Paint color="rgba(51,133,255,0.90)" strokeWidth={1.8} strokeCap="round" />
        </Line>
        <Circle cx={bCx} cy={bCy} r={SZ * 0.012}>
          <Paint color="rgba(255,255,255,0.90)" />
        </Circle>
      </Group>
    </Canvas>
  );
}

// ─── Slide 2 — Track ─────────────────────────────────────────────────────────

export function TrackIllustration() {
  const bg   = useEntrance(0, 600);
  const car  = useEntrance(200, 600);
  const pin  = useEntrance(600, 500);

  const cx = SZ / 2;

  // Car body coords (scaled to SZ)
  const carY  = SZ * 0.44;
  const carH  = SZ * 0.22;
  const carX  = SZ * 0.10;
  const carW  = SZ * 0.80;

  return (
    <Canvas style={{ width: SZ, height: SZ }}>
      {/* ── Ambient blobs ── */}
      <Group opacity={bg}>
        <Circle cx={cx} cy={SZ * 0.62} r={SZ * 0.38}>
          <Paint color="rgba(1,66,192,0.35)">
            <BlurMask blur={SZ * 0.16} style="normal" />
          </Paint>
        </Circle>
        <Circle cx={SZ * 0.22} cy={SZ * 0.25} r={SZ * 0.20}>
          <Paint color="rgba(107,53,240,0.28)">
            <BlurMask blur={SZ * 0.12} style="normal" />
          </Paint>
        </Circle>
        <Circle cx={SZ * 0.80} cy={SZ * 0.30} r={SZ * 0.15}>
          <Paint color="rgba(51,133,255,0.25)">
            <BlurMask blur={SZ * 0.10} style="normal" />
          </Paint>
        </Circle>
      </Group>

      {/* ── Road ── */}
      <Group opacity={car}>
        <Path path={`M ${SZ * 0.0} ${SZ * 0.72} Q ${cx} ${SZ * 0.68} ${SZ} ${SZ * 0.72}`}>
          <Paint color="rgba(255,255,255,0.08)" style="stroke" strokeWidth={SZ * 0.08} strokeCap="butt" />
        </Path>
        {/* Road dashes */}
        {[0.22, 0.44, 0.66].map((t, i) => (
          <Line key={i} p1={vec(SZ * t, SZ * 0.706)} p2={vec(SZ * (t + 0.10), SZ * 0.706)}>
            <Paint color="rgba(51,133,255,0.55)" strokeWidth={2} strokeCap="round" />
          </Line>
        ))}

        {/* Car body — solid filled shape */}
        <Path
          path={`M ${carX} ${carY + carH}
                 L ${carX} ${carY + carH * 0.45}
                 Q ${carX + carW * 0.08} ${carY} ${carX + carW * 0.22} ${carY - carH * 0.18}
                 L ${carX + carW * 0.52} ${carY - carH * 0.44}
                 Q ${carX + carW * 0.62} ${carY - carH * 0.55} ${carX + carW * 0.72} ${carY - carH * 0.55}
                 L ${carX + carW * 0.88} ${carY - carH * 0.18}
                 Q ${carX + carW * 0.96} ${carY} ${carX + carW} ${carY + carH * 0.45}
                 L ${carX + carW} ${carY + carH} Z`}
        >
          <LinearGradient
            start={vec(carX, carY - carH * 0.55)}
            end={vec(carX, carY + carH)}
            colors={['#0057C8', '#002A7A']}
          />
        </Path>
        {/* Car body border */}
        <Path
          path={`M ${carX} ${carY + carH}
                 L ${carX} ${carY + carH * 0.45}
                 Q ${carX + carW * 0.08} ${carY} ${carX + carW * 0.22} ${carY - carH * 0.18}
                 L ${carX + carW * 0.52} ${carY - carH * 0.44}
                 Q ${carX + carW * 0.62} ${carY - carH * 0.55} ${carX + carW * 0.72} ${carY - carH * 0.55}
                 L ${carX + carW * 0.88} ${carY - carH * 0.18}
                 Q ${carX + carW * 0.96} ${carY} ${carX + carW} ${carY + carH * 0.45}
                 L ${carX + carW} ${carY + carH} Z`}
        >
          <Paint color="rgba(51,133,255,0.70)" style="stroke" strokeWidth={2} />
        </Path>

        {/* Windshield fill */}
        <Path
          path={`M ${carX + carW * 0.22} ${carY - carH * 0.18}
                 L ${carX + carW * 0.52} ${carY - carH * 0.44}
                 Q ${carX + carW * 0.62} ${carY - carH * 0.55} ${carX + carW * 0.72} ${carY - carH * 0.55}
                 L ${carX + carW * 0.72} ${carY}
                 L ${carX + carW * 0.22} ${carY} Z`}
        >
          <Paint color="rgba(51,133,255,0.22)" />
        </Path>

        {/* Door line */}
        <Line
          p1={vec(carX + carW * 0.52, carY - carH * 0.44)}
          p2={vec(carX + carW * 0.52, carY + carH)}
        >
          <Paint color="rgba(255,255,255,0.28)" strokeWidth={1.8} />
        </Line>
        {/* Door handle */}
        <Line
          p1={vec(carX + carW * 0.58, carY + carH * 0.32)}
          p2={vec(carX + carW * 0.70, carY + carH * 0.32)}
        >
          <Paint color="rgba(255,255,255,0.85)" strokeWidth={3} strokeCap="round" />
        </Line>

        {/* Front wheel glow */}
        <Circle cx={carX + carW * 0.24} cy={carY + carH} r={SZ * 0.085}>
          <Paint color="rgba(51,133,255,0.30)">
            <BlurMask blur={8} style="normal" />
          </Paint>
        </Circle>
        {/* Front wheel */}
        <Circle cx={carX + carW * 0.24} cy={carY + carH} r={SZ * 0.075}>
          <LinearGradient
            start={vec(carX + carW * 0.17, carY + carH - SZ * 0.075)}
            end={vec(carX + carW * 0.31, carY + carH + SZ * 0.075)}
            colors={['#0D1526', '#060E1E']}
          />
        </Circle>
        <Circle cx={carX + carW * 0.24} cy={carY + carH} r={SZ * 0.075}>
          <Paint color="rgba(51,133,255,0.70)" style="stroke" strokeWidth={2.5} />
        </Circle>
        <Circle cx={carX + carW * 0.24} cy={carY + carH} r={SZ * 0.030}>
          <Paint color="rgba(255,255,255,0.25)" style="stroke" strokeWidth={1.5} />
        </Circle>
        <Circle cx={carX + carW * 0.24} cy={carY + carH} r={SZ * 0.012}>
          <Paint color="#3385FF" />
        </Circle>

        {/* Rear wheel glow */}
        <Circle cx={carX + carW * 0.78} cy={carY + carH} r={SZ * 0.085}>
          <Paint color="rgba(51,133,255,0.30)">
            <BlurMask blur={8} style="normal" />
          </Paint>
        </Circle>
        {/* Rear wheel */}
        <Circle cx={carX + carW * 0.78} cy={carY + carH} r={SZ * 0.075}>
          <LinearGradient
            start={vec(carX + carW * 0.71, carY + carH - SZ * 0.075)}
            end={vec(carX + carW * 0.85, carY + carH + SZ * 0.075)}
            colors={['#0D1526', '#060E1E']}
          />
        </Circle>
        <Circle cx={carX + carW * 0.78} cy={carY + carH} r={SZ * 0.075}>
          <Paint color="rgba(51,133,255,0.70)" style="stroke" strokeWidth={2.5} />
        </Circle>
        <Circle cx={carX + carW * 0.78} cy={carY + carH} r={SZ * 0.030}>
          <Paint color="rgba(255,255,255,0.25)" style="stroke" strokeWidth={1.5} />
        </Circle>
        <Circle cx={carX + carW * 0.78} cy={carY + carH} r={SZ * 0.012}>
          <Paint color="#3385FF" />
        </Circle>

        {/* Headlights */}
        {[0, SZ * 0.04, SZ * 0.08].map((offset, i) => (
          <Line
            key={i}
            p1={vec(carX + carW, carY + carH * 0.20 + offset)}
            p2={vec(carX + carW + SZ * 0.06, carY + carH * 0.15 + offset - SZ * 0.01 * i)}
          >
            <Paint color={`rgba(51,133,255,${0.9 - i * 0.2})`} strokeWidth={2.5} strokeCap="round" />
          </Line>
        ))}
        {/* Taillights */}
        <Line p1={vec(carX, carY + carH * 0.30)} p2={vec(carX - SZ * 0.04, carY + carH * 0.30)}>
          <Paint color="rgba(229,57,53,0.80)" strokeWidth={3} strokeCap="round" />
        </Line>
        <Line p1={vec(carX, carY + carH * 0.48)} p2={vec(carX - SZ * 0.04, carY + carH * 0.48)}>
          <Paint color="rgba(229,57,53,0.60)" strokeWidth={2.5} strokeCap="round" />
        </Line>
      </Group>

      {/* ── Location pin ── */}
      <Group opacity={pin}>
        {/* Glow */}
        <Circle cx={SZ * 0.50} cy={SZ * 0.18} r={SZ * 0.12}>
          <Paint color="rgba(51,133,255,0.35)">
            <BlurMask blur={16} style="normal" />
          </Paint>
        </Circle>
        {/* Pin body */}
        <Path
          path={`M ${SZ * 0.41} ${SZ * 0.18}
                 Q ${SZ * 0.41} ${SZ * 0.08} ${SZ * 0.50} ${SZ * 0.08}
                 Q ${SZ * 0.59} ${SZ * 0.08} ${SZ * 0.59} ${SZ * 0.18}
                 Q ${SZ * 0.59} ${SZ * 0.28} ${SZ * 0.50} ${SZ * 0.36}
                 Q ${SZ * 0.41} ${SZ * 0.28} ${SZ * 0.41} ${SZ * 0.18} Z`}
        >
          <LinearGradient
            start={vec(SZ * 0.41, SZ * 0.08)}
            end={vec(SZ * 0.59, SZ * 0.36)}
            colors={['#3385FF', '#0142C0']}
          />
        </Path>
        {/* Pin inner ring */}
        <Circle cx={SZ * 0.50} cy={SZ * 0.18} r={SZ * 0.042}>
          <Paint color="rgba(255,255,255,0.95)" />
        </Circle>
        <Circle cx={SZ * 0.50} cy={SZ * 0.18} r={SZ * 0.022}>
          <Paint color="#0142C0" />
        </Circle>

        {/* Signal arcs */}
        {[
          { r: SZ * 0.095, op: 0.80, sw: 2.5 },
          { r: SZ * 0.140, op: 0.50, sw: 2.0 },
          { r: SZ * 0.185, op: 0.28, sw: 1.5 },
        ].map(({ r, op, sw }, i) => (
          <Path
            key={i}
            path={`M ${SZ * 0.59 + (r - SZ * 0.095)} ${SZ * 0.10}
                   Q ${SZ * 0.62 + (r - SZ * 0.095) * 0.8} ${SZ * 0.18}
                     ${SZ * 0.59 + (r - SZ * 0.095)} ${SZ * 0.26}`}
          >
            <Paint
              color={`rgba(51,133,255,${op})`}
              style="stroke"
              strokeWidth={sw}
              strokeCap="round"
            />
          </Path>
        ))}

        {/* Dashed connector to car */}
        <Line p1={vec(SZ * 0.50, SZ * 0.37)} p2={vec(SZ * 0.50, SZ * 0.43)}>
          <Paint color="rgba(255,255,255,0.28)" strokeWidth={1.8} strokeCap="round" />
        </Line>
      </Group>
    </Canvas>
  );
}

// ─── Slide 3 — Support ───────────────────────────────────────────────────────

export function SupportIllustration() {
  const bg  = useEntrance(0, 600);
  const b1  = useEntrance(100, 550);
  const b2  = useEntrance(400, 550);
  const b3  = useEntrance(680, 500);
  const sp  = useEntrance(800, 500);

  const cx = SZ / 2;
  const cy = SZ / 2;

  // Bubble 1 — user (left)
  const b1X = SZ * 0.05;
  const b1Y = SZ * 0.08;
  const b1W = SZ * 0.66;
  const b1H = SZ * 0.22;

  // Bubble 2 — AI (right)
  const b2X = SZ * 0.29;
  const b2Y = SZ * 0.38;
  const b2W = SZ * 0.66;
  const b2H = SZ * 0.22;

  // Bubble 3 — typing (left)
  const b3X = SZ * 0.05;
  const b3Y = SZ * 0.68;
  const b3W = SZ * 0.36;
  const b3H = SZ * 0.14;

  return (
    <Canvas style={{ width: SZ, height: SZ }}>
      {/* ── Ambient blobs ── */}
      <Group opacity={bg}>
        <Circle cx={cx} cy={cy + SZ * 0.05} r={SZ * 0.40}>
          <Paint color="rgba(51,133,255,0.32)">
            <BlurMask blur={SZ * 0.16} style="normal" />
          </Paint>
        </Circle>
        <Circle cx={SZ * 0.80} cy={SZ * 0.20} r={SZ * 0.22}>
          <Paint color="rgba(107,53,240,0.30)">
            <BlurMask blur={SZ * 0.12} style="normal" />
          </Paint>
        </Circle>
        <Circle cx={SZ * 0.15} cy={SZ * 0.75} r={SZ * 0.16}>
          <Paint color="rgba(1,66,192,0.25)">
            <BlurMask blur={SZ * 0.10} style="normal" />
          </Paint>
        </Circle>
      </Group>

      {/* ── Bubble 1 — user ── */}
      <Group opacity={b1}>
        {/* Shadow */}
        <RoundedRect x={b1X} y={b1Y} width={b1W} height={b1H} r={SZ * 0.045}>
          <Paint color="rgba(1,66,192,0.20)">
            <BlurMask blur={10} style="normal" />
          </Paint>
        </RoundedRect>
        {/* Body */}
        <RoundedRect x={b1X} y={b1Y} width={b1W} height={b1H} r={SZ * 0.045}>
          <LinearGradient
            start={vec(b1X, b1Y)}
            end={vec(b1X, b1Y + b1H)}
            colors={['rgba(13,26,60,0.97)', 'rgba(8,18,45,0.97)']}
          />
        </RoundedRect>
        <RoundedRect x={b1X} y={b1Y} width={b1W} height={b1H} r={SZ * 0.045}>
          <Paint color="rgba(255,255,255,0.10)" style="stroke" strokeWidth={1} />
        </RoundedRect>
        {/* Tail (bottom-left) */}
        <Path path={`M ${b1X + SZ * 0.06} ${b1Y + b1H} L ${b1X + SZ * 0.02} ${b1Y + b1H + SZ * 0.05} L ${b1X + SZ * 0.16} ${b1Y + b1H}`}>
          <LinearGradient
            start={vec(b1X, b1Y + b1H)}
            end={vec(b1X, b1Y + b1H + SZ * 0.05)}
            colors={['rgba(8,18,45,0.97)', 'rgba(8,18,45,0)']}
          />
        </Path>
        {/* Text lines */}
        <Line p1={vec(b1X + SZ * 0.08, b1Y + b1H * 0.38)} p2={vec(b1X + b1W - SZ * 0.08, b1Y + b1H * 0.38)}>
          <Paint color="rgba(255,255,255,0.60)" strokeWidth={2.5} strokeCap="round" />
        </Line>
        <Line p1={vec(b1X + SZ * 0.08, b1Y + b1H * 0.65)} p2={vec(b1X + b1W * 0.60, b1Y + b1H * 0.65)}>
          <Paint color="rgba(255,255,255,0.35)" strokeWidth={2} strokeCap="round" />
        </Line>
      </Group>

      {/* ── Bubble 2 — AI response ── */}
      <Group opacity={b2}>
        {/* Glow */}
        <RoundedRect x={b2X} y={b2Y} width={b2W} height={b2H} r={SZ * 0.045}>
          <Paint color="rgba(51,133,255,0.18)">
            <BlurMask blur={12} style="normal" />
          </Paint>
        </RoundedRect>
        {/* Body */}
        <RoundedRect x={b2X} y={b2Y} width={b2W} height={b2H} r={SZ * 0.045}>
          <LinearGradient
            start={vec(b2X, b2Y)}
            end={vec(b2X + b2W, b2Y + b2H)}
            colors={['rgba(0,60,180,0.95)', 'rgba(0,30,100,0.95)']}
          />
        </RoundedRect>
        <RoundedRect x={b2X} y={b2Y} width={b2W} height={b2H} r={SZ * 0.045}>
          <Paint color="rgba(100,160,255,0.30)" style="stroke" strokeWidth={1} />
        </RoundedRect>
        {/* Tail (bottom-right) */}
        <Path path={`M ${b2X + b2W - SZ * 0.16} ${b2Y + b2H} L ${b2X + b2W + SZ * 0.02} ${b2Y + b2H + SZ * 0.05} L ${b2X + b2W - SZ * 0.06} ${b2Y + b2H}`}>
          <LinearGradient
            start={vec(b2X + b2W, b2Y + b2H)}
            end={vec(b2X + b2W, b2Y + b2H + SZ * 0.05)}
            colors={['rgba(0,30,100,0.95)', 'rgba(0,30,100,0)']}
          />
        </Path>
        {/* Text lines */}
        <Line p1={vec(b2X + SZ * 0.08, b2Y + b2H * 0.38)} p2={vec(b2X + b2W - SZ * 0.08, b2Y + b2H * 0.38)}>
          <Paint color="rgba(255,255,255,0.85)" strokeWidth={2.5} strokeCap="round" />
        </Line>
        <Line p1={vec(b2X + SZ * 0.08, b2Y + b2H * 0.65)} p2={vec(b2X + b2W * 0.68, b2Y + b2H * 0.65)}>
          <Paint color="rgba(255,255,255,0.55)" strokeWidth={2} strokeCap="round" />
        </Line>
      </Group>

      {/* ── Bubble 3 — typing ── */}
      <Group opacity={b3}>
        <RoundedRect x={b3X} y={b3Y} width={b3W} height={b3H} r={SZ * 0.035}>
          <LinearGradient
            start={vec(b3X, b3Y)}
            end={vec(b3X, b3Y + b3H)}
            colors={['rgba(13,26,60,0.90)', 'rgba(8,18,45,0.90)']}
          />
        </RoundedRect>
        <RoundedRect x={b3X} y={b3Y} width={b3W} height={b3H} r={SZ * 0.035}>
          <Paint color="rgba(255,255,255,0.08)" style="stroke" strokeWidth={1} />
        </RoundedRect>
        {/* Typing dots */}
        {[0, SZ * 0.08, SZ * 0.16].map((offset, i) => (
          <Circle key={i} cx={b3X + b3W * 0.22 + offset} cy={b3Y + b3H * 0.52} r={SZ * 0.024}>
            <Paint color={`rgba(51,133,255,${1 - i * 0.28})`} />
          </Circle>
        ))}
        {/* Tail */}
        <Path path={`M ${b3X + SZ * 0.06} ${b3Y + b3H} L ${b3X + SZ * 0.02} ${b3Y + b3H + SZ * 0.04} L ${b3X + SZ * 0.14} ${b3Y + b3H}`}>
          <LinearGradient
            start={vec(b3X, b3Y + b3H)}
            end={vec(b3X, b3Y + b3H + SZ * 0.04)}
            colors={['rgba(8,18,45,0.90)', 'rgba(8,18,45,0)']}
          />
        </Path>
      </Group>

      {/* ── AI sparkle ── */}
      <Group opacity={sp}>
        {/* Outer glow */}
        <Circle cx={SZ * 0.78} cy={SZ * 0.16} r={SZ * 0.09}>
          <Paint color="rgba(51,133,255,0.35)">
            <BlurMask blur={12} style="normal" />
          </Paint>
        </Circle>
        {/* Large star */}
        <Path
          path={`M ${SZ * 0.78} ${SZ * 0.07}
                 L ${SZ * 0.808} ${SZ * 0.138}
                 L ${SZ * 0.876} ${SZ * 0.16}
                 L ${SZ * 0.808} ${SZ * 0.182}
                 L ${SZ * 0.78} ${SZ * 0.25}
                 L ${SZ * 0.752} ${SZ * 0.182}
                 L ${SZ * 0.684} ${SZ * 0.16}
                 L ${SZ * 0.752} ${SZ * 0.138} Z`}
        >
          <LinearGradient
            start={vec(SZ * 0.684, SZ * 0.07)}
            end={vec(SZ * 0.876, SZ * 0.25)}
            colors={['rgba(100,180,255,0.95)', 'rgba(1,66,192,0.95)']}
          />
        </Path>
        {/* Small star */}
        <Path
          path={`M ${SZ * 0.66} ${SZ * 0.10}
                 L ${SZ * 0.674} ${SZ * 0.128}
                 L ${SZ * 0.702} ${SZ * 0.136}
                 L ${SZ * 0.674} ${SZ * 0.144}
                 L ${SZ * 0.66} ${SZ * 0.172}
                 L ${SZ * 0.646} ${SZ * 0.144}
                 L ${SZ * 0.618} ${SZ * 0.136}
                 L ${SZ * 0.646} ${SZ * 0.128} Z`}
        >
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

const BLUE_S  = '#3385FF';
const WHITE_S = 'rgba(255,255,255,0.90)';
const WHITE2_S = 'rgba(255,255,255,0.35)';
const GLOW_S  = 'rgba(51,133,255,0.30)';
const FILL1_S = 'rgba(1,66,192,0.28)';

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

export function CarSilhouette() {
  const glow    = useFillSvg(0, 800);
  const body    = useDraw(900, 0, 1200);
  const winFill = useFillSvg(600, 600);
  const wheels  = useDraw(300, 900, 700);
  const details = useDraw(250, 1100, 600);
  const ground  = useDraw(900, 200, 1000);

  const W2 = SZ;
  const H2 = SZ * 0.52;

  return (
    <Svg width={W2} height={H2} viewBox="0 0 300 156">
      <AnimatedSvgCircle cx="150" cy="128" r="100" fill={GLOW_S} animatedProps={glow} stroke="none" />
      <AnimatedSvgPath d="M8 128 L292 128"
        stroke={WHITE2_S} strokeWidth="1.5" strokeDasharray="900" animatedProps={ground} />
      <AnimatedSvgPath
        d="M18 100 L18 78 Q20 62 40 56 L90 44 Q112 36 144 34 L184 34 Q214 36 236 46 L266 58 Q284 64 286 80 L286 100 Z"
        stroke={BLUE_S} strokeWidth="3.5" fill={FILL1_S}
        strokeDasharray="900" animatedProps={body} />
      <AnimatedSvgPath d="M76 56 Q98 32 142 28 L184 28 Q220 30 246 56"
        stroke={BLUE_S} strokeWidth="3.5" fill="none"
        strokeDasharray="900" animatedProps={body} />
      <AnimatedSvgRect x="96" y="34" width="72" height="26" rx="4"
        fill="rgba(51,133,255,0.22)" fillOpacity={0} stroke="none"
        animatedProps={winFill} />
      <AnimatedSvgPath d="M98 56 L110 32 L166 32 L166 56 Z"
        stroke={BLUE_S} strokeWidth="2.5" fill="none"
        strokeDasharray="300" animatedProps={body} />
      <AnimatedSvgRect x="168" y="34" width="68" height="22" rx="4"
        fill="rgba(51,133,255,0.22)" fillOpacity={0} stroke="none"
        animatedProps={winFill} />
      <AnimatedSvgPath d="M168 56 L178 32 L224 32 L240 56 Z"
        stroke={BLUE_S} strokeWidth="2.5" fill="none"
        strokeDasharray="300" animatedProps={body} />
      <AnimatedSvgLine x1="167" y1="34" x2="167" y2="100"
        stroke={WHITE2_S} strokeWidth="2"
        strokeDasharray="250" animatedProps={details} />
      <AnimatedSvgLine x1="182" y1="72" x2="200" y2="72"
        stroke={WHITE_S} strokeWidth="3.5" strokeLinecap="round"
        strokeDasharray="250" animatedProps={details} />
      <AnimatedSvgCircle cx="78" cy="106" r="24"
        stroke={BLUE_S} strokeWidth="3.5" fill="rgba(2,8,18,0.92)"
        strokeDasharray="300" animatedProps={wheels} />
      <AnimatedSvgCircle cx="78" cy="106" r="11"
        stroke={WHITE2_S} strokeWidth="2" fill="none"
        strokeDasharray="200" animatedProps={wheels} />
      <AnimatedSvgCircle cx="78" cy="106" r="4"
        fill={BLUE_S} stroke="none" strokeDasharray="50" animatedProps={wheels} />
      <AnimatedSvgCircle cx="224" cy="106" r="24"
        stroke={BLUE_S} strokeWidth="3.5" fill="rgba(2,8,18,0.92)"
        strokeDasharray="300" animatedProps={wheels} />
      <AnimatedSvgCircle cx="224" cy="106" r="11"
        stroke={WHITE2_S} strokeWidth="2" fill="none"
        strokeDasharray="200" animatedProps={wheels} />
      <AnimatedSvgCircle cx="224" cy="106" r="4"
        fill={BLUE_S} stroke="none" strokeDasharray="50" animatedProps={wheels} />
      <AnimatedSvgPath d="M284 68 L294 62 M284 76 L295 76 M284 84 L294 90"
        stroke={BLUE_S} strokeWidth="3" strokeLinecap="round"
        strokeDasharray="250" animatedProps={details} />
      <AnimatedSvgPath d="M16 70 L6 70 M16 80 L5 80"
        stroke="rgba(229,57,53,0.7)" strokeWidth="3" strokeLinecap="round"
        strokeDasharray="250" animatedProps={details} />
    </Svg>
  );
}
