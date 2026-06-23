
# Nairobi Civic Issue Reporting App

This is a code bundle for the Nairobi Civic Issue Reporting App. The original project is available at https://www.figma.com/design/bpbyeaEsBQDokd2zpcEnpw/civic-project--Copy-.

This app allows Nairobi residents to report civic issues such as potholes, street light problems, water leaks, and other infrastructure concerns directly to city authorities.

## Running the code

### Quick Start (Local Development)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server with backend:**
   ```bash
   npm run dev:all
   ```

   This command starts both:
   - 🎨 **Vite dev server** (frontend) - `http://localhost:5174`
   - 🔧 **Express API server** (local backend) - `http://localhost:3000`

3. **Open your browser** to `http://localhost:5174` and sign up as a citizen to start reporting issues!

### Scripts

- `npm run dev` - Start only the Vite frontend dev server
- `npm run dev:server` - Start only the Express API server
- `npm run dev:all` - Start both frontend and backend (*recommended*)
- `npm build` - Build for production
- `npm run preview` - Preview production build

### What's Fixed ✅

The report submission issue was caused by a missing local backend server. I've added:

- **Local Express API Server** - Handles authentication and report submissions locally
- **In-Memory Storage** - Reports are stored in memory (perfect for development)
- **ML Classification Simulation** - Automatically assigns priority/severity to reports
- **Concurrently Setup** - Run frontend + backend with one command

### Architecture

- **Frontend**: Vite + React + TypeScript
- **Backend**: Express.js (local dev) or Supabase Edge Functions (production)
- **Storage**: In-memory for local dev (or Supabase for production)

### For Production (Supabase)

When ready to deploy to production, follow the [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) to:
  