import { sendMessage } from '../../services/chat';

// ── Mock mode (no EXPO_PUBLIC_API_URL) ────────────────────────────────────────

describe('sendMessage — mock mode', () => {
  beforeAll(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
  });

  it('returns a response object with text', async () => {
    const res = await sendMessage('hello');
    expect(res).toHaveProperty('text');
    expect(typeof res.text).toBe('string');
    expect(res.text.length).toBeGreaterThan(0);
  });

  it('matches oil-related query', async () => {
    const res = await sendMessage('oil change');
    expect(res.text.toLowerCase()).toMatch(/oil|km|months/i);
  });

  it('matches "troca de óleo" in portuguese', async () => {
    const res = await sendMessage('troca de óleo');
    expect(res.text.toLowerCase()).toMatch(/oil|km/i);
  });

  it('matches warranty query', async () => {
    const res = await sendMessage('what is my warranty?');
    expect(res.text.toLowerCase()).toMatch(/warrant/i);
  });

  it('matches recall query', async () => {
    const res = await sendMessage('check for recall');
    expect(res.text.toLowerCase()).toMatch(/recall/i);
  });

  it('matches tire query', async () => {
    const res = await sendMessage('check my tires');
    expect(res.text.toLowerCase()).toMatch(/tire|psi|pressure/i);
  });

  it('matches pneu in portuguese', async () => {
    const res = await sendMessage('meu pneu');
    expect(res.text.toLowerCase()).toMatch(/tire|psi|pressure/i);
  });

  it('matches schedule / agendar', async () => {
    const res = await sendMessage('I want to schedule a service');
    expect(res.text.toLowerCase()).toMatch(/schedule|book/i);
  });

  it('matches dealer / concession', async () => {
    const res = await sendMessage('nearest dealer');
    expect(res.text.toLowerCase()).toMatch(/dealer|ford morumbi/i);
  });

  it('matches battery query', async () => {
    const res = await sendMessage('battery status');
    expect(res.text.toLowerCase()).toMatch(/battery|batter/i);
  });

  it('matches brake query', async () => {
    const res = await sendMessage('brake inspection');
    expect(res.text.toLowerCase()).toMatch(/brake|freio/i);
  });

  it('matches fuel / gasolina', async () => {
    const res = await sendMessage('gasolina ou ethanol?');
    expect(res.text.toLowerCase()).toMatch(/fuel|flex|gasoline|ethanol/i);
  });

  it('matches greeting hello', async () => {
    const res = await sendMessage('hello!');
    expect(res.text.toLowerCase()).toMatch(/hi|hello|ford ai/i);
  });

  it('matches greeting oi', async () => {
    const res = await sendMessage('oi Ford');
    expect(res.text.toLowerCase()).toMatch(/hi|hello|ford ai/i);
  });

  it('returns fallback for unrecognized query', async () => {
    const res = await sendMessage('what is the meaning of life?');
    expect(res.text).toMatch(/advisor|1234|anything/i);
  });

  it('returns fallback for empty-ish query', async () => {
    const res = await sendMessage('   ');
    expect(typeof res.text).toBe('string');
  });

  it('accepts context without breaking', async () => {
    const res = await sendMessage('oil change', { vehicleModel: 'Ranger', vehicleYear: '2023' });
    expect(res).toHaveProperty('text');
  });
});

// ── Backend mode (EXPO_PUBLIC_API_URL set) ────────────────────────────────────

describe('sendMessage — backend mode', () => {
  const MOCK_URL = 'https://api.ford-test.com';

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = MOCK_URL;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.restoreAllMocks();
  });

  it('calls fetch with POST method', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'Backend response' }),
    });
    await sendMessage('hello');
    expect(global.fetch).toHaveBeenCalledWith(
      `${MOCK_URL}/chat`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sends message in request body', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'ok' }),
    });
    await sendMessage('my question', { vehicleModel: 'Ka' });
    const call = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(call[1].body);
    expect(body.message).toBe('my question');
    expect(body.vehicleModel).toBe('Ka');
  });

  it('sends Content-Type: application/json header', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'ok' }),
    });
    await sendMessage('hi');
    const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('returns text from backend response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'Backend says hello!' }),
    });
    const res = await sendMessage('hello');
    expect(res.text).toBe('Backend says hello!');
  });

  it('throws on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(sendMessage('hello')).rejects.toThrow('Backend error: 500');
  });

  it('throws on network failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    await expect(sendMessage('hello')).rejects.toThrow('Network error');
  });
});
