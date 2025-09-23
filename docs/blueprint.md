# **App Name**: GlowVita Salon

## Core Features:

- UI component library: Configurable and shared UI components package. Components must use shared themes and must be available for all the included web apps
- Redux toolkit Store: Centralized store configuration for web, CRM and admin apps, that includes reducers and RTK Query API setup.
- Turborepo Configuration: Monorepo setup configured for web, vendor CRM and admin panel apps with all required build and deployment tools.
- JWT Authentication: HTTP-only cookies strategy configured and centralized across all the web apps
- Vendor CRM: Vendor CRM to enable the vendor role of the existing authentication module
- Admin Panel: Admin panel to enable the admin role of the existing authentication module

## Style Guidelines:

- Primary color: HSL(210, 70%, 50%) - A vibrant blue to convey trust and reliability, mirroring the interconnected nature of the monorepo. Hex: #3388FF
- Background color: HSL(210, 20%, 95%) - A very light, desaturated blue provides a clean and professional backdrop. Hex: #F0F5FA
- Accent color: HSL(240, 80%, 60%) - A strong violet/purple analogous to the primary blue, intended for highlighting key actions and interactive elements. Hex: #4A00E0
- Headline font: 'Space Grotesk' (sans-serif), to provide a modern, computerized feel. Body font: 'Inter' (sans-serif), for neutral readability.
- Consistent and clear icons from a standard library (e.g., FontAwesome or Material Icons) to ensure visual unity across all applications.
- A consistent grid system across all applications to maintain a uniform structure and responsive design.
- Subtle transitions and animations (e.g., fade-in, slide-in) for a smooth user experience, applied consistently across the monorepo apps.