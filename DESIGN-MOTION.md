# DESIGN-MOTION.md — Animation Standard

> The craft bar for how UI motion should feel. Companion to `design.md`:
> `design.md` (+ screenshot) defines **what** the page is and **what** animates;
> this file defines **how** to animate it well.
>
> Distilled from Emil Kowalski's design-engineering philosophy — [animations.dev](https://animations.dev/).
> Use it to decide, build, and review motion. When `design.md`'s
> `## Animations & Motion` gives site evidence (durations, easings, keyframes),
> follow that evidence; use this file to fill gaps and raise quality.

---

## 1. Decision framework (answer before writing any animation)

### Should it animate at all? — by frequency

| Frequency | Decision |
| --- | --- |
| 100+/day (keyboard shortcuts, command-palette toggle) | **No animation. Ever.** |
| Tens/day (hover, list nav) | Remove or drastically reduce |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare / first-time (onboarding, feedback, celebration) | Can add delight |

**Never animate keyboard-initiated actions** — repeated hundreds of times daily; motion makes them feel slow and disconnected. (Raycast has no open/close animation — correct.)

### Why does it animate? — must have a valid purpose
Spatial consistency · state indication · explanation · feedback · preventing a jarring change.
"It looks cool" on a frequently-seen element is **not** a valid purpose. When unsure whether motion helps, the strongest move is often to delete it.

---

## 2. Easing

Decision order:
- Entering / exiting → **`ease-out`** (starts fast, feels responsive)
- Moving / morphing on screen → **`ease-in-out`**
- Hover / color change → **`ease`**
- Constant motion (marquee, progress) → **`linear`**
- Default → **`ease-out`**

**Never `ease-in` on UI** — it starts slow, delaying the exact moment the user watches most. `ease-out` at 200ms *feels* faster than `ease-in` at 200ms.

Built-in CSS easings are too weak. Use strong custom curves:

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);     /* strong ease-out for UI interactions */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* strong ease-in-out for on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer curve (Ionic) */
```

Find curves at [easing.dev](https://easing.dev/) / [easings.co](https://easings.co/) — don't hand-roll from scratch.

---

## 3. Duration

| Element | Duration |
| --- | --- |
| Button press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers | 200–500ms |
| Marketing / explanatory | Can be longer |

**Rule: UI animations stay under 300ms.** A 180ms dropdown feels more responsive than a 400ms one. Faster spinners make load *feel* faster (same actual time). Instant tooltips after the first (skip delay + animation) make a toolbar feel faster.

---

## 4. Physicality

- **Never `scale(0)`.** Start from `scale(0.9–0.97)` + `opacity: 0`. Nothing in the real world appears from nothing.
- **Button press feedback** — `transform: scale(0.97)` on `:active`, subtle (0.95–0.98). Applies to any pressable element.
  ```css
  .button { transition: transform 160ms ease-out; }
  .button:active { transform: scale(0.97); }
  ```
- **Origin-aware popovers** — popovers/dropdowns/tooltips scale from their trigger, not center:
  ```css
  .popover { transform-origin: var(--radix-popover-content-transform-origin); } /* Radix */
  .popover { transform-origin: var(--transform-origin); }                       /* Base UI */
  ```
  **Modals are exempt** — they appear centered in the viewport; keep `transform-origin: center`.

---

## 5. Interruptibility

CSS **transitions** retarget mid-animation; **keyframes** restart from zero. For anything triggered rapidly (toasts, toggles, drags), use transitions or springs.

```css
.toast { transition: transform 400ms ease; }          /* interruptible — good for dynamic UI */
@keyframes slideIn { from { transform: translateY(100%); } to { transform: translateY(0); } } /* restarts — avoid for dynamic UI */
```

Entry without JS — `@starting-style`:

```css
.toast {
  opacity: 1; transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;
  @starting-style { opacity: 0; transform: translateY(100%); }
}
```
Legacy fallback: `useEffect(() => setMounted(true), [])` + `data-mounted`.

---

## 6. Springs (dynamic / gesture motion)

Simulate physics; no fixed duration. Use for: drag with momentum, "alive" elements (Dynamic Island), interruptible gestures, decorative mouse-tracking.

```js
{ type: "spring", duration: 0.5, bounce: 0.2 }            // Apple-style — recommended
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }  // traditional physics — more control
```

Keep bounce subtle (0.1–0.3); avoid in most UI — reserve for drag-to-dismiss and playful interactions. Springs keep velocity when interrupted (keyframes restart from zero) — ideal for gestures users may reverse mid-motion. Interpolate mouse interactions with `useSpring` rather than binding value directly to mouse position (direct = artificial). Only when the motion is decorative.

---

## 7. Asymmetric enter/exit timing

Slow where the user is deciding, fast where the system responds.

```css
.overlay { transition: clip-path 200ms ease-out; }           /* release: fast */
.button:active .overlay { transition: clip-path 2s linear; } /* press: slow, deliberate */
```

Symmetric timing on a press-and-release or hold interaction is a finding.

---

## 8. Performance

- **Animate `transform` and `opacity` only** — they skip layout/paint, run on the GPU. `width`/`height`/`margin`/`padding`/`top`/`left` trigger all three rendering steps.
- **Don't drive child transforms via a CSS variable on the parent** — recalcs styles for all children. Set `transform` directly on the element.
- **Framer Motion `x`/`y`/`scale` shorthands are NOT hardware-accelerated** — main-thread rAF, drop frames under load. Use the full transform string:
  ```jsx
  <motion.div animate={{ x: 100 }} />                         // drops frames under load
  <motion.div animate={{ transform: "translateX(100px)" }} /> // hardware accelerated
  ```
- **CSS animations beat JS under load** — off main thread; rAF stutters while the browser loads/scripts/paints. CSS for predetermined motion, JS for dynamic/interruptible.
- **WAAPI** = JS control with CSS performance:
  ```js
  element.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
    { duration: 1000, fill: 'forwards', easing: 'cubic-bezier(0.77, 0, 0.175, 1)' });
  ```

---

## 9. Transforms & clip-path

- **`translate` percentages** are relative to the element's own size — `translateY(100%)` moves by its height regardless of dimensions. Prefer over hardcoded px.
- **`scale()` scales children too** (font, icons) — a feature for press feedback.
- **3D** — `rotateX/Y` + `transform-style: preserve-3d` for depth/orbit/flip without JS.
- **`clip-path: inset(t r b l)`** — each value eats in from that side. Reveal-on-scroll (`inset(0 0 100% 0)` → `inset(0 0 0 0)`), hold-to-delete overlay, seamless tab color transitions (duplicate + clip the active copy), comparison sliders.

---

## 10. Stagger

Stagger group entrances; **30–80ms** between items. Longer feels slow. Decorative — never block interaction while it plays.

```css
.item { opacity: 0; transform: translateY(8px); animation: fadeIn 300ms ease-out forwards; }
.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }
@keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
```

---

## 11. Masking imperfect crossfades

When a crossfade shows two overlapping states despite tuning easing/duration, add subtle `filter: blur(2px)` during the transition to blend them into one perceived transformation. Keep blur < 20px (heavy blur is expensive, especially Safari).

---

## 12. Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  .element { animation: fade 0.2s ease; } /* keep opacity/color, drop transform-based motion */
}
@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); } /* gate hover motion — touch fires false hovers on tap */
}
```
```jsx
const reduce = useReducedMotion();
const closedX = reduce ? 0 : '-100%';
```
Reduced motion = fewer and gentler animations, **not zero**. Keep transitions that aid comprehension; remove movement/position changes.

---

## 13. Review checklist

| Issue | Fix |
| --- | --- |
| `transition: all` | Specify exact properties: `transition: transform 200ms ease-out` |
| `scale(0)` entry | Start from `scale(0.95)` + `opacity: 0` |
| `ease-in` on UI | Switch to `ease-out` or strong custom curve |
| `transform-origin: center` on popover | Trigger location / Radix/Base UI var (modals exempt — stay centered) |
| Animation on keyboard / 100+/day action | Remove entirely |
| Duration > 300ms on UI element | Reduce to 150–250ms (or justify) |
| Hover animation, no media query | Gate behind `@media (hover: hover) and (pointer: fine)` |
| Keyframes on rapidly-triggered element | Use CSS transitions for interruptibility |
| Framer Motion `x`/`y` under load | Full `transform: "translateX()"` string |
| Symmetric enter/exit on press/hold | Make the response faster than the deliberate phase |
| Animating layout props (`width`/`height`/`margin`/`top`) | Move to `transform`/`opacity` |
| Everything appears at once | Add 30–80ms stagger |

---

## 14. Debugging (when feel is uncertain)

- **Slow motion** — bump duration 2–5× or use DevTools animation inspector. Check colors crossfade cleanly, easing doesn't stop abruptly, `transform-origin` is right, coordinated properties stay in sync.
- **Frame-by-frame** — Chrome DevTools Animations panel reveals timing drift between coordinated properties.
- **Real devices** for gestures (drawers, swipe).
- **Fresh eyes next day** — imperfections invisible during development surface later.

---

*Standard distilled from Emil Kowalski — [animations.dev](https://animations.dev/). For the full philosophy and component patterns (Sonner principles, gesture/drag mechanics, tabs/hold-to-delete patterns), see the source.*
