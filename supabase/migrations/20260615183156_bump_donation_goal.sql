-- Raise the donation goal to a meaningful target ($50,000) and refresh title.
UPDATE public.donation_goals
SET target_amount = 5000000,
    title = 'Help MasterChess reach $50,000',
    description = 'Fund servers, new features, tournaments and keep MasterChess 100% free & ad-free for everyone.',
    updated_at = now()
WHERE is_active = true;
