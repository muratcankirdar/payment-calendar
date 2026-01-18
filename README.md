# Payment Calendar

A modern, responsive payment tracker built with React and Supabase. Never miss a bill again.

## Features

- **Calendar View** - Visualize all your expenses on a monthly calendar
- **Recurring Expenses** - Set monthly bills with optional end dates
- **Partial Payments** - Track progress on expenses you're paying off over time
- **Multi-Currency** - Support for TRY, USD, and EUR
- **Pay Day Tracking** - Mark your pay days to plan ahead
- **Cloud Sync** - Your data syncs across devices with Supabase
- **Dark Mode** - Easy on the eyes, day or night

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth + PostgreSQL)
- Vite
- Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account

### Setup

1. Clone the repo
   ```bash
   git clone https://github.com/yourusername/payment-calendar.git
   cd payment-calendar
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up your Supabase project
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the scripts in order:
     - `db/001_create_tables.sql`
     - `db/002_enable_rls.sql`
     - `db/003_create_policies.sql`
     - `db/004_add_end_date.sql`

4. Configure environment variables
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your Supabase project URL and anon key (found in Project Settings > API)

5. Start the dev server
   ```bash
   npm run dev
   ```

## License

MIT
