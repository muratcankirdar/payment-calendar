-- Policies for expenses table
-- Users can only view their own expenses
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own expenses
CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own expenses
CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own expenses
CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for monthly_payments table
-- Users can only view their own monthly payments
CREATE POLICY "Users can view own monthly_payments"
  ON monthly_payments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own monthly payments
CREATE POLICY "Users can insert own monthly_payments"
  ON monthly_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own monthly payments
CREATE POLICY "Users can update own monthly_payments"
  ON monthly_payments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own monthly payments
CREATE POLICY "Users can delete own monthly_payments"
  ON monthly_payments FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for paydays table
-- Users can only view their own paydays
CREATE POLICY "Users can view own paydays"
  ON paydays FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own paydays
CREATE POLICY "Users can insert own paydays"
  ON paydays FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own paydays
CREATE POLICY "Users can update own paydays"
  ON paydays FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own paydays
CREATE POLICY "Users can delete own paydays"
  ON paydays FOR DELETE
  USING (auth.uid() = user_id);
