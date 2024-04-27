import Spinner from '@elements/Spinner';
import { Button } from '@elements/button';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStoreState } from '@/state/hooks';
import getProduct from '@/api/billing/getProduct';
import { Product } from '@/api/billing/getProducts';
import TitledGreyBox from '@elements/TitledGreyBox';
import { ServerEggVariable } from '@/api/server/types';
import PageContentBlock from '@elements/PageContentBlock';
import VariableBox from '@/components/billing/VariableBox';
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

    const [product, setProduct] = useState<Product | undefined>();
    const [eggs, setEggs] = useState<ServerEggVariable[] | undefined>();

    const { colors } = useStoreState(state => state.theme.data!);

    useEffect(() => {
        getProduct(Number(params.id))
            .then(data => setProduct(data))
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
                <div className={'lg:col-span-6'}>
                    <div className={'mb-8'}>
                        <div className={'text-xl lg:text-3xl font-semibold mb-4'}>
                            Server Details
                            <p className={'text-gray-400 font-normal text-sm mt-1'}>
                                Set a name and optional description for your new server.
                            </p>
                        </div>
                        <div className={'grid lg:grid-cols-2 gap-4'}>
                            <TitledGreyBox title={'Server Name'}>Soon&trade;</TitledGreyBox>
                            <TitledGreyBox title={'Server Description'}>Soon&trade;</TitledGreyBox>
                        </div>
                    </div>
                    <div className={'my-8'}>
                        <div className={'text-xl lg:text-3xl font-semibold mb-4'}>
                            Plan Variables
                            <p className={'text-gray-400 font-normal text-sm mt-1'}>
                                Modify your server variables before your server is even created for ease of use.
                            </p>
                        </div>
                        <div className={'grid lg:grid-cols-2 gap-4'}>
                            {eggs?.map(egg => (
                                <div key={egg.envVariable}>
                                    <VariableBox variable={egg} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={'mt-8 text-right'}>
                        <Button>Pay Now</Button>
                    </div>
                </div>
            </div>
        </PageContentBlock>
    );
};
