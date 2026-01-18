-- Add end_date column to expenses table for recurring expense end date
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS end_date TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN expenses.end_date IS 'Optional end date for recurring expenses in YYYY-MM format';
