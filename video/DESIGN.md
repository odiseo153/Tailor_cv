# TailorCV Cinematic Video

Design system for the TailorCV promotional video.

## Palette (Dark/Premium - Cinematic Tech)

- Background: `#0a0a0f` (deep dark with slight blue)
- Background Alt: `#12121a` (slightly lighter panels)
- Foreground: `#ffffff` (pure white for headlines)
- Foreground Secondary: `#a1a1b0` (muted gray)
- Accent Primary: `#00d4ff` (cyan - like Linear/Vercel)
- Accent Secondary: `#6366f1` (indigo - subtle)
- Accent Glow: `#00d4ff` with blur
- Success: `#10b981` (emerald)
- Warning: `#f59e0b` (amber)
- Error: `#ef4444` (red)

## Typography

- Headlines: "Geist", system-ui, -apple-system, sans-serif
- Body: "Geist", system-ui, sans-serif
- Mono: "Geist Mono", "SF Mono", monospace (for code/technical)

## Effects

- Glassmorphism: `backdrop-filter: blur(20px)` with `rgba(255,255,255,0.05)` background
- Glow: `box-shadow: 0 0 60px rgba(0,212,255,0.3)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Border Radius: 12px for cards, 8px for buttons, 24px for pills

## Animation Timing

- Fast entrance: 0.4-0.6s with `power3.out`
- Medium transitions: 0.8s with `power2.inOut`
- Scene transitions: 1.2s crossfade
- Text stagger: 0.1s between elements