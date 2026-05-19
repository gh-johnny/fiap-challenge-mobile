import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuthStore } from '@/store/auth';
import { decodeVin, VinDecoded } from '@/utils/vin';

interface ScanResult {
  vin: string;
  decoded: VinDecoded;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function VinScanner({ visible, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<ScanResult | null>(null);
  const scanned = useRef(false);
  const setVehicle = useAuthStore((s) => s.setVehicle);
  const vehicle = useAuthStore((s) => s.vehicle);

  const handleBarcode = useCallback(({ data }: { data: string }) => {
    if (scanned.current) return;
    const decoded = decodeVin(data.trim());
    if (!decoded) return;

    scanned.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setResult({ vin: data.trim().toUpperCase(), decoded });
  }, []);

  function confirm() {
    if (!result) return;
    setVehicle({
      model: vehicle?.model ?? 'Ford',
      year: result.decoded.year || vehicle?.year || '—',
      plate: vehicle?.plate ?? '—',
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    handleClose();
  }

  function handleClose() {
    scanned.current = false;
    setResult(null);
    onClose();
  }

  function retry() {
    scanned.current = false;
    setResult(null);
  }

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={handleClose}>
      <View style={styles.root}>
        {/* Camera or permission prompt */}
        {!permission?.granted ? (
          <View style={styles.permissionBox}>
            <Text style={styles.permIcon}>📷</Text>
            <Text style={styles.permTitle}>Camera Access Needed</Text>
            <Text style={styles.permSub}>Allow camera to scan your vehicle's VIN barcode.</Text>
            <Pressable
              style={({ pressed }) => [styles.permBtn, pressed && { opacity: 0.8 }]}
              onPress={requestPermission}
            >
              <Text style={styles.permBtnText}>Allow Camera</Text>
            </Pressable>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'code39', 'datamatrix', 'pdf417'] }}
            onBarcodeScanned={result ? undefined : handleBarcode}
          />
        )}

        {/* Overlay */}
        <View style={styles.overlay} pointerEvents="box-none">
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
              onPress={handleClose}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
            <Text style={styles.topTitle}>Scan VIN</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Scan frame */}
          <View style={styles.frameArea}>
            <View style={styles.frame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text style={styles.hint}>
              {result ? '✅ VIN detected!' : 'Point at the VIN barcode on your vehicle'}
            </Text>
          </View>

          {/* Result card */}
          {result && (
            <Animated.View entering={SlideInDown.springify().damping(22)} style={styles.resultCard}>
              <Text style={styles.resultTitle}>VIN Decoded</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultKey}>VIN</Text>
                <Text style={styles.resultVal} numberOfLines={1}>{result.vin}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultKey}>Year</Text>
                <Text style={styles.resultVal}>{result.decoded.year || '—'}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultKey}>Market</Text>
                <Text style={styles.resultVal}>{result.decoded.market ?? 'Unknown'}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultKey}>Ford</Text>
                <Text style={[styles.resultVal, { color: result.decoded.isFord ? Colors.success : Colors.danger }]}>
                  {result.decoded.isFord ? 'Yes ✓' : 'Not Ford'}
                </Text>
              </View>

              <View style={styles.resultActions}>
                <Pressable
                  style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.7 }]}
                  onPress={retry}
                >
                  <Text style={styles.retryBtnText}>Scan Again</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.confirmBtn, pressed && { opacity: 0.85 }]}
                  onPress={confirm}
                >
                  <Text style={styles.confirmBtnText}>Use This VIN</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const CORNER = 20;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  permissionBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface, padding: Spacing.xl, gap: Spacing.md,
  },
  permIcon: { fontSize: 56 },
  permTitle: { ...Typography.subheading, textAlign: 'center' },
  permSub: { ...Typography.body, textAlign: 'center' },
  permBtn: {
    backgroundColor: Colors.blue, borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  permBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },

  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: Colors.white, fontSize: 18, fontWeight: '600' },
  topTitle: { color: Colors.white, fontSize: 18, fontWeight: '700' },

  frameArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  frame: {
    width: 280, height: 100,
    position: 'relative',
  },
  corner: {
    position: 'absolute', width: CORNER, height: CORNER,
    borderColor: Colors.blue, borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', paddingHorizontal: Spacing.xl },

  resultCard: {
    backgroundColor: Colors.card, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.lg, paddingBottom: 48,
    borderTopWidth: 1, borderColor: 'rgba(1,66,192,0.35)',
    gap: Spacing.sm,
  },
  resultTitle: { color: Colors.white, fontSize: 18, fontWeight: '700', marginBottom: Spacing.xs },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultKey: { color: Colors.muted, fontSize: 13 },
  resultVal: { color: Colors.white, fontSize: 13, fontWeight: '600', maxWidth: 220 },
  resultActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  retryBtn: {
    flex: 1, paddingVertical: 14, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  retryBtnText: { color: Colors.mutedLight, fontWeight: '600' },
  confirmBtn: {
    flex: 2, paddingVertical: 14, borderRadius: Radius.md,
    backgroundColor: Colors.blue, alignItems: 'center',
  },
  confirmBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
