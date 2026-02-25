// Supabase Edge Function: stripe-webhook
// Deploys to: supabase/functions/stripe-webhook/index.ts
// Run: supabase functions deploy stripe-webhook
// In Stripe Dashboard: set webhook URL to https://<your-project>.supabase.co/functions/v1/stripe-webhook
// Events to subscribe to: checkout.session.completed, customer.subscription.deleted
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2024-06-20',
    httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
    Deno.env.get('SUPABASE_URL') as string,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string, // Service role bypasses RLS
);

Deno.serve(async (req) => {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event: Stripe.Event;

    try {
        event = await stripe.webhooks.constructEventAsync(
            body,
            signature!,
            Deno.env.get('STRIPE_WEBHOOK_SECRET') as string,
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return new Response('Webhook Error', { status: 400 });
    }

    console.log('[Webhook] Processing event:', event.type);

    // ── Payment Success: Upgrade user to Pro ──────────────────────────────
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_email || session.customer_details?.email || session.metadata?.email;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const clientReferenceId = session.client_reference_id; // This is our Supabase user_id if they were logged in

        if (!email && !clientReferenceId) {
            console.error('[Webhook] No identifier (email or client_reference_id) found in session');
            return new Response('No identifier', { status: 400 });
        }

        let userId = clientReferenceId;

        // 1. If we don't have a userId, find it by email or create a new user
        if (!userId && email) {
            const { data: users } = await supabase.auth.admin.listUsers();
            const existingUser = users?.users?.find(u => u.email === email);

            if (existingUser) {
                userId = existingUser.id;
            } else {
                // Create a new user if they don't exist
                console.log('[Webhook] Creating new user for email:', email);
                const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                    email,
                    email_confirm: true,
                    user_metadata: { source: 'stripe_checkout' }
                });

                if (createError) {
                    console.error('[Webhook] Failed to create user:', createError.message);
                    return new Response('User creation failed', { status: 500 });
                }
                userId = newUser.user.id;
            }
        }

        if (!userId) {
            console.error('[Webhook] Could not determine userId');
            return new Response('User not found', { status: 404 });
        }

        // 2. Fetch subscription details for billing date
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        // 3. Update entitlements → plan = 'pro'
        const { error: entError } = await supabase.from('user_entitlements').upsert({
            user_id: userId,
            plan: 'pro',
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        if (entError) console.error('[Webhook] Entitlements update error:', entError.message);

        // 4. Update or create billing record
        const { error: billError } = await supabase.from('user_billing').upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        if (billError) console.error('[Webhook] Billing update error:', billError.message);

        console.log(`[Webhook] Success: ${email || userId} is now Pro ✓`);
    }

    // ── Subscription Cancelled: Downgrade to Free ─────────────────────────
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripe_customer_id
        const { data: billing } = await supabase
            .from('user_billing')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single();

        if (billing?.user_id) {
            await supabase.from('user_entitlements').upsert({
                user_id: billing.user_id,
                plan: 'free',
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

            await supabase.from('user_billing').upsert({
                user_id: billing.user_id,
                subscription_status: 'cancelled',
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

            console.log(`[Webhook] Downgraded user ${billing.user_id} → Free ✓`);
        }
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
    });
});
