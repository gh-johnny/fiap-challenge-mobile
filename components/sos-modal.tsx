import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useSosStore } from '@/store/sos';

const FORD_ASSIST_NUMBER = 'tel:08007033673';

interface ActionButtonProps {
  icon: string;
  label: string;
  sublabel: string;
  accent?: boolean;
  onPress: () => void;
}

function ActionButton({ icon, label, sublabel, accent, onPress }: ActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
      onPress={onPress}
    >
      <View style={[styles.actionIcon, accent && styles.actionIconAccent]}>
        <Text style={styles.actionEmoji}>{icon}</Text>
      </View>
      <View style={styles.actionText}>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionSub}>{sublabel}</Text>
      </View>
      <Text style={styles.actionChevron}>›</Text>
    </Pressable>
  );
}

interface SosModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SosModal({ visible, onClose }: SosModalProps) {
  const { emergencyContact } = useSosStore();
  const [towRequested, setTowRequested] = useState(false);

  const handleFordAssist = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Linking.openURL(FORD_ASSIST_NUMBER);
  }, []);

  const handleLocation = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const { latitude, longitude } = loc.coords;
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url);
  }, []);

  const handleTow = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTowRequested(true);
    setTimeout(() => setTowRequested(false), 3000);
  }, []);

  const handleEmergencyContact = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const number = emergencyContact ?? '190';
    Linking.openURL(`tel:${number}`);
  }, [emergencyContact]);

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.backdrop}>
        <BlurView intensity={30} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <View style={styles.container} pointerEvents="box-none">
        <Animated.View
          entering={SlideInDown.springify().damping(22).stiffness(200)}
          exiting={SlideOutDown.duration(250)}
          style={styles.sheet}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.pill} />
            <View style={styles.headerRow}>
              <View style={styles.sosIcon}>
                <Text style={styles.sosEmoji}>🚨</Text>
              </View>
              <View>
                <Text style={styles.title}>Ford Assist</Text>
                <Text style={styles.subtitle}>Selecione uma ação de emergência</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <ActionButton
              icon="📞"
              label="Ligar Ford Assist"
              sublabel="Central 24h — 0800 703 3673"
              accent
              onPress={handleFordAssist}
            />
            <View style={styles.separator} />
            <ActionButton
              icon="📍"
              label="Compartilhar Localização"
              sublabel="Abre Google Maps com sua posição"
              onPress={handleLocation}
            />
            <View style={styles.separator} />
            <ActionButton
              icon={towRequested ? '✅' : '🚛'}
              label={towRequested ? 'Reboque Solicitado!' : 'Solicitar Reboque'}
              sublabel={towRequested ? 'Aguarde — serviço em caminho' : 'Assistência mecânica na estrada'}
              onPress={handleTow}
            />
            <View style={styles.separator} />
            <ActionButton
              icon="👤"
              label="Contato de Emergência"
              sublabel={emergencyContact ?? 'Nenhum contato cadastrado'}
              onPress={handleEmergencyContact}
            />
          </View>

          {/* Close */}
          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onClose(); }}
          >
            <Text style={styles.closeBtnText}>Fechar</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.3)',
    paddingBottom: 36,
    overflow: 'hidden',
  },
  pill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,57,53,0.15)',
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sosIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(229,57,53,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosEmoji: { fontSize: 24 },
  title: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.caption,
    marginTop: 2,
  },
  actions: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  actionPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.md,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconAccent: {
    backgroundColor: 'rgba(229,57,53,0.15)',
  },
  actionEmoji: { fontSize: 20 },
  actionText: { flex: 1 },
  actionLabel: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  actionSub: {
    ...Typography.caption,
    marginTop: 2,
  },
  actionChevron: {
    color: Colors.muted,
    fontSize: 22,
    fontWeight: '300',
  },
  closeBtn: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  closeBtnText: {
    color: Colors.mutedLight,
    fontSize: 15,
    fontWeight: '600',
  },
});
