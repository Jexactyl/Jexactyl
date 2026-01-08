import { FormEvent, useState } from 'react';
import useFlash from '@/plugins/useFlash';
import { Button } from '@/elements/button';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { updateStripeIntent } from '@/api/routes/account/billing/orders/stripe';
import FlashMessageRender from '@/elements/FlashMessageRender';

export default ({
    id,
    serverId,
    intent,
    renewal,
    serverUuid,
}: {
    id?: number;
    serverId: number;
    intent: string;
    renewal?: boolean;
    serverUuid?: string;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const { clearFlashes, addFlash } = useFlash();

    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (event: FormEvent) => {
        clearFlashes('server:billing:payment');
        setLoading(true);
        event.preventDefault();

        if (!stripe || !elements) return;

        try {
            await updateStripeIntent({ id: id!, intent, serverId, renewal });

            // Build return URL with renewal and server UUID params for renewals
            let returnUrl = window.location.origin + '/account/billing/processing';
            if (renewal && serverUuid) {
                returnUrl += `?renewal=true&server_uuid=${encodeURIComponent(serverUuid)}`;
            }

            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: returnUrl,
                },
            });

            // This point will only be reached if there is an immediate error when
            // confirming the payment. Otherwise, your customer will be redirected to
            // your `return_url`. For some payment methods like iDEAL, your customer will
            // be redirected to an intermediate site first to authorize the payment, then
            // redirected to the `return_url`.
            if (error) {
                addFlash({
                    key: 'server:billing:payment',
                    type: 'error',
                    message: error.message || 'An unexpected error occurred.',
                });
                setLoading(false);
            }
        } catch (error: any) {
            addFlash({
                key: 'server:billing:payment',
                type: 'error',
                message: error.message || 'Failed to process payment.',
            });
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <SpinnerOverlay visible={loading} />
            <FlashMessageRender byKey={'server:billing:payment'} className={'mb-4'} />
            <PaymentElement />
            <div className={'text-right'}>
                <Button className={'mt-4'} size={Button.Sizes.Large}>
                    Pay Now
                </Button>
            </div>
        </form>
    );
};
