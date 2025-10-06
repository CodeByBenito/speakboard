-- Create class_history table to track all classes
CREATE TABLE IF NOT EXISTS public.class_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id bigint NOT NULL,
  class_date timestamp with time zone NOT NULL,
  topic text,
  notes text,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- Create payment_history table to track all payments
CREATE TABLE IF NOT EXISTS public.payment_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id bigint NOT NULL,
  amount numeric NOT NULL,
  payment_date timestamp with time zone NOT NULL,
  due_date date,
  status text NOT NULL DEFAULT 'paid',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.class_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for class_history
CREATE POLICY "Users can view their own class history"
ON public.class_history
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own class history"
ON public.class_history
FOR INSERT
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own class history"
ON public.class_history
FOR UPDATE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own class history"
ON public.class_history
FOR DELETE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for payment_history
CREATE POLICY "Users can view their own payment history"
ON public.payment_history
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own payment history"
ON public.payment_history
FOR INSERT
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own payment history"
ON public.payment_history
FOR UPDATE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own payment history"
ON public.payment_history
FOR DELETE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_class_history_student_id ON public.class_history(student_id);
CREATE INDEX idx_class_history_user_id ON public.class_history(user_id);
CREATE INDEX idx_payment_history_student_id ON public.payment_history(student_id);
CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);