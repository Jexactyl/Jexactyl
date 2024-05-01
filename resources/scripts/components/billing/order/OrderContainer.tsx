import Spinner from '@elements/Spinner';
import { Button } from '@elements/button';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStoreState } from '@/state/hooks';
import getProduct from '@/api/billing/getProduct';
import { Product } from '@/api/billing/getProducts';
import orderProduct from '@/api/billing/orderProduct';
import { ServerEggVariable } from '@/api/server/types';
import NodeBox from '@/components/billing/order/NodeBox';
import PageContentBlock from '@elements/PageContentBlock';
import VariableBox from '@/components/billing/order/VariableBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import getProductVariables from '@/api/billing/getProductVariables';
import {
    faArchive,
    faCreditCard,
    faDatabase,
    faEthernet,
    faHdd,
    faIdBadge,
    faMemory,
    faMicrochip,
} from '@fortawesome/free-solid-svg-icons';
import getNodes, { Node } from '@/api/billing/getNodes';
import { Alert } from '@/components/elements/alert';

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

    const [nodes, setNodes] = useState<Node[] | undefined>();
    const [selectedNode, setSelectedNode] = useState<number>();

    const [product, setProduct] = useState<Product | undefined>();
    const [eggs, setEggs] = useState<ServerEggVariable[] | undefined>();

    const { colors } = useStoreState(state => state.theme.data!);

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!product) return;
        if (!selectedNode) return;

        const data = Array.from(vars, ([key, value]) => ({ key, value }));

        orderProduct(Number(product!.id), selectedNode, data)
            .then(response => {
                // @ts-expect-error this is fine
                window.location = response;
            })
            .catch(error => console.error(error));
    };

    useEffect(() => {
        getProduct(Number(params.id))
            .then(data => setProduct(data))
            .catch(error => console.error(error));

        getNodes()
            .then(data => {
                setNodes(data);
                setSelectedNode(Number(data[0]?.id) ?? 0);
            })
            .catch(error => console.error(error));
    }, []);

    useEffect(() => {
        if (!product || eggs) return;

        getProductVariables(Number(product.eggId))
            .then(data => setEggs(data))
            .catch(error => console.error(error));
    }, [product]);

    if (!product) return <Spinner centered />;

    return (
        <PageContentBlock title={'Your Order'}>
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
                        <img src={product.icon} className={'w-8 h-8 ml-2 inline-flex'} />
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
                    <LimitBox icon={faHdd} content={`${(product.limits.memory / 1024).toFixed(1)} GiB Disk`} />
                    <div className={'h-0.5 my-4 bg-gray-600 mr-8 rounded-full'} />
                    <LimitBox icon={faArchive} content={`${product.limits.backup} Backup Slots`} />
                    <LimitBox icon={faDatabase} content={`${product.limits.database} Database Slots`} />
                    <LimitBox icon={faEthernet} content={`${product.limits.allocation} Network Ports`} />
                </div>
                <form id={'create-server-form'} onSubmit={submit} className={'lg:col-span-6'}>
                    <div>
                        <div className={'my-10'}>
                            <div className={'text-xl lg:text-3xl font-semibold mb-4'}>
                                Choose a location
                                <p className={'text-gray-400 font-normal text-sm mt-1'}>
                                    Select a location from our list to deploy your server to.
                                </p>
                            </div>
                            <div className={'grid lg:grid-cols-2 gap-4'}>
                                {!nodes && (
                                    <Alert type={'danger'} className={'col-span-2'}>
                                        There are no nodes available for deployment.
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
                                            Modify your server variables before your server is even created for ease of
                                            use.
                                        </p>
                                    </div>
                                    <div className={'grid lg:grid-cols-2 gap-4'}>
                                        {eggs?.map(variable => (
                                            <>
                                                {variable.isEditable && (
                                                    <div key={variable.envVariable}>
                                                        <VariableBox variable={variable} vars={vars} />
                                                    </div>
                                                )}
                                            </>
                                        ))}
                                    </div>
                                </div>
                                <div className={'h-px bg-gray-700 rounded-full'} />
                            </>
                        )}
                        <div className={'mt-8 text-right'}>
                            <Button type={'submit'}>Pay Now</Button>
                        </div>
                    </div>
                </form>
            </div>
        </PageContentBlock>
    );
};
