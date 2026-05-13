import { Image, StyleSheet } from 'react-native';

interface Props {
  width?: number;
  height?: number;
}

export function FordLogo({ width = 120, height = 50 }: Props) {
  return (
    <Image
      source={require('@/assets/images/logo-ford.png')}
      style={{ width, height }}
      resizeMode="contain"
    />
  );
}
