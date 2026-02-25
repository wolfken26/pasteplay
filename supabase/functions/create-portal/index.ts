// Supabase Edge Function: create-portal
// Deploys to: supabase/functions/create-portal/index.ts
// Run: supabase functions deploy create-portal
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2024-06-20',
    httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': 'https://pasteplay.app',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Get the authenticated user from the auth header
        const authHeader = req.headers.get('Authorization');
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') as string,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string,
        );

        const token = authHeader?.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) throw new Error('Unauthorized');

        // Get their Stripe customer ID from user_billing table
        const { data: billing } = await supabase
            .from('user_billing')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single();

        if (!billing?.stripe_customer_id) {
            throw new Error('No active subscription found');
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: billing.stripe_customer_id,
            return_url: `${Deno.env.get('SITE_URL')}/account`,
        });

        return new Response(
            JSON.stringify({ url: portalSession.url }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
