-- Create donation goals table
CREATE TABLE public.donation_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  target_amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.donation_goals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to view active goals
CREATE POLICY "Anyone can view active donation goals" 
ON public.donation_goals 
FOR SELECT 
USING (is_active = true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_donation_goals_updated_at
BEFORE UPDATE ON public.donation_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default donation goal
INSERT INTO public.donation_goals (title, description, target_amount, currency)
VALUES (
  'Support MasterChess Development', 
  'Help us reach our goal to fund new features and keep the servers running!', 
  1000, 
  'usd'
);