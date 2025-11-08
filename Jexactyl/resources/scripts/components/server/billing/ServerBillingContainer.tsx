import { useEffect, useState } from 'react';
import Label from '@/elements/Label';
import { Link } from 'react-router-dom';
import ContentBox from '@/elements/ContentBox';
import { ServerContext } from '@/state/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import useFlash from '@/plugins/useFlash';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { Alert } from '@/elements/alert';
import PaymentContainer from './PaymentContainer';
import { useStoreState } from '@/state/hooks';
import PageContentBlock from '@/elements/PageContentBlock';
import { format } from 'date-fns';
import { getProduct } from '@/api/routes/account/billing/products';
import { Product } from '@definitions/account/billing';

function timeUntil(targetDate: Date | string) {
    const date = targetDate instanceof Date ? targetDate : new Date(targetDate);

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();

    return {
        days: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diffMs / (1000 * 60 * 60)) % 24),
    };
}

function addDays(date: Date | string, days: number) {
    const d = date instanceof Date ? new Date(date) : new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

export default () => {
    const [product, setProduct] = useState<Product>();
    const [loading, setLoading] = useState<boolean>(true);

    const { clearFlashes } = useFlash();
    const settings = useStoreState(s => s.everest.data!.billing);
    const billingProductId = ServerContext.useStoreState(s => s.server.data!.billingProductId);
    const renewalDate = ServerContext.useStoreState(s => s.server.data!.renewalDate);

    useEffect(() => {
        clearFlashes();

        if (billingProductId) {
            getProduct(billingProductId)
                .then(data => setProduct(data))
                .then(() => setLoading(false))
                .catch(error => {
                    setLoading(false);
                    console.error(error);
                });
        }
    }, []);

    return (
        <PageContentBlock
            title={'Server Billing'}
            header
            description={'Control your billing settings for this server.'}
        >
            {!product && !loading && (
                <Alert type={'warning'} className={'mb-6'}>
                    The product package you purchase initially no longer exists, so some details may not be shown.
                </Alert>
            )}
            <div className={'grid lg:grid-cols-3 gap-4'}>
                {!renewalDate ? (
                    <Alert type={'warning'}>There is no present renewal date for your server.</Alert>
                ) : (
                    <ContentBox title={'Summary'}>
                        <SpinnerOverlay visible={loading} />
                        <div>
                            <Label>Next renewal due</Label>
                            <p className={'text-gray-400 text-sm'}>
                                {new Date(renewalDate).toLocaleDateString()}
                                {' - '}
                                {timeUntil(renewalDate).days} days, {timeUntil(renewalDate).hours} hours
                            </p>
                        </div>
                        <div className={'my-6'}>
                            <Label>Your package</Label>
                            <p className={'text-gray-400 text-sm'}>{product ? product.name : 'Unknown'}</p>
                            <p className={'text-gray-500 text-xs'}>{product && product.description}</p>
                        </div>
                        <div>
                            <Label>Plan cost</Label>
                            <div className={'flex justify-between'}>
                                <p className={'text-gray-400 text-sm'}>
                                    {settings.currency.symbol}
                                    {product ? product.price : '...'} {settings.currency.code.toUpperCase()} every 30
                                    days
                                </p>
                                <Link to={'/account/billing/orders'} className={'text-green-400 text-xs'}>
                                    View order <FontAwesomeIcon icon={faArrowRight} />
                                </Link>
                            </div>
                        </div>
                    </ContentBox>
                )}
                <ContentBox title={'Renew Server'} className={'lg:col-span-2'}>
                    <div className={'mb-4'}>
                        <p className={'text-gray-400 text-xs'}>
                            If you renew now, your server will be active for a further 30 days, making your next renewal
                            date
                            <strong className={'ml-1'}>
                                {renewalDate ? format(addDays(renewalDate, 30), 'do MMMM yyyy') : 'Unknown'}
                            </strong>
                            .
                        </p>
                    </div>
                    {!product ? (
                        <Alert type={'danger'}>
                            The product package that the server was made with no longer exists. In order to renew your
                            server, you&apos;ll need to speak to an administrator.
                        </Alert>
                    ) : (
                        <>
                            {product.price === 0 ? (
                                <>You cannot renew a free server. It will be renewed automatically.</>
                            ) : (
                                <PaymentContainer id={Number(product.id)} />
                            )}
                        </>
                    )}
                </ContentBox>
            </div>
        </PageContentBlock>
    );
};
