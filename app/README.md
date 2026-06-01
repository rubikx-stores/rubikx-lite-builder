# RubikX Builder — Local Setup

## Prerequisites
- Node.js 18+
- npm installed

## Setup Steps

### 1. Clone the repo and checkout the branch
```bash
git clone https://github.com/rubikx-stores/rubikx-lite-builder.git
cd rubikx-lite-builder
git checkout amplify-setup
```

### 2. Install root dependencies and build the library
```bash
npm install
npm run build:lib
```
This compiles `src/` into `dist/` — must be done before running the app.

### 3. Install app dependencies
```bash
cd app
npm install
```

### 4. Set up environment variables
```bash
cp .env.example .env
```
Open `.env` and fill in the values — ask your lead for the actual API keys.

### 5. Run the dev server
```bash
npm run dev
```
Open http://localhost:3000

## Important Notes

- Every time you make changes to `src/` you must run `npm run build:lib` from the root and restart the dev server
- The `.env` file is never committed to git — ask your lead for the actual API key values
- If you see a CSS error about missing `dist/style.css` it means you haven't run `npm run build:lib` yet
- If the pages list shows no data, check that all `ODOO_*` env variables are correctly set
