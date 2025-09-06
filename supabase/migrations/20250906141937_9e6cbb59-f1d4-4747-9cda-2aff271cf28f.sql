-- Add missing columns to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS age INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS contact TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'Iniciante' CHECK (level IN ('Iniciante', 'Intermediário', 'Avançado')),
ADD COLUMN IF NOT EXISTS total_classes INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_classes INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_class_date DATE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Make user_id not nullable after adding it
ALTER TABLE public.students ALTER COLUMN user_id SET NOT NULL;

-- Enable Row Level Security if not already enabled
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own students" ON public.students;
DROP POLICY IF EXISTS "Users can create their own students" ON public.students;
DROP POLICY IF EXISTS "Users can update their own students" ON public.students;
DROP POLICY IF EXISTS "Users can delete their own students" ON public.students;

-- Create policies for user access
CREATE POLICY "Users can view their own students" 
ON public.students 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own students" 
ON public.students 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own students" 
ON public.students 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own students" 
ON public.students 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();