-- Create articles table
CREATE TABLE public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    summary TEXT,
    is_starred BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read only their own articles
CREATE POLICY "Users can view their own articles" ON public.articles
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own articles
CREATE POLICY "Users can insert their own articles" ON public.articles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own articles
CREATE POLICY "Users can update their own articles" ON public.articles
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own articles
CREATE POLICY "Users can delete their own articles" ON public.articles
    FOR DELETE USING (auth.uid() = user_id);
