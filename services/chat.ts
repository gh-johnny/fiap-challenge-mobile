export interface ChatResponse {
  text: string;
}

// ─── Canned responses ────────────────────────────────────────────────────────

const CANNED: { match: RegExp; reply: string }[] = [
  {
    match: /recall/i,
    reply: "Ford's recall information is available at ford.com/recalls. Enter your VIN to check if your vehicle has any open recalls. Want me to guide you through the process?",
  },
  {
    match: /warrant(y|ee)/i,
    reply: "Your Ford comes with a 3-year/100,000 km Bumper-to-Bumper warranty and a 5-year/100,000 km Powertrain warranty. Reach out to your dealer for coverage details.",
  },
  {
    match: /oil|troca de óleo/i,
    reply: "Ford recommends oil changes every 10,000 km or 12 months. Based on your vehicle history, your next oil change is due in approximately 3,200 km.",
  },
  {
    match: /tire|pneu|tyre/i,
    reply: "Check tire pressure monthly. Recommended pressure: 32 PSI front and rear. Rotate tires every 10,000 km to extend their life.",
  },
  {
    match: /schedule|agendar|appointment|service/i,
    reply: "I can help you schedule a service. Tap the Schedule tab at the bottom to book an appointment at your nearest Ford dealer.",
  },
  {
    match: /dealer|concession/i,
    reply: "Your nearest authorized Ford dealer is Ford Morumbi — Av. das Nações Unidas, 12995. Open Mon–Fri 8am–6pm, Sat 8am–1pm. Call (11) 3000-1234 to speak with a service advisor.",
  },
  {
    match: /battery|bateria/i,
    reply: "Your battery health is currently at 94%. Ford recommends replacing batteries every 4–5 years. If you notice slow starts, come in for a free battery test.",
  },
  {
    match: /brake|freio/i,
    reply: "Your brake health indicator shows 65%. Ford recommends an inspection when this drops below 60%. You can book one via the Schedule tab.",
  },
  {
    match: /fuel|gas|gasolina|ethanol|flex/i,
    reply: "Your Ford Flex vehicle runs on any mix of gasoline and ethanol. For best performance in cold weather, use a higher gasoline blend.",
  },
  {
    match: /hello|hi|oi|olá|hey/i,
    reply: "Hi! I'm Ford AI, your personal vehicle assistant. I can help with maintenance, warranty, recalls, dealer locations, and more. What can I help you with?",
  },
];

const FALLBACK = "I don't have a specific answer right now, but our service advisors are available at (11) 3000-1234. Is there anything else I can help you with?";

function mockReply(message: string): string {
  for (const { match, reply } of CANNED) {
    if (match.test(message)) return reply;
  }
  return FALLBACK;
}

export async function sendMessage(
  message: string,
  _context: { vehicleModel?: string; vehicleYear?: string } = {},
): Promise<ChatResponse> {
  await new Promise((r) => setTimeout(r, 900 + Math.random() * 500));
  return { text: mockReply(message) };
}
