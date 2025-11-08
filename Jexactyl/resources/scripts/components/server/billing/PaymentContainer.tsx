import Spinner from '@/elements/Spinner';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import PaymentForm from './PaymentForm';
import { ServerContext } from '@/state/server';
import { StripeIntent } from '@definitions/account/billing';
import { getStripeIntent, getStripeKey } from '@/api/routes/account/billing/orders/stripe';

export default ({ id }: { id?: number }) => {
    const [stripe, setStripe] = useState<Stripe | null>(null);
    const [intent, setIntent] = useState<StripeIntent | null>(null);

    const serverId = ServerContext.useStoreState(state => state.server.data!.internalId);

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                try {
                    const intentData = await getStripeIntent(id);
                    setIntent({ id: intentData.id, secret: intentData.secret });

                    const stripePublicKey = await getStripeKey(id);
                    const stripeInstance = await loadStripe(stripePublicKey.key);
                    setStripe(stripeInstance);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };

        fetchData();
    }, [id]);

    if (!id || !intent || !stripe) return <Spinner size={'large'} centered />;

    const options = {
        clientSecret: intent.secret,
        appearance: {
            theme: 'night',
            variables: {
                colorText: '#ffffff',
            },
        },
    };

    return (
        <>
            {/* @ts-expect-error this is fine, stripe library is just weird */}
            <Elements stripe={stripe} options={options}>
                <PaymentForm id={id} serverId={Number(serverId)} intent={intent.id} renewal />
            </Elements>
        </>
    );
};
