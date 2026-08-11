import { FormEvent, useState } from 'react';
import useFlash from '@/plugins/useFlash';
import { Button } from '@/elements/button';
import FlashMessageRender from '@/elements/FlashMessageRender';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { Product } from '@definitions/account/billing';
import { createCheckoutSession } from '@/api/routes/account/billing/orders/process';
import { Alert } from '@/elements/alert';

interface Props {
    node: number;
    product: Product;
    vars: Map<string, string>;
    discount_code?: string | undefined;
    egg?: number;
    isBusiness: boolean;
}

export interface BillingServerVariables {
    key: string;
    value: string;
}

export default (data: Props) => {
    const [loading, setLoading] = useState(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const eggMissing = data.product.eggId === null && !data.egg;

    const handleSubmit = async (event: FormEvent) => {
        clearFlashes();
        setLoading(true);
        event.preventDefault();

        const variables: BillingServerVariables[] = Array.from(data.vars, ([key, value]) => ({ key, value }));

        createCheckoutSession(
            data.product.id,
            data.node,
            undefined,
            variables,
            data.discount_code,
            data.egg,
            data.isBusiness
        )
            .then(url => {
                window.location.assign(url);
            })
            .catch(error => clearAndAddHttpError({ key: 'account:billing:order', error }))
            .finally(() => setLoading(false));
    };

    return (
        <form onSubmit={handleSubmit}>
            <SpinnerOverlay visible={loading} />
            <FlashMessageRender byKey={'account:billing:order'} className={'mb-4'} />
            {isNaN(data.node) ? (
                <Alert type={'warning'}>A valid node must be selected to continue with your order.</Alert>
            ) : eggMissing ? (
                <Alert type={'warning'}>An egg must be selected to continue with your order.</Alert>
            ) : (
                <div className={'text-right'}>
                    <Button disabled={isNaN(data.node) || eggMissing} size={Button.Sizes.Large}>
                        Pay Now
                    </Button>
                </div>
            )}
        </form>
    );
};
