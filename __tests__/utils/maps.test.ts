import * as Linking from 'expo-linking';
import { buildRouteUrl, openRouteToDealer } from '../../utils/maps';

jest.mock('expo-linking', () => ({
  openURL: jest.fn().mockResolvedValue(undefined),
}));

describe('buildRouteUrl', () => {
  it('returns coords URL for known dealer (Ford Morumbi)', () => {
    const url = buildRouteUrl('Ford Morumbi');
    expect(url).toContain('maps/dir');
    expect(url).toContain('destination=-23.6197,-46.6997');
  });

  it('returns coords URL for known dealer (Ford Santo André)', () => {
    const url = buildRouteUrl('Ford Santo André');
    expect(url).toContain('destination=-23.6654,-46.5285');
  });

  it('returns coords URL for known dealer (Ford Tatuapé)', () => {
    const url = buildRouteUrl('Ford Tatuapé');
    expect(url).toContain('destination=-23.5403,-46.5731');
  });

  it('matching is case-insensitive', () => {
    const url = buildRouteUrl('ford morumbi');
    expect(url).toContain('destination=-23.6197,-46.6997');
  });

  it('returns text search fallback for unknown dealer', () => {
    const url = buildRouteUrl('Ford Desconhecido');
    expect(url).toContain('maps/search');
    expect(url).toContain('query=');
    expect(url).toContain('Ford');
  });

  it('fallback URL includes S%C3%A3o+Paulo or encoded city', () => {
    const url = buildRouteUrl('Ford XYZ');
    expect(url).toContain('query=');
    expect(url).toMatch(/S%C3%A3o|Paulo/);
  });

  it('fallback URL encodes special characters in dealer name', () => {
    const url = buildRouteUrl('Ford & Cia');
    expect(url).not.toContain('Ford & Cia');
    expect(url).toContain('%26');
  });
});

describe('openRouteToDealer', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls Linking.openURL with correct coords URL for known dealer', async () => {
    await openRouteToDealer('Ford Morumbi');
    expect(Linking.openURL).toHaveBeenCalledWith(
      expect.stringContaining('destination=-23.6197,-46.6997'),
    );
  });

  it('calls Linking.openURL with fallback search URL for unknown dealer', async () => {
    await openRouteToDealer('Ford Inexistente');
    expect(Linking.openURL).toHaveBeenCalledWith(
      expect.stringContaining('maps/search'),
    );
  });

  it('resolves without throwing', async () => {
    await expect(openRouteToDealer('Ford Morumbi')).resolves.toBeUndefined();
  });

  it('propagates Linking errors', async () => {
    (Linking.openURL as jest.Mock).mockRejectedValueOnce(new Error('no handler'));
    await expect(openRouteToDealer('Ford Morumbi')).rejects.toThrow('no handler');
  });
});
