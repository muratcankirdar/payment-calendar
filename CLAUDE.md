# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - TypeScript type-check + production build
- `npm run lint` - ESLint check
- `npm run preview` - Preview production build

No test framework is currently configured.

## Architecture

This is a payment tracking app built with React 18, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

### Data Flow

1. **AuthContext** (`src/contexts/AuthContext.tsx`) - Wraps the app, manages Supabase auth state
2. **Custom hooks** fetch data when user is authenticated:
   - `useExpenses` - CRUD for expenses
   - `useMonthlyPayments` - Tracks partial payments for recurring expenses
   - `usePaydays` - User's pay day dates
3. **Zustand store** (`src/store/useStore.ts`) - Client-only theme preference (persists to localStorage)

### Payment Model

- **One-time expenses**: Date stored as ISO string `YYYY-MM-DD`
- **Recurring expenses**: Day stored as `recurring-DD` format with optional `endDate` (`YYYY-MM`)
- **Partial payments**: Tracked in `monthly_payments` table with key format `{expenseId}-{monthKey}`

### Database

SQL migrations are in `db/` folder (run in order: 001 → 004). Tables:
- `expenses` - One-time and recurring expenses (TRY/USD/EUR, 4 categories)
- `monthly_payments` - Partial payment tracking per month
- `paydays` - Pay day dates per user

All tables have Row-Level Security enabled - users can only access their own data.

### Key Files

- `src/types.ts` - Core types (Expense, Currency, PayDay) and helper functions
- `src/lib/supabase.ts` - Supabase client + DB types (DbExpense, DbMonthlyPayment, DbPayday)
- `src/App.tsx` - Main layout with calendar + summary sidebar
- `src/components/Calendar.tsx` - Month view with expense rendering
- `src/components/ExpenseForm.tsx` - Add/edit expense dialog

### Environment

Requires `.env` file with:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
