import { sendMessage } from '../../services/chat';

describe('sendMessage', () => {
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

