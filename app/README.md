# RubikX Lite Builder

A visual page builder for RubikX stores. Build, edit, and publish store pages without any coding knowledge.

---

## Features

### Pages & Versions
- View all your pages on a clean dashboard
- See who last edited a page and when
- Save multiple versions of every page — never lose your work
- Roll back to any previous version instantly
- Draft/publish workflow — changes are saved as drafts until you're ready to go live
- Publish any version with one click

### Visual Editor
- Live preview — see every change instantly as you make it
- Click directly on any text to edit it inline
- Click directly on any image to swap it
- Undo and redo support
- Reset a page to blank canvas
- Desktop and mobile preview toggle

### Navbar
- Upload a logo image or use a text brand name
- Add, remove and reorder navigation links
- Sticky navbar — stays at the top as visitors scroll
- Show or hide the search bar
- Configurable search placeholder text
- Search bar position (left, center, right)
- CTA buttons — add multiple buttons with custom labels, URLs, colors, and styles (outline or filled)
- Button corner radius control
- Background color
- Text color
- Font size and font weight for links
- Link color
- Vertical and horizontal padding
- Show or hide bottom border with custom border color
- Links position (left, center, right)
- **Mega Menu** — hover dropdowns on any nav link with product groups and live product data
- **Dynamic Categories** — one toggle to automatically show your Odoo store categories as a dropdown, always up to date without re-saving

### Product Sections
- **Show 1 Product** — single product, large and prominent
- **Show 3 Products** — three products in a row
- **Show 6 Products** — six products in a grid
- **Show 4 Products Centered** — four products centered
- Search and pick exactly which products appear
- Live preview updates as you select products
- 3 card layouts — Default, Inline, Centered
- Card background color
- Card text color
- Card font size
- Card border radius (rounded corners)
- Card box shadow
- Card padding and margin
- Shop Now button — on/off toggle, custom label, background color, text color
- Card subtitle — optional short line below the price (max 50 characters)
- Section background color or background image

### Image & Content Blocks
- Single image
- 2 images side by side
- 3 images in a row
- 4 images in a grid
- 6 images in a grid
- Image with text (multiple layout options)
- Hero banner with headline, subheadline, button, and overlay
- Stats section — showcase numbers like "500+ brands served"
- Call to action — headline, description, and button (centered, left-aligned, or image variant)
- About Us — company headline, tagline, stats, and mission statement
- Contact form — name, email, phone, message, contact details, and social links

### Footer
- 3-column layout — Useful Links, About Us, Connect With Us
- Reorder columns (drag left, center, right)
- Custom link lists
- About Us text
- Contact information
- Copyright line
- Background color and text color
- Padding controls

### Text & Style Editing (click any text)
- Font size
- Font weight (light, regular, medium, bold, extra bold)
- Font family (Inter, Georgia, Courier, Arial)
- Line height and letter spacing
- Text alignment (left, center, right, justify)
- Text color
- Background color

### Themes
- **Ru1 Techwire Theme** — complete pre-built theme with navbar, hero, featured products, and footer
- Techwire navbar with search, sign in button, cart icon, and contact link
- Techwire footer with useful links, about text, and contact info

### Saving & Publishing
- Every save creates a new version — nothing is ever overwritten
- Saves record the editor's name and timestamp automatically
- Draft state by default — live site is untouched until you publish
- Publish any version to make it live

### Authentication
- Secure login with your Odoo credentials
- Only authorized users can access the builder
- Session stays active until you sign out

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm installed

### Setup Steps

#### 1. Clone the repo and checkout the branch
```bash
git clone https://github.com/rubikx-stores/rubikx-lite-builder.git
cd rubikx-lite-builder
git checkout amplify-setup
```

#### 2. Install root dependencies and build the library
```bash
npm install
npm run build:lib
```
This compiles `src/` into `dist/` — must be done before running the app.

#### 3. Install app dependencies
```bash
cd app
npm install
```

#### 4. Set up environment variables
```bash
cp .env.example .env
```
Open `.env` and fill in the values — ask your lead for the actual API keys.

#### 5. Run the dev server
```bash
npm run dev
```
Open http://localhost:3000

### Important Notes
- Every time you make changes to `src/` you must run `npm run build:lib` from the root and restart the dev server
- The `.env` file is never committed to git — ask your lead for the actual API key values
- If you see a CSS error about missing `dist/style.css` it means you haven't run `npm run build:lib` yet
- If the pages list shows no data, check that all `ODOO_*` env variables are correctly set
