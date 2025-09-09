-- Add next_lesson_topic column to students table
ALTER TABLE public.students 
ADD COLUMN next_lesson_topic TEXT;