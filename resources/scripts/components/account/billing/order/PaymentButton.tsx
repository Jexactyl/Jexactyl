import { FormEvent, useState } from 'react';
import useFlash from '@/plugins/useFlash';
import { Button } from '@/elements/button';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { Product, StripeIntent } from '@definitions/account/billing';
import { updateStripeIntent } from '@/api/routes/account/billing/orders/stripe';

interface Props {
    selectedNode?: number;
    product: Product;
    vars: Map<string, string>;
    intent: StripeIntent;
}

export default (data: Props) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const handleSubmit = async (event: FormEvent) => {
        clearFlashes();
        setLoading(true);
        event.preventDefault();

        if (!stripe || !elements || !data.product || !data.selectedNode) return;

        const variables = Array.from(data.vars, ([key, value]) => ({ key, value }));

        try {
            await updateStripeIntent({
                id: Number(data.product.id),
                intent: data.intent.id,
                node_id: data.selectedNode!,
                vars: variables,
            });

            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + '/account/billing/processing',
                },
            });

            // This point will only be reached if there is an immediate error when
            // confirming the payment. Otherwise, your customer will be redirected to
            // your `return_url`. For some payment methods like iDEAL, your customer will
            // be redirected to an intermediate site first to authorize the payment, then
            // redirected to the `return_url`.
            if (error) {
                clearAndAddHttpError({
                    key: 'account:billing:order',
                    error: { message: error.message || 'An unexpected error occurred.' },
                });
                setLoading(false);
            }
        } catch (error: any) {
            clearAndAddHttpError({ key: 'account:billing:order', error });
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <SpinnerOverlay visible={loading} />
            <FlashMessageRender byKey={'account:billing:order'} className={'mb-4'} />
            <div className={'text-right'}>
                <Button disabled={!data.selectedNode} className={'mt-4'} size={Button.Sizes.Large}>
                    Pay Now
                </Button>
            </div>
        </form>
    );
};
