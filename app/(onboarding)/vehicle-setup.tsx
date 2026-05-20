import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/animated-button';
import { MeshGradient } from '@/components/mesh-gradient';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuthStore } from '@/store/auth';

const { height, width } = Dimensions.get('window');

// VIN position 10 → model year
const VIN_YEAR: Record<string, number> = {
  A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016,
  H: 2017, J: 2018, K: 2019, L: 2020, M: 2021, N: 2022, P: 2023,
  R: 2024, S: 2025, T: 2026,
  '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
  '6': 2006, '7': 2007, '8': 2008, '9': 2009,
};

// WMI (chars 1–3) → Ford market
const FORD_WMI: Record<string, string> = {
  '9BF': 'Ford Brazil', '9BB': 'Ford Brazil',
  '1FA': 'Ford USA', '1FB': 'Ford USA', '1FC': 'Ford USA',
  '1FD': 'Ford USA', '1FT': 'Ford USA',
  '3FA': 'Ford Mexico', 'WF0': 'Ford Germany', 'SFA': 'Ford UK',
};

function decodeVin(vin: string): { year: string; isFord: boolean } | null {
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return null;
  const yearChar = vin[9].toUpperCase();
  const year = VIN_YEAR[yearChar];
  const wmi = vin.slice(0, 3).toUpperCase();
  const isFord = wmi in FORD_WMI;
  return { year: year ? String(year) : '', isFord };
}

// ─── VIN Scanner Modal ───────────────────────────────────────────────────────

function VinScannerModal({ visible, onScanned, onClose }: {
  visible: boolean;
  onScanned: (vin: string) => void;
  onClose: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const scanned = useRef(false);
  const scanLineY = useSharedValue(0);
  const successOpacity = useSharedValue(0);
  const [successVin, setSuccessVin] = useState('');

  useEffect(() => {
    if (visible) {
      scanned.current = false;
      setSuccessVin('');
      successOpacity.value = 0;
      scanLineY.value = withRepeat(
        withSequence(
          withTiming(SCAN_BOX_H, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
      if (!permission?.granted) requestPermission();
    }
  }, [visible]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));
  const successStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
  }));

  const handleBarcode = useCallback(({ data }: { data: string }) => {
    if (scanned.current) return;
    const vin = data.trim().toUpperCase();
    const decoded = decodeVin(vin);
    if (!decoded) return;
    scanned.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSuccessVin(vin);
    successOpacity.value = withTiming(1, { duration: 300 });
    setTimeout(() => { onScanned(vin); onClose(); }, 1200);
  }, [onScanned, onClose]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={scanner.root}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['code39', 'code128', 'qr', 'pdf417'] }}
            onBarcodeScanned={handleBarcode}
          />
        ) : (
          <View style={scanner.noPermission}>
            <Text style={scanner.noPermText}>Permissão de câmera necessária</Text>
            <Pressable style={scanner.grantBtn} onPress={requestPermission}>
              <Text style={scanner.grantText}>Permitir acesso</Text>
            </Pressable>
          </View>
        )}

        {/* Dark overlay with cutout */}
        <View style={scanner.overlay}>
          <View style={scanner.overlayTop} />
          <View style={scanner.overlayMiddle}>
            <View style={scanner.overlaySide} />
            {/* Scan box */}
            <View style={scanner.scanBox}>
              {/* Corner marks */}
              <View style={[scanner.corner, scanner.tl]} />
              <View style={[scanner.corner, scanner.tr]} />
              <View style={[scanner.corner, scanner.bl]} />
              <View style={[scanner.corner, scanner.br]} />
              {/* Animated scan line */}
              <Animated.View style={[scanner.scanLine, scanLineStyle]} />
            </View>
            <View style={scanner.overlaySide} />
          </View>
          <View style={scanner.overlayBottom} />
        </View>

        {/* Labels */}
        <View style={scanner.ui}>
          <SafeAreaView>
            <Pressable style={scanner.closeBtn} onPress={onClose}>
              <Text style={scanner.closeText}>✕  Fechar</Text>
            </Pressable>
          </SafeAreaView>

          <View style={scanner.bottomUi}>
            <Text style={scanner.hint}>Posicione o código de barras do VIN</Text>
            <Text style={scanner.hintSub}>Etiqueta no painel, porta ou para-brisa</Text>

            {successVin ? (
              <Animated.View style={[scanner.successBadge, successStyle]}>
                <Text style={scanner.successText}>✓  VIN detectado</Text>
                <Text style={scanner.successVin}>{successVin}</Text>
              </Animated.View>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const SCAN_BOX_W = width * 0.78;
const SCAN_BOX_H = 110;

const scanner = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  noPermission: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  noPermText: { color: Colors.white, fontSize: 16 },
  grantBtn: { backgroundColor: Colors.blue, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.lg },
  grantText: { color: Colors.white, fontWeight: '600' },
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  overlayMiddle: { flexDirection: 'row', height: SCAN_BOX_H },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  overlayBottom: { flex: 1.4, backgroundColor: 'rgba(0,0,0,0.65)' },
  scanBox: { width: SCAN_BOX_W, overflow: 'hidden' },
  scanLine: {
    position: 'absolute',
    left: 0, right: 0,
    height: 2,
    backgroundColor: Colors.blue,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  corner: {
    position: 'absolute',
    width: 20, height: 20,
    borderColor: Colors.blue,
    borderWidth: 3,
  },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  ui: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  closeBtn: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  closeText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  bottomUi: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.sm, alignItems: 'center' },
  hint: { color: Colors.white, fontSize: 15, fontWeight: '600', textAlign: 'center' },
  hintSub: { color: Colors.mutedLight, fontSize: 13, textAlign: 'center' },
  successBadge: {
    marginTop: Spacing.md,
    backgroundColor: 'rgba(0,200,83,0.15)',
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  successText: { color: Colors.success, fontWeight: '700', fontSize: 15 },
  successVin: { color: Colors.mutedLight, fontSize: 11, letterSpacing: 1.5, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
});

// ─────────────────────────────────────────────────────────────────────────────

const FORD_MODELS = [
  'EcoSport', 'Ka', 'Territory', 'Bronco', 'Maverick',
  'Ranger', 'F-150', 'Mustang', 'Edge', 'Explorer',
];

const YEARS = Array.from({ length: 15 }, (_, i) => String(2025 - i));

function PickerModal({ visible, items, onSelect, onClose, title }: {
  visible: boolean; items: string[]; onSelect: (v: string) => void; onClose: () => void; title: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={picker.backdrop} onPress={onClose} />
      <BlurView intensity={Platform.OS === 'android' ? 20 : 50} tint="light" style={picker.sheet}>
        <View style={picker.handle} />
        <Text style={picker.title}>{title}</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {items.map((item) => (
            <Pressable
              key={item}
              style={({ pressed }) => [picker.item, pressed && { opacity: 0.6 }]}
              onPress={() => { Haptics.selectionAsync(); onSelect(item); }}
            >
              <Text style={picker.itemText}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </BlurView>
    </Modal>
  );
}

export default function VehicleSetupScreen() {
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [showModel, setShowModel] = useState(false);
  const [showYear, setShowYear] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState('');
  const [vinFilled, setVinFilled] = useState(false);

  const setVehicle = useAuthStore((s) => s.setVehicle);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const router = useRouter();

  const carOpacity = useSharedValue(0);
  const formY = useSharedValue(60);
  const formOpacity = useSharedValue(0);

  useEffect(() => {
    const e = Easing.out(Easing.cubic);
    carOpacity.value = withTiming(1, { duration: 800, easing: e });
    formOpacity.value = withDelay(400, withTiming(1, { duration: 700, easing: e }));
    formY.value = withDelay(400, withTiming(0, { duration: 700, easing: e }));
  }, []);

  const carStyle = useAnimatedStyle(() => ({ opacity: carOpacity.value }));
  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formY.value }],
  }));

  const handleVinScanned = useCallback((vin: string) => {
    const decoded = decodeVin(vin);
    if (!decoded) return;
    if (decoded.year) setYear(decoded.year);
    setPlate(vin.slice(-7));
    setVinFilled(true);
    setError('');
  }, []);

  function handleDone() {
    if (!model || !year || !plate) {
      setError('Fill all fields.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setVehicle({ model, year, plate: plate.toUpperCase() });
    completeOnboarding();
    router.replace('/(tabs)');
  }

  function skip() {
    completeOnboarding();
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.root}>
      <MeshGradient />
      <SafeAreaView style={styles.safe}>
        {/* Car SVG top half */}
        <Animated.View style={[styles.carArea, carStyle]}>
          <Text style={styles.carEmoji}>🚗</Text>
          <Text style={styles.carLabel}>YOUR FORD</Text>
        </Animated.View>

        {/* Glass form bottom half */}
        <Animated.View style={[styles.formWrap, formStyle]}>
          <BlurView
            intensity={Platform.OS === 'android' ? 30 : 60}
            tint="light"
            style={styles.card}
          >
            <View style={styles.cardInner}>
              <Text style={styles.title}>Add Your Vehicle</Text>
              <Text style={styles.subtitle}>We'll personalize your experience.</Text>

              {/* VIN Scanner */}
              <Pressable
                style={({ pressed }) => [styles.vinBtn, vinFilled && styles.vinBtnFilled, pressed && { opacity: 0.8 }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowScanner(true); }}
              >
                <Text style={styles.vinBtnIcon}>{vinFilled ? '✓' : '⬛'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.vinBtnLabel, vinFilled && { color: Colors.success }]}>
                    {vinFilled ? 'VIN Detectado' : 'Escanear VIN'}
                  </Text>
                  <Text style={styles.vinBtnSub}>
                    {vinFilled ? 'Ano e placa preenchidos automaticamente' : 'Aponte a câmera para o código de barras'}
                  </Text>
                </View>
                <Text style={styles.vinChevron}>›</Text>
              </Pressable>

              {/* Model */}
              <View style={styles.field}>
                <Text style={styles.label}>MODEL</Text>
                <Pressable
                  style={({ pressed }) => [styles.select, pressed && { opacity: 0.7 }]}
                  onPress={() => { Haptics.selectionAsync(); setShowModel(true); }}
                >
                  <Text style={[styles.selectText, !model && styles.placeholder]}>
                    {model || 'Select model'}
                  </Text>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              </View>

              {/* Year */}
              <View style={styles.field}>
                <Text style={styles.label}>YEAR</Text>
                <Pressable
                  style={({ pressed }) => [styles.select, pressed && { opacity: 0.7 }]}
                  onPress={() => { Haptics.selectionAsync(); setShowYear(true); }}
                >
                  <Text style={[styles.selectText, !year && styles.placeholder]}>
                    {year || 'Select year'}
                  </Text>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              </View>

              {/* Plate */}
              <View style={styles.field}>
                <Text style={styles.label}>PLATE</Text>
                <TextInput
                  style={styles.input}
                  value={plate}
                  onChangeText={setPlate}
                  placeholder="ABC-1234"
                  placeholderTextColor={Colors.muted}
                  autoCapitalize="characters"
                  maxLength={8}
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <AnimatedButton label="Add My Ford" onPress={handleDone} style={styles.btn} />

              <Pressable onPress={skip} style={styles.skip}>
                <Text style={styles.skipText}>Skip for now</Text>
              </Pressable>
            </View>
          </BlurView>
        </Animated.View>
      </SafeAreaView>

      <PickerModal visible={showModel} items={FORD_MODELS} title="Select Model"
        onSelect={(v) => { setModel(v); setShowModel(false); }} onClose={() => setShowModel(false)} />
      <PickerModal visible={showYear} items={YEARS} title="Select Year"
        onSelect={(v) => { setYear(v); setShowYear(false); }} onClose={() => setShowYear(false)} />
      <VinScannerModal
        visible={showScanner}
        onScanned={handleVinScanned}
        onClose={() => setShowScanner(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  carArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  carEmoji: { fontSize: 100 },
  carLabel: {
    color: Colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
  },
  formWrap: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(1,66,192,0.20)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(238,242,255,0.95)' : 'transparent',
  },
  cardInner: { padding: Spacing.lg, gap: Spacing.sm },
  title: { ...Typography.heading, fontSize: 22, marginBottom: 2 },
  subtitle: { ...Typography.body, fontSize: 14, marginBottom: Spacing.sm },
  field: { gap: 6 },
  label: { color: Colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  select: {
    backgroundColor: 'rgba(1,66,192,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(1,66,192,0.18)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: { color: Colors.text, fontSize: 15 },
  placeholder: { color: Colors.muted },
  chevron: { color: Colors.muted, fontSize: 20 },
  input: {
    backgroundColor: 'rgba(1,66,192,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(1,66,192,0.18)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 15,
  },
  error: { color: Colors.danger, fontSize: 13 },
  btn: { marginTop: Spacing.xs },
  skip: { alignItems: 'center', paddingVertical: Spacing.xs },
  skipText: { color: Colors.muted, fontSize: 13 },
  vinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(1,66,192,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(1,66,192,0.35)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderStyle: 'dashed',
  },
  vinBtnFilled: {
    backgroundColor: 'rgba(0,200,83,0.08)',
    borderColor: 'rgba(0,200,83,0.4)',
    borderStyle: 'solid',
  },
  vinBtnIcon: { fontSize: 20 },
  vinBtnLabel: { color: Colors.blue, fontSize: 14, fontWeight: '700' },
  vinBtnSub: { color: Colors.muted, fontSize: 11, marginTop: 2 },
  vinChevron: { color: Colors.muted, fontSize: 20 },
});

const picker = StyleSheet.create({
  backdrop: { flex: 1 },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(1,66,192,0.18)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(238,242,255,0.97)' : 'transparent',
    paddingBottom: Spacing.xl,
    maxHeight: height * 0.5,
  },
  handle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginVertical: Spacing.md },
  title: { ...Typography.subheading, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  item: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemText: { color: Colors.text, fontSize: 16 },
});
