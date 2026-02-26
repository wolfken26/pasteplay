import { createClient } from '@supabase/supabase-js';

// Check for both VITE_ prefixed and standard variables (Netlify auto-connect sometimes omits VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Supabase credentials missing! Check Netlify environment variables.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

// Get current authenticated user
export const getUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
};

// Get user's plan from entitlements table
export const getUserPlan = async (userId: string): Promise<'free' | 'pro'> => {
    const { data } = await supabase
        .from('user_entitlements')
        .select('plan')
        .eq('user_id', userId)
        .single();
    return (data?.plan as 'free' | 'pro') || 'free';
};

// Get billing info (next billing date etc.)
export const getUserBilling = async (userId: string) => {
    const { data } = await supabase
        .from('user_billing')
        .select('subscription_status, current_period_end')
        .eq('user_id', userId)
        .single();
    return data;
};

// Send magic link — redirects back to the desktop app via deep link
export const sendMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: 'pasteplay://auth',
        }
    });
    return { error };
};

// Sign out
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

// Create a Stripe Checkout session (calls our Edge Function)
export const createStripeCheckout = async (email: string) => {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { email, price_id: 'price_monthly' } // replace with real Stripe price ID
    });
    return { data, error };
};

// Open Stripe Customer Portal (calls our Edge Function)
export const openBillingPortal = async () => {
    const { data, error } = await supabase.functions.invoke('create-portal');
    return { data, error };
};
