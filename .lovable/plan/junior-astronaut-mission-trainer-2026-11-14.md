# Junior Astronaut Mission Trainer

Build a playable lunar outpost simulation on the home screen for young learners.

## Experience
- Start with a short, approachable mission briefing and a six-sol lunar survival challenge.
- Let players allocate a limited supply budget across life support, radiation shielding, power, and food production before each sol.
- Show live system status, crew needs, supply use, and clear consequences after advancing a sol; include event cards that expose engineering trade-offs.
- End with a mission outcome and a concise explanation of what drove success or failure, with a restart option.
- Keep the interaction self-contained in the browser; no accounts or persistent storage are needed.

## Design
- Create an immersive, polished mission-control interface suitable for elementary and middle-school learners, with a lunar landscape and legible controls across mobile and desktop.
- Define the color, typography, and component styling through the existing semantic design tokens in `src/styles.css`.

## Technical details
- Replace the `/` placeholder in `src/routes/index.tsx`; add route-specific title and social metadata.
- Keep game state and rules in focused frontend code, and add small tests for concrete mission rules and outcome conditions.
- Update root metadata to remove template branding while retaining shared shell behavior.
