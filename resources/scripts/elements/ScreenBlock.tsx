import PageContentBlock from '@/elements/PageContentBlock';
import { ArrowLeftIcon, RefreshIcon } from '@heroicons/react/outline';
import styled, { keyframes } from 'styled-components';
import tw from 'twin.macro';
import { Button } from '@/elements/button';
import NotFoundSvg from '@/assets/images/not_found.svg';
import ServerErrorSvg from '@/assets/images/server_error.svg';
import { useStoreState } from '@/state/hooks';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Spinner from './Spinner';
import { getProduct } from '@/api/routes/account/billing/products';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from './FlashMessageRender';
import ServerPaymentButton from '@/components/server/billing/ServerPaymentButton';
import { Product } from '@/api/definitions/account/billing';
import { processFreeCheckoutSession } from '@/api/routes/account/billing/orders/process';

interface BaseProps {
    title: string;
    image: string;
    message: string;
    onRetry?: () => void;
    onBack?: () => void;
}

interface PropsWithRetry extends BaseProps {
    onRetry?: () => void;
    onBack?: never;
}

interface PropsWithBack extends BaseProps {
    onBack?: () => void;
    onRetry?: never;
}

export type ScreenBlockProps = PropsWithBack | PropsWithRetry;

const spin = keyframes`
    to { transform: rotate(360deg) }
`;

const ActionButton = styled(Button)`
    ${tw`rounded-full w-8 h-8 flex items-center justify-center p-0 shadow-md transition-transform duration-200 hover:scale-110`};

    &.hover\\:spin:hover {
        animation: ${spin} 2s linear infinite;
    }
`;

const ScreenBlock = ({ title, image, message, onBack, onRetry }: ScreenBlockProps) => {
    const { secondary } = useStoreState(state => state.theme.data!.colors);

    return (
        <PageContentBlock>
            <div css={tw`flex justify-center`}>
                <div
                    css={tw`w-full sm:w-3/4 md:w-1/2 p-12 md:p-20 rounded-2xl shadow-xl ring-1 ring-white/5 text-center relative`}
                    style={{ backgroundColor: secondary }}
                >
                    {(typeof onBack === 'function' || typeof onRetry === 'function') && (
                        <div css={tw`absolute left-0 top-0 ml-4 mt-4`}>
                            <ActionButton
                                onClick={() => (onRetry ? onRetry() : onBack ? onBack() : null)}
                                className={onRetry ? 'hover:spin' : undefined}
                            >
                                {onRetry ? <RefreshIcon className={'w-4 h-4'} /> : <ArrowLeftIcon className={'w-4 h-4'} />}
                            </ActionButton>
                        </div>
                    )}
                    <img src={image} css={tw`w-2/3 h-auto select-none mx-auto`} />
                    <h2 css={tw`mt-10 text-white font-bold text-4xl`}>{title}</h2>
                    <p css={tw`text-sm text-neutral-400 mt-2`}>{message}</p>
                </div>
            </div>
        </PageContentBlock>
    );
};

type ServerErrorProps = (Omit<PropsWithBack, 'image' | 'title'> | Omit<PropsWithRetry, 'image' | 'title'>) & {
    title?: string;
};

const ServerError = ({ title, ...props }: ServerErrorProps) => (
    <ScreenBlock title={title || 'Something went wrong'} image={ServerErrorSvg} {...props} />
);

const NotFound = ({ title, message, onBack }: Partial<Pick<ScreenBlockProps, 'title' | 'message' | 'onBack'>>) => (
    <ScreenBlock
        title={title || '404'}
        image={NotFoundSvg}
        message={message || 'The requested resource was not found.'}
        onBack={onBack}
    />
);

const Suspended = ({
    date,
    id,
    serverId,
    serverUuid,
}: {
    date: Date;
    id?: number;
    serverId?: number;
    serverUuid?: string;
}) => {
    const [product, setProduct] = useState<Product>();
    const [renewing, setRenewing] = useState<boolean>(false);

    const navigate = useNavigate();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const currency = useStoreState(state => state.everest.data!.billing.currency.symbol);
    const { secondary } = useStoreState(state => state.theme.data!.colors);
    const settings = useStoreState(state => state.everest.data!.billing);

    useEffect(() => {
        if (id) {
            getProduct(id)
                .then(data => setProduct(data))
                .catch(error => {
                    console.error(error);
                });
        }
    }, []);

    const handleFreeRenewal = () => {
        if (!product || !id || !serverId || !serverUuid) return;

        setRenewing(true);
        clearFlashes('suspended:billing');

        processFreeCheckoutSession(product.id, undefined, undefined, serverId)
            .then(() => {
                // Redirect to server overview after successful renewal
                navigate(`/server/${serverUuid}`);
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'suspended:billing', error });
                setRenewing(false);
            });
    };

    if (!product) return <Spinner centered />;

    const isFree = product.price === 0;

    const suspensionThreshold = isFree
        ? settings.renewal?.free_suspension_days || 7
        : settings.renewal?.paid_suspension_days || 30;

    const now = new Date();
    const daysOverdue = Math.max(0, Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)));
    const isLongOverdue = daysOverdue > suspensionThreshold;

    return (
        <PageContentBlock>
            <div css={tw`flex justify-center`}>
                <div
                    css={tw`w-full sm:w-3/4 md:w-1/2 p-12 md:p-20 rounded-2xl shadow-xl ring-1 ring-white/5 text-left relative`}
                    style={{ backgroundColor: secondary }}
                >
                    <div css={tw`absolute left-0 top-0 ml-4 mt-4`}>
                        <ActionButton onClick={() => navigate('/')}>
                            <ArrowLeftIcon className={'w-4 h-4'} />
                        </ActionButton>
                    </div>
                    <h2 css={tw`text-white font-bold text-4xl`}>{isFree ? 'Suspended' : 'Suspended - No Payment'}</h2>
                    <p css={tw`text-sm text-neutral-400 mt-2`}>
                        {isFree ? (
                            <>
                                {isLongOverdue ? (
                                    <>
                                        Your free server has been suspended for more than {suspensionThreshold} days due
                                        to non-renewal.{' '}
                                        <span className={'font-bold text-red-400'}>
                                            Please create a support ticket to restore access.
                                        </span>{' '}
                                        Self-service renewal is no longer available after {suspensionThreshold} days.
                                    </>
                                ) : (
                                    <>
                                        Your free server has been suspended because the renewal date has passed. Please
                                        renew to restore access.
                                        <div className={'mt-2 text-yellow-400 font-semibold'}>
                                            Days overdue: {daysOverdue}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {isLongOverdue ? (
                                    <>
                                        Your server has been suspended for more than {suspensionThreshold} days due to
                                        non-payment.{' '}
                                        <span className={'font-bold text-red-400'}>
                                            Please create a support ticket to restore access.
                                        </span>{' '}
                                        Self-service payment is no longer available after {suspensionThreshold} days.
                                    </>
                                ) : (
                                    <>
                                        Your server has been suspended due to a lack of payment. Please pay to restore
                                        access.
                                        <div className={'mt-2 text-gray-300 font-semibold'}>
                                            Your outstanding balance is:
                                            <span className={'text-white ml-2 font-bold'}>
                                                {currency}
                                                {product.price}
                                            </span>
                                        </div>
                                        <div className={'mt-2 text-yellow-400 font-semibold'}>
                                            Days overdue: {daysOverdue}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </p>
                    <FlashMessageRender byKey={'suspended:billing'} className={'mt-4'} />
                    <div className={'mt-6'}>
                        {isLongOverdue ? (
                            <div css={tw`text-center p-4 bg-red-900/30 rounded border border-red-500`}>
                                <p css={tw`text-red-300 font-semibold`}>
                                    Self-service renewal/payment is no longer available. Please create a support ticket
                                    to restore your server.
                                </p>
                            </div>
                        ) : (
                            <>
                                {isFree ? (
                                    <Button onClick={handleFreeRenewal} disabled={renewing} size={Button.Sizes.Large}>
                                        {renewing ? 'Renewing...' : 'Renew Free Server'}
                                    </Button>
                                ) : (
                                    <ServerPaymentButton product={product} />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </PageContentBlock>
    );
};

export { ServerError, NotFound, Suspended };
export default ScreenBlock;
