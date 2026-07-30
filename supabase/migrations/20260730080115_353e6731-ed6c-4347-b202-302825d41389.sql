ALTER TABLE public.partner_applications DROP CONSTRAINT IF EXISTS partner_applications_partner_type_check;
ALTER TABLE public.partner_applications ADD CONSTRAINT partner_applications_partner_type_check
CHECK (partner_type = ANY (ARRAY['club','coach','school','federation','organizer','streamer','sponsor']));