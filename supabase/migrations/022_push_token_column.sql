-- Store Expo push token per user so the backend can send push notifications
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS push_token text;
