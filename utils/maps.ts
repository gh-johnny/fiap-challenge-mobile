import * as Linking from 'expo-linking';

import { DEALERS } from '@/constants/dealers';

export function buildRouteUrl(dealerName: string): string {
  const dealer = DEALERS.find(
    (d) => d.name.toLowerCase() === dealerName.toLowerCase(),
  );

  if (dealer) {
    return `https://www.google.com/maps/dir/?api=1&destination=${dealer.lat},${dealer.lng}`;
  }

  const query = encodeURIComponent(`${dealerName} São Paulo`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export async function openRouteToDealer(dealerName: string): Promise<void> {
  const url = buildRouteUrl(dealerName);
  await Linking.openURL(url);
}
