import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Form, Formik } from 'formik';
import Field, { FieldRow } from '@elements/Field';
import tw from 'twin.macro';
import AdminContentBlock from '@elements/AdminContentBlock';
import { Button } from '@elements/button';
import type { ApplicationStore } from '@/state';
import type { Values } from '@/api/admin/billing/categories';
import AdminBox from '@elements/AdminBox';
import { updateCategory, useCategoryFromRoute } from '@/api/admin/billing/categories';
import { object, string, boolean } from 'yup';
import { faShoppingBasket } from '@fortawesome/free-solid-svg-icons';
import Label from '@elements/Label';
import { useState } from 'react';
import CategoryDeleteButton from '@admin/modules/billing/products/CategoryDeleteButton';
import ProductTable from '@admin/modules/billing/products/ProductTable';
import useStatus from '@/plugins/useStatus';
import { Link, useParams } from 'react-router-dom';
import Spinner from '@elements/Spinner';

export default () => {
    const params = useParams<'id'>();
    const { data } = useCategoryFromRoute();
    const { status, setStatus } = useStatus();

    const [name, setName] = useState<string | undefined>(data?.name);
    const [visible, setVisible] = useState<boolean | undefined>(data?.visible);

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    if (!data) return <Spinner size={'large'} centered />;

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();
        setStatus('loading');

        values.visible = visible ?? data.visible;

        updateCategory(data.id, values)
            .then(() => {
                setStatus('success');
                setName(values.name);
            })
            .catch(error => {
                setStatus('error');
                clearAndAddHttpError({ key: 'admin:billing:category:create', error });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <AdminContentBlock title={'New Category'}>
            <div css={tw`w-full flex flex-row items-center m-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>{name ?? data.name}</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        {data.uuid}
                    </p>
                </div>
            </div>

            <Formik
                onSubmit={submit}
                initialValues={{
                    name: data.name,
                    description: data.description,
                    icon: data.icon,
                    visible: data.visible,
                }}
                validationSchema={object().shape({
                    name: string().required().max(191).min(3),
                    icon: string().nullable().max(191).min(3),
                    description: string().nullable().max(191).min(3),
                    visible: boolean().required(),
                })}
            >
                {({ isSubmitting, isValid }) => (
                    <Form>
                        <div css={tw`flex flex-col lg:flex-row`}>
                            <div css={tw`w-full flex flex-col mr-0 lg:mr-2`}>
                                <AdminBox title={'Category Details'} icon={faShoppingBasket} status={status}>
                                    <FieldRow>
                                        <Field
                                            id={'name'}
                                            name={'name'}
                                            type={'text'}
                                            label={'Category Name'}
                                            description={'A simple title for this category.'}
                                        />
                                        <Field
                                            id={'description'}
                                            name={'description'}
                                            type={'text'}
                                            label={'Description'}
                                            description={'A tagline or description for this product category.'}
                                        />
                                        <Field
                                            id={'icon'}
                                            name={'icon'}
                                            type={'text'}
                                            label={'Icon'}
                                            description={'An icon to be displayed with this category.'}
                                        />
                                        <div className={'mt-1'}>
                                            <Label htmlFor={'visible'}>Visible</Label>
                                            <div className={'mt-1'}>
                                                <label css={tw`inline-flex items-center mr-2`}>
                                                    <Field
                                                        name={'visible'}
                                                        type={'radio'}
                                                        value={'false'}
                                                        checked={visible !== undefined ? !visible : !data.visible}
                                                        onClick={() => setVisible(false)}
                                                    />
                                                    <span css={tw`text-neutral-300 ml-2`}>No</span>
                                                </label>

                                                <label css={tw`inline-flex items-center ml-2`}>
                                                    <Field
                                                        name={'visible'}
                                                        type={'radio'}
                                                        value={'true'}
                                                        checked={visible !== undefined ? visible : data.visible}
                                                        onClick={() => setVisible(true)}
                                                    />
                                                    <span css={tw`text-neutral-300 ml-2`}>Yes</span>
                                                </label>
                                            </div>
                                            <p className={'mt-3 text-xs'}>Should this category be visible to users?</p>
                                        </div>
                                    </FieldRow>
                                </AdminBox>
                                <div css={tw`text-right space-x-4 m-4`}>
                                    <CategoryDeleteButton category={data} />
                                    <Button type={'submit'} css={tw`ml-auto`} disabled={isSubmitting || !isValid}>
                                        Update
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
            <div className={'h-px border-2 border-gray-700 rounded-full w-full mt-12 mb-4'} />
            <div css={tw`w-full flex flex-row items-center p-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Products</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        A list of the available products in the {data.name} category.
                    </p>
                </div>
                <div className={'flex ml-auto pl-4'}>
                    <Link to={`/admin/billing/categories/${params.id}/products/new`}>
                        <Button>Add Product to {data.name}</Button>
                    </Link>
                </div>
            </div>
            <ProductTable />
        </AdminContentBlock>
    );
};
