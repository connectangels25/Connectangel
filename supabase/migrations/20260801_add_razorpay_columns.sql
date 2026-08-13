-- Add Razorpay payment tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT DEFAULT NULL;
