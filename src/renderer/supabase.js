import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let lastSignInTime = 0;
const RATE_LIMIT_MS = 60000; // 60 seconds

export const signInWithMagicLink = async (email) => {
    const now = Date.now();
    if (now - lastSignInTime < RATE_LIMIT_MS) {
        const remaining = Math.ceil((RATE_LIMIT_MS - (now - lastSignInTime)) / 1000);
        return { error: { message: `Please wait ${remaining} seconds before sending another email.` } };
    }

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: 'pasteplay://auth',
        }
    });

    if (!error) {
        lastSignInTime = Date.now();
    }

    return { error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

export const getUserEntitlements = async (userId) => {
    const { data, error } = await supabase
        .from('user_entitlements')
        .select('plan')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error('Error fetching entitlements:', error);
    }

    return data || { plan: 'free' };
};
