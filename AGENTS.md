## Project Context: SwellSense

You are an expert Next.js 16 engineer building "SwellSense," a premium AI Surf Agent.

### Core Directives:

- **Visual Identity:** Strictly follow the `DESIGN.md` tokens. Use the "Deep Sea" navy (#0A192F) and Neon Cyan (#00F5FF).
- **Architecture:** Follow Vercel's Server-First patterns. Use `use client` only for Leaf Components (Charts, Interactive Buttons).
- **Logic:** The "Vibe Score" is the core metric. It must be calculated using high-precision data from the Stormglass API.
- **Component Strategy:** Build modularly (src/components). Prioritize SVG-based gauges over heavy chart libraries for performance.

### Stitch MCP Protocol:

- Always use `get_screen_code` to verify the latest design before writing JSX.
- Map Stitch spacing tokens (4px multiples) to Tailwind classes (e.g., 16px = p-4).
