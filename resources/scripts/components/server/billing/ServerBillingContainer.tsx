import { useEffect, useState } from 'react';
import Label from '@/elements/Label';
import { Link, useNavigate } from 'react-router-dom';
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
import { renewFreeServer } from '@/api/routes/account/billing/orders/process';
import { Button } from '@/elements/button';
import FlashMessageRender from '@/elements/FlashMessageRender';

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
    const [renewing, setRenewing] = useState<boolean>(false);

    const navigate = useNavigate();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const settings = useStoreState(s => s.everest.data!.billing);
    const serverUuid = ServerContext.useStoreState(s => s.server.data!.uuid);
    const serverId = ServerContext.useStoreState(s => s.server.data!.internalId);
    const billingProductId = ServerContext.useStoreState(s => s.server.data!.billingProductId);
    const renewalDate = ServerContext.useStoreState(s => s.server.data!.renewalDate);

    // Get configurable renewal settings
    const renewalDays = settings.renewal?.days || 30;
    const freeRenewalDays = settings.renewal?.free_renewal_days || 30;
    const freeGraceDays = settings.renewal?.free_suspension_days || 7;
    const suspensionThreshold = settings.renewal?.suspension_threshold || 7;

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

    const handleFreeRenewal = () => {
        if (!product || !billingProductId) return;

        setRenewing(true);
        clearFlashes('server:billing');

        renewFreeServer(billingProductId, serverId)
            .then(() => {
                // Redirect to server overview after successful renewal
                navigate(`/server/${serverUuid}`);
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'server:billing', error });
                setRenewing(false);
            });
    };

    // Calculate days remaining until renewal (can be negative if overdue)
    const daysRemaining = renewalDate ? timeUntil(renewalDate).days : 0;
    const daysOverdue = daysRemaining < 0 ? Math.abs(daysRemaining) : 0;
    
    // Free servers can only be renewed if:
    // 1. They're within the threshold period before renewal (e.g., 7 days or less and not yet overdue), OR
    // 2. They're overdue but still within the grace period
    const canRenew = (daysRemaining <= suspensionThreshold && daysRemaining > 0) || (daysRemaining <= 0 && daysOverdue <= freeGraceDays);

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
                                    {product ? product.price : '...'} {settings.currency.code.toUpperCase()} every{' '}
                                    {renewalDays} days
                                </p>
                                <Link to={'/account/billing/orders'} className={'text-green-400 text-xs'}>
                                    View order <FontAwesomeIcon icon={faArrowRight} />
                                </Link>
                            </div>
                        </div>
                    </ContentBox>
                )}
                <ContentBox title={'Renew Server'} className={'lg:col-span-2'}>
                    <FlashMessageRender byKey={'server:billing'} className={'mb-4'} />
                    {!product ? (
                        <Alert type={'danger'}>
                            The product package that the server was made with no longer exists. In order to renew your
                            server, you&apos;ll need to speak to an administrator.
                        </Alert>
                    ) : (
                        <>
                            {product.price === 0 ? (
                                <div>
                                    <p className={'text-gray-400 text-sm mb-4'}>
                                        This is a free server. You can renew it for another {freeRenewalDays} days starting {suspensionThreshold} days before it expires, giving you time to renew before expiration. You can also renew within the {freeGraceDays}-day grace period after expiration.
                                    </p>
                                    {daysOverdue > freeGraceDays ? (
                                        <Alert type={'danger'}>
                                            This server has been overdue for more than {freeGraceDays} days and can no longer be renewed through self-service. Please contact support for assistance.
                                        </Alert>
                                    ) : daysRemaining > suspensionThreshold ? (
                                        <Alert type={'info'}>
                                            You still have {daysRemaining} days before your server expires. The renew button will become available {suspensionThreshold} days before expiration, allowing you to renew in advance.
                                        </Alert>
                                    ) : (
                                        <Button
                                            onClick={handleFreeRenewal}
                                            disabled={renewing}
                                            size={Button.Sizes.Large}
                                        >
                                            {renewing ? 'Renewing...' : 'Renew Server'}
                                        </Button>
                                    )}
                                </div>
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
