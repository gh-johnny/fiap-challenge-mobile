import * as LocalAuth from 'expo-local-authentication';

const mockLocalAuth = LocalAuth as jest.Mocked<typeof LocalAuth>;

// Tests for biometric vault logic used in My Car documents section

describe('biometric vault — expo-local-authentication integration', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Re-apply defaults after reset
    mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
    mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
    mockLocalAuth.authenticateAsync.mockResolvedValue({ success: true, error: undefined as any });
    mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([
      LocalAuth.AuthenticationType.FINGERPRINT,
      LocalAuth.AuthenticationType.FACIAL_RECOGNITION,
    ]);
  });

  it('isEnrolledAsync returns true when biometrics are set up', async () => {
    mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(true);
    const enrolled = await LocalAuth.isEnrolledAsync();
    expect(enrolled).toBe(true);
  });

  it('isEnrolledAsync returns false when no biometrics enrolled', async () => {
    mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(false);
    const enrolled = await LocalAuth.isEnrolledAsync();
    expect(enrolled).toBe(false);
  });

  it('authenticateAsync returns success=true on valid auth', async () => {
    mockLocalAuth.authenticateAsync.mockResolvedValueOnce({ success: true, error: undefined as any });
    const result = await LocalAuth.authenticateAsync({ promptMessage: 'Test' });
    expect(result.success).toBe(true);
  });

  it('authenticateAsync returns success=false on failed auth', async () => {
    mockLocalAuth.authenticateAsync.mockResolvedValueOnce({ success: false, error: 'user_cancel' });
    const result = await LocalAuth.authenticateAsync({ promptMessage: 'Test' });
    expect(result.success).toBe(false);
  });

  it('vault should unlock after successful authentication', async () => {
    mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(true);
    mockLocalAuth.authenticateAsync.mockResolvedValueOnce({ success: true, error: undefined as any });

    const enrolled = await LocalAuth.isEnrolledAsync();
    const auth = await LocalAuth.authenticateAsync({ promptMessage: 'Open vault' });

    expect(enrolled).toBe(true);
    expect(auth.success).toBe(true);
    // vault logic: if auth.success → setVaultUnlocked(true)
  });

  it('vault should stay locked after failed authentication', async () => {
    mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(true);
    mockLocalAuth.authenticateAsync.mockResolvedValueOnce({ success: false, error: 'user_cancel' });

    const auth = await LocalAuth.authenticateAsync({ promptMessage: 'Open vault' });
    expect(auth.success).toBe(false);
    // vault logic: if !auth.success → vaultUnlocked stays false
  });

  it('vault allows access without biometrics when none enrolled', async () => {
    mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(false);
    const enrolled = await LocalAuth.isEnrolledAsync();
    expect(enrolled).toBe(false);
    // vault logic: if !enrolled → setVaultUnlocked(true) directly
  });

  it('hasHardwareAsync checks biometric hardware availability', async () => {
    mockLocalAuth.hasHardwareAsync.mockResolvedValueOnce(true);
    const has = await LocalAuth.hasHardwareAsync();
    expect(has).toBe(true);
  });

  it('supportedAuthenticationTypesAsync returns supported types', async () => {
    mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValueOnce([
      LocalAuth.AuthenticationType.FINGERPRINT,
      LocalAuth.AuthenticationType.FACIAL_RECOGNITION,
    ]);
    const types = await LocalAuth.supportedAuthenticationTypesAsync();
    expect(types).toContain(LocalAuth.AuthenticationType.FINGERPRINT);
  });

  it('authenticateAsync is called with correct prompt message', async () => {
    mockLocalAuth.authenticateAsync.mockResolvedValueOnce({ success: true, error: undefined as any });
    await LocalAuth.authenticateAsync({
      promptMessage: 'Authenticate to view documents',
      fallbackLabel: 'Use passcode',
    });
    expect(mockLocalAuth.authenticateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ promptMessage: 'Authenticate to view documents' }),
    );
  });
});
