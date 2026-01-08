import { Server } from '@/api/routes/admin/server';
import updateServer, { Values } from '@/api/routes/admin/servers/updateServer';
import { Button } from '@/elements/button';
import { Dialog } from '@/elements/dialog';
import Input from '@/elements/Input';
import Label from '@/elements/Label';
import { CashIcon, ClockIcon, PencilAltIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import { Form, Formik } from 'formik';
import { useState, useEffect } from 'react';
import { getCategories } from '@/api/routes/admin/billing/categories';
import { Category, Product } from '@definitions/admin';
import Spinner from '@/elements/Spinner';
import http from '@/api/http';
import { Transformers } from '@definitions/admin';

const MB_TO_GB = 1024;

export default ({ server }: { server: Server }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [billable, setBillable] = useState<boolean>(Boolean(server.billingProductId));
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(server.billingProductId || null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
    const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [renewalDateStr, setRenewalDateStr] = useState<string>(
        server.renewalDate
            ? new Date(server.renewalDate).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
    );

    // Load categories when dialog opens
    useEffect(() => {
        if (open) {
            setLoadingCategories(true);
            setError(null);
            getCategories()
                .then(cats => {
                    setCategories(cats);
                    if (cats.length === 0) {
                        setError('No billing categories found. Please create a category first.');
                    }
                })
                .catch(err => {
                    console.error('Failed to fetch categories:', err);
                    setError('Failed to load billing categories. Please try again.');
                })
                .finally(() => setLoadingCategories(false));
        }
    }, [open]);

    // Load products when category is selected
    useEffect(() => {
        if (selectedCategoryId) {
            setLoadingProducts(true);
            setError(null);
            setProducts([]);
            setSelectedProductId(null);
            
            // Fetch products directly from the products endpoint
            http.get(`/api/application/billing/categories/${selectedCategoryId}/products`)
                .then(({ data }) => {
                    const productList = (data.data || []).map((item: any) => Transformers.toProduct(item));
                    setProducts(productList);
                    if (productList.length === 0) {
                        setError('No products found in this category. Please create products first.');
                    }
                })
                .catch(err => {
                    console.error('Failed to fetch products:', err);
                    setError('Failed to load products for this category.');
                })
                .finally(() => setLoadingProducts(false));
        } else {
            setProducts([]);
            setSelectedProductId(null);
        }
    }, [selectedCategoryId]);

    const localStrToUTC = (localStr: string): Date => {
        const localDate = new Date(localStr);
        return new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
    };

    const submit = () => {
        const payload: Partial<Values> = {
            ...(server as unknown as Partial<Values>),
        };

        if (billable) {
            // When enabling billing, set the renewal date and product ID
            if (!renewalDateStr) {
                setError('Please select a renewal date');
                return;
            }
            if (!selectedProductId) {
                setError('Please select a billing plan');
                return;
            }
            const utcDate = localStrToUTC(renewalDateStr);
            payload.renewalDate = utcDate;
            payload.billingProductId = selectedProductId;
        } else {
            // When disabling billing, clear the renewal date and product ID to stop billing
            payload.renewalDate = null;
            payload.billingProductId = null;
        }

        setError(null);
        updateServer(server.id, payload)
            .then(() => {
                window.location.reload();
            })
            .catch(error => {
                console.error(error);
                setError(error.message || 'Failed to update billing settings');
            });
    };

    return (
        <>
            <Dialog open={open} onClose={() => setOpen(false)} title={'Edit Server Billing'}>
                <Formik onSubmit={submit} initialValues={{}}>
                    <Form>
                        {error && (
                            <div className={'mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm'}>
                                {error}
                            </div>
                        )}
                        <div className={'grid space-y-6'}>
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
                                    <div>
                                        <div className={'flex'}>
                                            <Label>
                                                <CashIcon className={'w-4 inline-flex'} /> Billing Category
                                            </Label>
                                            <span className={'ml-2 italic text-gray-400 text-sm'}>
                                                Select the category for billing.
                                            </span>
                                        </div>
                                        {loadingCategories ? (
                                            <Spinner size={'small'} />
                                        ) : categories.length === 0 ? (
                                            <div className={'p-3 bg-yellow-500/10 border border-yellow-500/50 rounded text-yellow-400 text-sm'}>
                                                No billing categories available. Please create a category first.
                                            </div>
                                        ) : (
                                            <select
                                                value={selectedCategoryId || ''}
                                                onChange={e => {
                                                    const val = parseInt(e.target.value, 10);
                                                    setSelectedCategoryId(!Number.isNaN(val) && val > 0 ? val : null);
                                                }}
                                                className={
                                                    'w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm'
                                                }
                                            >
                                                <option value="">Select a category...</option>
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {selectedCategoryId && (
                                        <div>
                                            <div className={'flex'}>
                                                <Label>
                                                    <CashIcon className={'w-4 inline-flex'} /> Billing Plan
                                                </Label>
                                                <span className={'ml-2 italic text-gray-400 text-sm'}>
                                                    Select the billing product for this server.
                                                </span>
                                            </div>
                                            {loadingProducts ? (
                                                <Spinner size={'small'} />
                                            ) : products.length === 0 ? (
                                                <div className={'p-3 bg-yellow-500/10 border border-yellow-500/50 rounded text-yellow-400 text-sm'}>
                                                    No products found in this category. Please create products first.
                                                </div>
                                            ) : (
                                                <select
                                                    value={selectedProductId || ''}
                                                    onChange={e => {
                                                        const val = parseInt(e.target.value, 10);
                                                        setSelectedProductId(!Number.isNaN(val) && val > 0 ? val : null);
                                                    }}
                                                    className={
                                                        'w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm'
                                                    }
                                                >
                                                    <option value="">Select a billing plan...</option>
                                                    {products.map(product => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name} - ${product.price}/month ({product.limits.cpu}% CPU,{' '}
                                                            {(product.limits.memory / MB_TO_GB).toFixed(1)}GB RAM,{' '}
                                                            {(product.limits.disk / MB_TO_GB).toFixed(1)}GB Disk)
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            {billable && !selectedProductId && products.length > 0 && (
                                                <p className={'text-red-400 text-sm mt-1'}>
                                                    Please select a billing plan to enable billing
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

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
                                    value={renewalDateStr}
                                    onChange={e => setRenewalDateStr(e.target.value)}
                                />
                                <p>Server will be set to next renew on: {renewalDateStr.split('T')[0]}</p>
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
