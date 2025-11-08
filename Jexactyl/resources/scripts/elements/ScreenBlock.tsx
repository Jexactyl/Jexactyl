import PageContentBlock from '@/elements/PageContentBlock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import styled, { keyframes } from 'styled-components';
import tw from 'twin.macro';
import { Button } from '@/elements/button';
import NotFoundSvg from '@/assets/images/not_found.svg';
import ServerErrorSvg from '@/assets/images/server_error.svg';
import { useStoreState } from '@/state/hooks';
import { useNavigate } from 'react-router-dom';
import PaymentContainer from '@server/billing/PaymentContainer';
import { useState, useEffect } from 'react';
import Spinner from './Spinner';
import { getProduct, Product } from '@/api/routes/account/billing/products';

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
    ${tw`rounded-full w-8 h-8 flex items-center justify-center p-0`};

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
                    css={tw`w-full sm:w-3/4 md:w-1/2 p-12 md:p-20 rounded-lg shadow-lg text-center relative`}
                    style={{ backgroundColor: secondary }}
                >
                    {(typeof onBack === 'function' || typeof onRetry === 'function') && (
                        <div css={tw`absolute left-0 top-0 ml-4 mt-4`}>
                            <ActionButton
                                onClick={() => (onRetry ? onRetry() : onBack ? onBack() : null)}
                                className={onRetry ? 'hover:spin' : undefined}
                            >
                                <FontAwesomeIcon icon={onRetry ? faSyncAlt : faArrowLeft} />
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

const Suspended = ({ date, id }: { date: Date; id?: number }) => {
    const [product, setProduct] = useState<Product>();

    const navigate = useNavigate();
    const currency = useStoreState(state => state.everest.data!.billing.currency.symbol);
    const { secondary } = useStoreState(state => state.theme.data!.colors);

    useEffect(() => {
        if (id) {
            getProduct(id)
                .then(data => setProduct(data))
                .catch(error => {
                    console.error(error);
                });
        }
    }, []);

    if (!product) return <Spinner centered />;

    return (
        <PageContentBlock>
            <div css={tw`flex justify-center`}>
                <div
                    css={tw`w-full sm:w-3/4 md:w-1/2 p-12 md:p-20 rounded-lg shadow-lg text-left relative`}
                    style={{ backgroundColor: secondary }}
                >
                    <div css={tw`absolute left-0 top-0 ml-4 mt-4`}>
                        <ActionButton onClick={() => navigate('/')}>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </ActionButton>
                    </div>
                    <h2 css={tw`text-white font-bold text-4xl`}>Suspended - No Payment</h2>
                    <p css={tw`text-sm text-neutral-400 mt-2`}>
                        Your server has been suspended due to a lack of payment. Your server will be deleted{' '}
                        <span className={'font-bold'}>on {date.toDateString()}</span>
                        if you do not choose to pay the monthly cost for your server.
                        <div className={'mt-2 text-gray-300 font-semibold'}>
                            Your outstanding balance is:
                            <span className={'text-white ml-2 font-bold'}>
                                {currency}
                                {product.price}
                            </span>
                        </div>
                    </p>
                    <div className={'mt-6'}>
                        <PaymentContainer id={Number(product.id)} />
                    </div>
                </div>
            </div>
        </PageContentBlock>
    );
};

export { ServerError, NotFound, Suspended };
export default ScreenBlock;
