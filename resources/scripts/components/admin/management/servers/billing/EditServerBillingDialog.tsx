import { Server } from '@definitions/admin';
import { Button } from '@/elements/button';
import { Dialog } from '@/elements/dialog';
import Input from '@/elements/Input';
import Label from '@/elements/Label';
import { CashIcon, ClockIcon, PencilAltIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import { Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Category, Product } from '@definitions/admin';
import Spinner from '@/elements/Spinner';
import FlashMessageRender from '@/elements/FlashMessageRender';
import Select from '@/elements/Select';
import { getCategories } from '@/api/routes/admin/billing';
import { getProduct, getProducts } from '@/api/routes/admin/billing';
import { useStoreState } from '@/state/hooks';
import { updateServerEntry as updateServer, UpdateServerValues as Values } from '@/api/routes/admin/servers';

const localToUTC = (localStr: string): Date => {
    const localDate = new Date(localStr);
    return new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
};

type LoadingState = 'loading' | 'ready';

export default ({ server }: { server: Server }) => {
    const billing = useStoreState(state => state.everest.data!.billing);

    const [open, setOpen] = useState<boolean>(false);
    const [loadingState, setLoadingState] = useState<LoadingState>('loading');
    const [billable, setBillable] = useState<boolean>(Boolean(server.billingProductId));
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    const [categoryId, setCategoryId] = useState<number | undefined>();
    const [productId, setProductId] = useState<number | undefined>();

    const [renewalDate, setRenewalDate] = useState<string>(
        server.renewalDate
            ? new Date(server.renewalDate).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
    );

    useEffect(() => {
        const init = async () => {
            const [cats, existingProduct] = await Promise.all([
                getCategories(),
                server.billingProductId ? getProduct(server.billingProductId) : Promise.resolve(null),
            ]);

            setCategories(cats);

            if (existingProduct) {
                const matchedCategory = cats.find(c => c.uuid === existingProduct.categoryUuid);
                setCategoryId(matchedCategory?.id);
                setProductId(existingProduct.id);
            } else if (cats[0]) {
                setCategoryId(cats[0].id);
            }

            setLoadingState('ready');
        };

        init().catch(err => {
            console.error('Failed to load billing data:', err);
            setLoadingState('ready');
        });
    }, []);

    useEffect(() => {
        if (!categoryId) return;

        getProducts(categoryId).then(data => {
            setProducts(data);

            setProductId(prev => {
                const stillValid = prev && data.some(p => p.id === prev);
                return stillValid ? prev : data[0]?.id;
            });
        });
    }, [categoryId]);

    const submit = () => {
        const payload = server as Partial<Values>;

        if (billable) {
            payload.renewalDate = localToUTC(renewalDate);
            payload.billingProductId = productId;
        } else {
            payload.renewalDate = null;
            payload.billingProductId = null;
        }

        updateServer(server.id, payload)
            .then(() => window.location.reload())
            .catch(error => console.log(error));
    };

    return (
        <>
            <Dialog open={open} onClose={() => setOpen(false)} title={'Edit Server Billing'}>
                <FlashMessageRender byKey={'admin:server:billing'} />
                <Formik onSubmit={submit} initialValues={{}}>
                    <Form>
                        <div className={'grid space-y-6'}>
                            {/* Billing Status */}
                            <div>
                                <div className={'flex'}>
                                    <Label>
                                        <CashIcon className={'w-4 inline-flex'} /> Billing Status
                                    </Label>
                                    <span className={'ml-2 italic text-gray-400 text-sm'}>
                                        Should this server be billed automatically?
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setBillable(true)}
                                    className={classNames(
                                        billable ? 'bg-black/50' : 'bg-black/25',
                                        'rounded-l py-3 px-6 font-bold text-white',
                                    )}
                                >
                                    Enabled
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBillable(false)}
                                    className={classNames(
                                        !billable ? 'bg-black/50' : 'bg-black/25',
                                        'rounded-r py-3 px-6 font-bold text-white',
                                    )}
                                >
                                    Disabled
                                </button>
                            </div>

                            {billable && (
                                <>
                                    {/* Billing Category */}
                                    <div>
                                        <div className={'flex'}>
                                            <Label>
                                                <CashIcon className={'w-4 inline-flex'} /> Billing Category
                                            </Label>
                                            <span className={'ml-2 italic text-gray-400 text-sm'}>
                                                Select the category for billing.
                                            </span>
                                        </div>
                                        {loadingState === 'loading' ? (
                                            <Spinner centered />
                                        ) : (
                                            <Select
                                                value={categoryId ?? ''}
                                                onChange={e => setCategoryId(Number(e.target.value))}
                                            >
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name} - {category.description}
                                                    </option>
                                                ))}
                                            </Select>
                                        )}
                                    </div>

                                    {/* Billing Product */}
                                    <div>
                                        <div className={'flex'}>
                                            <Label>
                                                <CashIcon className={'w-4 inline-flex'} /> Billing Product
                                            </Label>
                                            <span className={'ml-2 italic text-gray-400 text-sm'}>
                                                Select the product to assign to this server.
                                            </span>
                                        </div>
                                        {loadingState === 'loading' ? (
                                            <Spinner centered />
                                        ) : (
                                            <Select
                                                value={productId ?? ''}
                                                onChange={e => setProductId(Number(e.target.value))}
                                            >
                                                {products.map(product => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name} ({product.limits.cpu}% CPU,{' '}
                                                        {product.limits.memory / 1024}GB RAM,{' '}
                                                        {product.limits.disk / 1024}GB Disk) - {billing.currency.symbol}
                                                        {product.price}/mo
                                                    </option>
                                                ))}
                                            </Select>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Renewal Date */}
                            <div>
                                <div className={'flex'}>
                                    <Label>
                                        <ClockIcon className={'w-4 inline-flex'} /> Renewal Date
                                    </Label>
                                    <span className={'ml-2 italic text-gray-400 text-sm'}>
                                        Adjust when this server will renew.
                                    </span>
                                </div>
                                <Input
                                    type="datetime-local"
                                    value={renewalDate}
                                    onChange={e => setRenewalDate(e.target.value)}
                                />
                            </div>

                            <div className={'ml-auto'}>
                                <Button type="button" onClick={submit}>
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Formik>
            </Dialog>

            <Button size={Button.Sizes.Small} onClick={() => setOpen(true)}>
                Edit <PencilAltIcon className={'ml-1 w-4'} />
            </Button>
        </>
    );
};
