import Spinner from '@/elements/Spinner';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStoreState } from '@/state/hooks';
import NodeBox from '@account/billing/order/NodeBox';
import PageContentBlock from '@/elements/PageContentBlock';
import VariableBox from '@account/billing/order/VariableBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faArchive,
    faCreditCard,
    faDatabase,
    faEthernet,
    faExternalLinkAlt,
    faHdd,
    faIdBadge,
    faMemory,
    faMicrochip,
} from '@fortawesome/free-solid-svg-icons';
import { Alert } from '@/elements/alert';
import useFlash from '@/plugins/useFlash';
import PaymentButton from './PaymentButton';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { EggVariable } from '@definitions/server';
import { Button } from '@/elements/button';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { Product, StripeIntent, type Node } from '@definitions/account/billing';
import { processUnpaidOrder } from '@/api/routes/account/billing/orders/process';
import { getProduct, getProductVariables, getViableNodes } from '@/api/routes/account/billing/products';
import { getStripeIntent, getStripeKey } from '@/api/routes/account/billing/orders/stripe';
import TitledGreyBox from '@/elements/TitledGreyBox';
import AdminCheckbox from '@/elements/AdminCheckbox';

const LimitBox = ({ icon, content }: { icon: IconDefinition; content: string }) => {
    return (
        <div className={'font-semibold text-gray-400 my-1'}>
            <FontAwesomeIcon icon={icon} className={'w-4 h-4 inline-flex mr-2 '} />
            {content}
        </div>
    );
};

export default () => {
    const params = useParams<'id'>();

    const vars = new Map<string, string>();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const navigate = useNavigate();

    const billing = useStoreState(state => state.everest.data!.billing);

    const [stripe, setStripe] = useState<Stripe | null>(null);
    const [intent, setIntent] = useState<StripeIntent | null>(null);
    const [nodes, setNodes] = useState<Node[] | undefined>();
    const [selectedNode, setSelectedNode] = useState<number>(0);
    const [product, setProduct] = useState<Product | undefined>();
    const [eggs, setEggs] = useState<EggVariable[] | undefined>();

    const [termsAgreed, setTermsAgreed] = useState<boolean>(false);
    const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(false);

    const { colors } = useStoreState(state => state.theme.data!);

    const createFree = () => {
        if (product) {
            processUnpaidOrder(product.id, selectedNode)
                .then(() => navigate('/'))
                .catch(error => clearAndAddHttpError({ key: 'account:billing:order', error }));
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch product details
                const productData = await getProduct(Number(params.id));
                setProduct(productData);

                // Fetch nodes
                const nodesData = await getViableNodes(productData.id);
                setNodes(nodesData);
                setSelectedNode(Number(nodesData[0]?.id) ?? 0);

                if (productData.price !== 0) {
                    // Fetch payment intent
                    const intentData = await getStripeIntent(Number(params.id));
                    setIntent({ id: intentData.id, secret: intentData.secret });

                    // Fetch Stripe public key and initialize Stripe
                    const stripePublicKey = await getStripeKey(Number(params.id));
                    const stripeInstance = await loadStripe(stripePublicKey.key);
                    setStripe(stripeInstance);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [params.id]);

    useEffect(() => {
        clearFlashes();

        if (!product || eggs) return;

        // Fetch product variables (egg data)
        getProductVariables(Number(product.eggId))
            .then(data => setEggs(data))
            .catch(error => console.error(error));
    }, [product]);

    if (!product) return <Spinner centered />;
    if (product.price !== 0 && (!intent || !stripe)) return <Spinner centered />;

    const options = {
        clientSecret: intent?.secret,
        appearance: {
            theme: 'night',
            variables: {
                colorText: '#ffffff',
            },
        },
    };

    return (
        <PageContentBlock title={'Your Order'}>
            <FlashMessageRender byKey={'account:billing:order'} className={'mb-4'} />
            {/* @ts-expect-error this is fine, stripe library is just weird */}
            <Elements stripe={stripe} options={options}>
                <div className={'text-3xl lg:text-5xl font-bold mt-8 mb-12'}>
                    Your Order
                    <p className={'text-gray-400 font-normal text-sm mt-1'}>
                        Customize your selected plan and submit a payment.
                    </p>
                </div>
                <div className={'grid lg:grid-cols-8 gap-4 lg:gap-12'}>
                    <div className={'lg:border-r-4 border-gray-500 lg:col-span-2'}>
                        <p className={'text-2xl text-gray-300 my-4 font-bold'}>
                            Selected Plan
                            {product.icon && <img src={product.icon} className={'w-8 h-8 ml-2 inline-flex'} />}
                        </p>
                        <LimitBox icon={faIdBadge} content={product.name} />
                        <div className={'font-semibold text-gray-400 text-lg my-1'}>
                            <FontAwesomeIcon icon={faCreditCard} className={'w-4 h-4 inline-flex mr-2 '} />
                            <span style={{ color: colors.primary }} className={'mr-1'}>
                                ${product.price}
                            </span>
                            <span className={'text-sm'}>/ mo</span>
                        </div>
                        <div className={'h-0.5 my-4 bg-gray-600 mr-8 rounded-full'} />
                        <LimitBox icon={faMicrochip} content={`${product.limits.cpu}% CPU`} />
                        <LimitBox icon={faMemory} content={`${(product.limits.memory / 1024).toFixed(1)} GiB Memory`} />
                        <LimitBox icon={faHdd} content={`${(product.limits.disk / 1024).toFixed(1)} GiB Disk`} />
                        <div className={'h-0.5 my-4 bg-gray-600 mr-8 rounded-full'} />
                        <LimitBox icon={faArchive} content={`${product.limits.backup} Backup Slots`} />
                        <LimitBox icon={faDatabase} content={`${product.limits.database} Database Slots`} />
                        <LimitBox icon={faEthernet} content={`${product.limits.allocation} Network Ports`} />
                    </div>
                    <div className={'lg:col-span-6'}>
                        <div>
                            <div className={'my-10'}>
                                <div className={'text-xl lg:text-3xl font-semibold mb-4'}>
                                    Choose a location
                                    <p className={'text-gray-400 font-normal text-sm mt-1'}>
                                        Select a location from our list to deploy your server to.
                                    </p>
                                </div>
                                <div className={'grid lg:grid-cols-2 gap-4'}>
                                    {(!nodes || nodes.length < 1) && (
                                        <Alert type={'danger'} className={'col-span-2'}>
                                            There are no nodes available for deployment. Please contact an
                                            administrator.
                                        </Alert>
                                    )}
                                    {nodes?.map(node => (
                                        <NodeBox
                                            node={node}
                                            key={node.id}
                                            selected={selectedNode}
                                            setSelected={setSelectedNode}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className={'h-px bg-gray-700 rounded-full'} />
                            {eggs && eggs.length > 1 && (
                                <>
                                    <div className={'my-10'}>
                                        <div className={'text-xl lg:text-3xl font-semibold mb-4'}>
                                            Plan Variables
                                            <p className={'text-gray-400 font-normal text-sm mt-1'}>
                                                Modify your server variables before your server is even created for ease
                                                of use.
                                            </p>
                                        </div>
                                        <div className={'grid lg:grid-cols-2 gap-4'}>
                                            {eggs?.map(variable => (
                                                <div key={variable.envVariable}>
                                                    {variable.isEditable && (
                                                        <VariableBox variable={variable} vars={vars} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={'h-px bg-gray-700 rounded-full'} />
                                </>
                            )}
                            <div className={'my-10'}>
                                <div className={'text-xl lg:text-3xl font-semibold mb-4'}>
                                    Legal Documents
                                    <p className={'text-gray-400 font-normal text-sm mt-1'}>
                                        Agree and sign the relevant legal documents for your new server.
                                    </p>
                                </div>
                                <div className={'grid lg:grid-cols-2 gap-4'}>
                                    <TitledGreyBox title={'Terms of Service agreement'} className={'relative'}>
                                        {!termsAgreed ? (
                                            <>
                                                Click the checkbox to agree to our{' '}
                                                <a href={billing.links.terms} className={'text-blue-400 font-semibold'}>
                                                    Terms of Service <FontAwesomeIcon icon={faExternalLinkAlt} />
                                                </a>
                                            </>
                                        ) : (
                                            <Alert type={'success'}>Terms of Service completed</Alert>
                                        )}
                                        {!termsAgreed && (
                                            <div className={'absolute top-0 right-0 p-3'}>
                                                <AdminCheckbox
                                                    name={'terms'}
                                                    checked={false}
                                                    onChange={() => setTermsAgreed(true)}
                                                />
                                            </div>
                                        )}
                                    </TitledGreyBox>
                                    <TitledGreyBox title={'Privacy Policy agreement'} className={'relative'}>
                                        {!privacyAgreed ? (
                                            <>
                                                Click the checkbox to agree to our{' '}
                                                <a
                                                    href={billing.links.privacy}
                                                    className={'text-blue-400 font-semibold'}
                                                >
                                                    Privacy Policy <FontAwesomeIcon icon={faExternalLinkAlt} />
                                                </a>
                                            </>
                                        ) : (
                                            <Alert type={'success'}>Privacy Policy completed</Alert>
                                        )}
                                        {!privacyAgreed && (
                                            <div className={'absolute top-0 right-0 p-3'}>
                                                <AdminCheckbox
                                                    name={'privacy'}
                                                    checked={false}
                                                    onChange={() => setPrivacyAgreed(true)}
                                                />
                                            </div>
                                        )}
                                    </TitledGreyBox>
                                </div>
                            </div>
                            <div className={'h-px bg-gray-700 rounded-full'} />
                            {!termsAgreed || !privacyAgreed ? (
                                <Alert type={'warning'}>
                                    Please agree to the above legal documents before proceeding with your order.
                                </Alert>
                            ) : (
                                <>
                                    {product.price !== 0 && intent ? (
                                        <div className={'w-full mt-8'}>
                                            <PaymentButton
                                                selectedNode={selectedNode}
                                                product={product}
                                                vars={vars}
                                                intent={intent}
                                            />
                                        </div>
                                    ) : (
                                        <div className={'flex w-full mt-8'}>
                                            <p className={'font-semibold text-gray-400'}>
                                                As this product is free, no purchase needs to be made via our payment
                                                gateways.
                                            </p>
                                            <Button className={'ml-auto'} onClick={createFree}>
                                                Create Server
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Elements>
        </PageContentBlock>
    );
};
