# Ford Mobile App — Instruções para Claude

## Idioma
- Chat: Português (pt-BR)
- Código, variáveis, comentários técnicos: Inglês

---

## Prioridades de Desenvolvimento

1. **Leia o código existente** antes de sugerir mudanças
2. **Reutilize tokens do design system** — nunca escreva rgba/hex/shadow ad-hoc
3. **Implemente exatamente o que foi pedido** — sem abstrações especulativas
4. **Valide visualmente** — o objetivo é UI premium nível Apple/liquid glass

---

## Design System

### Filosofia
Este app mira UI premium estilo Apple: profundidade através de camadas de vidro, luz ambiente via glow,
movimento fluido via springs, e hierarquia visual clara. Cada superfície deve parecer material, não plana.

### Paleta de Cores (`constants/theme.ts`)

```ts
Colors = {
  // Base
  navy:       '#003478',  // Ford brand dark
  blue:       '#0142C0',  // primary accent — USE ESTE, não #0057FF
  white:      '#FFFFFF',
  surface:    '#0A0F1E',  // background raiz — USE ESTE, não #020812
  card:       '#0D1526',  // superfície elevada nível 1
  cardAlt:    '#111B33',  // superfície elevada nível 2
  muted:      '#6B7A9A',
  mutedLight: '#A0AECF',
  border:     '#1A2A4A',
  danger:     '#E53935',
  success:    '#00C853',
}
```

**Alpha variants prontas — use estas, não invente rgba:**
```ts
// Glass borders
'rgba(255,255,255,0.08)'   // border sutil (fundo escuro)
'rgba(255,255,255,0.12)'   // border padrão glass
'rgba(255,255,255,0.18)'   // border destacado / hover

// Glass fills
'rgba(255,255,255,0.04)'   // fill mínimo
'rgba(255,255,255,0.07)'   // fill suave
'rgba(255,255,255,0.12)'   // fill médio
'rgba(255,255,255,0.18)'   // fill forte

// Blue glow / ambient
'rgba(1,66,192,0.15)'      // glow fraco (Cards, backgrounds)
'rgba(1,66,192,0.30)'      // glow médio (hover states)
'rgba(1,66,192,0.50)'      // glow forte (focus rings, CTAs)

// Text dimming
'rgba(255,255,255,0.5)'    // label secundário
'rgba(255,255,255,0.35)'   // placeholder
'rgba(160,174,207,0.5)'    // input placeholder
```

---

### Blur Intensity Scale

Sempre use com `tint="dark"` e o fallback Android:

| Nível     | iOS intensity | Android fallback bg                |
|-----------|---------------|------------------------------------|
| `light`   | 20            | `rgba(13,21,38,0.75)`             |
| `medium`  | 40            | `rgba(13,21,38,0.85)`             |
| `heavy`   | 60            | `rgba(10,15,30,0.92)`             |
| `opaque`  | 80            | `rgba(10,15,30,0.97)`             |

**Tab bar** → heavy (60/0.92)  
**Modais, bottom sheets** → heavy (60/0.92)  
**Cards de conteúdo** → medium (40/0.85)  
**Inputs** → medium (40/0.85)  
**Tooltips, chips** → light (20/0.75)

---

### Shadow / Glow Tokens

**Nunca defina shadow ad-hoc.** Use um destes presets:

```ts
// Glow azul padrão (cards, botões)
shadowColor: '#0142C0',
shadowOffset: { width: 0, height: 8 },
shadowOpacity: 0.4,
shadowRadius: 20,
elevation: 12,

// Glow azul fraco (borders sutis)
shadowColor: '#0142C0',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.25,
shadowRadius: 12,
elevation: 6,

// Glow de foco (rings de input ativo)
shadowColor: '#0142C0',
shadowOffset: { width: 0, height: 0 },
shadowOpacity: 0.8,
shadowRadius: 8,
elevation: 8,

// Drop shadow neutro (elementos sobre surface)
shadowColor: '#000000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.3,
shadowRadius: 8,
elevation: 4,
```

---

### Spring Animation Presets

**Nunca use `withTiming` para interações táteis.** Reserve `withTiming` apenas para fade-in/out e transições de cor.

```ts
// Snap — botões, press feedback (resposta imediata)
Springs.snap = { damping: 15, stiffness: 300 }

// Bounce — elementos entrando na tela (fluido mas com presença)
Springs.bounce = { damping: 12, stiffness: 180 }

// Soft — retorno a posição neutra (suave, Apple-like)
Springs.soft = { damping: 18, stiffness: 160 }

// Rigid — cards 3D, objetos pesados (firme)
Springs.rigid = { damping: 20, stiffness: 220 }
```

Padrão de botão primário:
```ts
// pressIn
scale.value = withSpring(0.97, Springs.snap)
// pressOut
scale.value = withSpring(1, Springs.soft)
```

---

### Typography Completa

Adicione `letterSpacing` e `lineHeight` — são críticos para feel premium:

```ts
Typography = {
  heading:    { fontSize: 28, fontWeight: '700', color: Colors.white, letterSpacing: -0.5, lineHeight: 34 },
  subheading: { fontSize: 18, fontWeight: '600', color: Colors.white, letterSpacing: -0.3, lineHeight: 24 },
  body:       { fontSize: 15, fontWeight: '400', color: Colors.mutedLight, letterSpacing: 0, lineHeight: 22 },
  caption:    { fontSize: 12, fontWeight: '400', color: Colors.muted, letterSpacing: 0.2, lineHeight: 16 },
  label:      { fontSize: 13, fontWeight: '600', color: Colors.muted, letterSpacing: 0.5, lineHeight: 18 },
  micro:      { fontSize: 10, fontWeight: '700', color: Colors.muted, letterSpacing: 1.5, lineHeight: 14 },
  // "FORD", "YEAR", "PLATE" — use micro com uppercase
}
```

---

### Composição de Superfícies Glass

Ordem correta de camadas (de baixo para cima):

1. **Glow ambient** — `View` com `backgroundColor: 'rgba(1,66,192,0.15)'` e `borderRadius` grande, `position: absolute`
2. **BlurView** — com `overflow: 'hidden'` e `borderRadius`
3. **Border overlay** — `borderWidth: 1`, `borderColor: 'rgba(255,255,255,0.12)'`
4. **Content** — texto, ícones, etc.
5. **Glow ring de foco** (apenas para inputs) — `position: absolute`, `inset: -2`, animado com Reanimated

**Anti-padrão:** nunca coloque `backgroundColor` opaco dentro do BlurView — isso cancela o efeito blur.

---

### Radius — Regras de Aplicação

| Contexto                  | Token       | Valor |
|---------------------------|-------------|-------|
| Inputs, chips, tags       | `Radius.md` | 12px  |
| Cards internos, seções    | `Radius.lg` | 20px  |
| Modais, tab bar, overlays | `Radius.xl` | 32px  |
| Botões pill, badges       | `Radius.pill` | 100px |
| **Botões primários CTA**  | `Radius.lg` | 20px  |

`AnimatedButton` usa `Radius.md` — **incorreto**, deveria ser `Radius.lg`.

---

## Skills Disponíveis

| Skill         | Quando usar                                               |
|---------------|-----------------------------------------------------------|
| `handoff`     | Sessão ficando longa — compacta contexto                  |
| `impl-todos`  | Plano com múltiplos passos — rastreia execução            |
| `canvas-design` | Criar mockup visual antes de implementar UI complexa   |
| `caveman`     | Modo ultra-comprimido quando tokens importam              |
| `grill-me`    | Alinhar requisitos antes de implementar feature grande    |
| `simplify`    | Revisar componente recém-escrito para coesão e qualidade  |

---

## Inconsistências a Corrigir (Diagnóstico Atual)

Problemas identificados no código existente, por ordem de impacto visual:

### 🔴 Crítico (quebra a coesão)

1. **`MeshGradient` — `filter: 'blur(80px)'` não funciona no React Native nativo**
   - `filter` é CSS web-only. No iOS/Android os blobs aparecem como círculos nítidos, sem blur.
   - Arquivo: `components/mesh-gradient.tsx:75`
   - Fix: substituir por `blurRadius` do `Image`, ou usar `expo-blur` wrapping cada blob, ou aceitar que é decorativo sem blur real.

2. **`AnimatedButton` — cores hardcoded fora do tema**
   - Usa `#0057FF` e `#3385FF` em vez de `Colors.blue` / `Colors.navy`
   - Arquivo: `components/animated-button.tsx:49`
   - Fix: `colors={[Colors.blue, '#3385FF']}` — ou adicionar `Colors.blueLight = '#3385FF'` ao tema.

3. **`AnimatedButton` — `Radius.md` em botão primário**
   - CTA principal com 12px de radius parece caixa quadrada, não premium
   - Arquivo: `components/animated-button.tsx:51`
   - Fix: `borderRadius: Radius.lg` (20px).

4. **Tab bar — ícones emoji**
   - `⊞`, `🗓️`, `✦` não são premium. Emojis variam por device, sem controle de tamanho/cor.
   - Arquivo: `components/liquid-glass-tab-bar.tsx:10-14`
   - Fix: usar `@expo/vector-icons` (Ionicons ou MaterialCommunityIcons) ou SF Symbols via `expo-symbols`.

### 🟡 Moderado (inconsistência de tokens)

5. **Spring configs sem padrão**
   - `VehicleCard3D` usa `{ damping: 15, stiffness: 200 }` no restore
   - `AnimatedButton` usa `{ damping: 15, stiffness: 300 }` no pressIn e `{ damping: 12, stiffness: 200 }` no pressOut
   - Sem preset → cada componente novo inventa valores, o feel fica inconsistente
   - Fix: adicionar `Springs` como export em `constants/theme.ts`

6. **`MeshGradient` — backgroundColor `#020812` ≠ `Colors.surface` `#0A0F1E`**
   - Arquivo: `components/mesh-gradient.tsx:69`
   - Fix: `backgroundColor: Colors.surface`

7. **`VehicleCard3D` — gloss em `rgba(255,255,255,0.07)` quase invisível**
   - Arquivo: `components/vehicle-card-3d.tsx:97`
   - Fix: aumentar para `rgba(255,255,255,0.14)` para highlight visível

8. **`VehicleCard3D` — emojis de carro**
   - `🚗`, `🛻`, `🏎️` como representação visual principal — não premium
   - Fix: SVG de silhueta do veículo (já existe `CarSilhouette` em `slide-illustrations.tsx`) ou imagem vetorial por modelo

### 🟢 Menor (polish)

9. **`Typography` sem `letterSpacing` e `lineHeight`**
   - Arquivo: `constants/theme.ts:15-21`
   - Fix: aplicar valores da tabela Typography Completa acima

10. **QuickAction cards no HomeScreen sem efeito glass**
    - Usam `backgroundColor: Colors.card` opaco — deveriam ter BlurView medium
    - Arquivo: `app/(tabs)/index.tsx` (styles.actionCard)

11. **`SosModal` — ícones de ação como emoji**
    - `ActionButton` usa emoji como ícone de urgência — inconsistente com visual premium
    - Arquivo: `components/sos-modal.tsx`

12. **Blur intensity inconsistente sem documentação**
    - GlassInput: 20/40, TabBar: 40/60 — sem escala definida
    - Fix: agora documentado acima na Blur Intensity Scale

13. **`VehicleCard3D` — campo `emoji` ocupa espaço que poderia ser art**
    - `fontSize: 52` emoji como artwork principal do card de veículo
    - Arquivo: `components/vehicle-card-3d.tsx:82`
