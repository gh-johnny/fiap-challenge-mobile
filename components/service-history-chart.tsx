import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { MonthBar, TypeCount } from '@/utils/serviceHistory';

// ─── Bar chart (by month) ─────────────────────────────────────────────────────

const CHART_H = 120;
const BAR_W = 28;
const BAR_GAP = 10;

function AnimatedBar({ count, maxCount, index, color }: {
  count: number; maxCount: number; index: number; color: string;
}) {
  const scaleY = useSharedValue(0);
  const barH = maxCount > 0 ? (count / maxCount) * CHART_H : 0;

  useEffect(() => {
    scaleY.value = withDelay(
      index * 60,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
    );
  }, [count]);

  const style = useAnimatedStyle(() => ({
    height: barH * scaleY.value,
    width: BAR_W,
    backgroundColor: color,
    borderRadius: 4,
    alignSelf: 'flex-end',
  }));

  return <Animated.View style={style} />;
}

export function MonthlyBarChart({ data }: { data: MonthBar[] }) {
  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No history yet</Text>
      </View>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartW = data.length * (BAR_W + BAR_GAP) - BAR_GAP;

  return (
    <View style={styles.chartWrap}>
      {/* Y-axis labels */}
      <View style={styles.yAxis}>
        {[maxCount, Math.ceil(maxCount / 2), 0].map((v) => (
          <Text key={v} style={styles.yLabel}>{v}</Text>
        ))}
      </View>

      {/* Bars + x labels */}
      <View style={{ flex: 1 }}>
        {/* Grid lines via SVG */}
        <Svg width="100%" height={CHART_H} style={{ position: 'absolute', top: 0 }}>
          {[0, 0.5, 1].map((f) => (
            <Line
              key={f}
              x1="0" y1={CHART_H * (1 - f)}
              x2="100%" y2={CHART_H * (1 - f)}
              stroke="rgba(255,255,255,0.05)" strokeWidth={1}
            />
          ))}
        </Svg>

        <View style={[styles.barsRow, { height: CHART_H }]}>
          {data.map((bar, i) => (
            <View key={bar.month} style={styles.barCol}>
              <AnimatedBar count={bar.count} maxCount={maxCount} index={i} color={Colors.blue} />
            </View>
          ))}
        </View>

        <View style={styles.xLabels}>
          {data.map((bar) => (
            <Text key={bar.month} style={[styles.xLabel, { width: BAR_W + BAR_GAP }]}>
              {bar.label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Horizontal bar chart (by type) ──────────────────────────────────────────

const TYPE_COLORS = [Colors.blue, '#FFB300', Colors.success, Colors.danger, '#A78BFA', '#34D399'];

function TypeBar({ item, maxCount, index }: { item: TypeCount; maxCount: number; index: number }) {
  const widthPct = useSharedValue(0);

  useEffect(() => {
    widthPct.value = withDelay(
      index * 80,
      withTiming((item.count / maxCount) * 100, { duration: 600, easing: Easing.out(Easing.quad) }),
    );
  }, [item.count]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${widthPct.value}%` as any,
    height: 8,
    backgroundColor: TYPE_COLORS[index % TYPE_COLORS.length],
    borderRadius: 4,
  }));

  return (
    <View style={styles.typeRow}>
      <Text style={styles.typeLabel} numberOfLines={1}>{item.type}</Text>
      <View style={styles.typeTrack}>
        <Animated.View style={fillStyle} />
      </View>
      <Text style={styles.typeCount}>{item.count}</Text>
    </View>
  );
}

export function ServiceTypeChart({ data }: { data: TypeCount[] }) {
  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No history yet</Text>
      </View>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <View style={styles.typeList}>
      {data.map((item, i) => (
        <TypeBar key={item.type} item={item} maxCount={maxCount} index={i} />
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chartWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs },
  yAxis: { justifyContent: 'space-between', height: CHART_H, paddingBottom: 2 },
  yLabel: { color: Colors.muted, fontSize: 9, textAlign: 'right', width: 16 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: BAR_GAP },
  barCol: { width: BAR_W, alignItems: 'center', justifyContent: 'flex-end', height: CHART_H },
  xLabels: { flexDirection: 'row', marginTop: 4 },
  xLabel: { color: Colors.muted, fontSize: 9, textAlign: 'center' },

  typeList: { gap: Spacing.sm },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  typeLabel: { color: Colors.mutedLight, fontSize: 11, width: 100 },
  typeTrack: {
    flex: 1, height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4, overflow: 'hidden',
  },
  typeCount: { color: Colors.muted, fontSize: 11, width: 18, textAlign: 'right' },

  empty: { alignItems: 'center', paddingVertical: Spacing.md },
  emptyText: { ...Typography.caption },
});
