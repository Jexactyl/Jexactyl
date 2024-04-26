import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Form, Formik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import Field, { FieldRow } from '@elements/Field';
import tw from 'twin.macro';
import AdminContentBlock from '@elements/AdminContentBlock';
import { Button } from '@elements/button';
import type { ApplicationStore } from '@/state';
import AdminBox from '@elements/AdminBox';
import { object, string, number } from 'yup';
import { faBell, faMicrochip, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from '@/state/hooks';
import { createProduct, updateProduct } from '@/api/admin/billing/products';
import type { Product, Values } from '@/api/admin/billing/products';
import ProductDeleteButton from './ProductDeleteButton';

interface Props {
    product?: Product;
}

export default ({ product }: Props) => {
    const navigate = useNavigate();
    const params = useParams<'id'>();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );
    const { secondary } = useStoreState(state => state.theme.data!.colors);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('admin:billing:product:create');

        if (!product) {
            createProduct(Number(params.id), values)
                .then(data => {
                    setSubmitting(false);
                    navigate(`/admin/billing/categories/${params.id}/products/${data.id}`);
                })
                .catch(error => {
                    setSubmitting(false);
                    clearAndAddHttpError({ key: 'admin:billing:product:create', error });
                });
        } else {
            updateProduct(Number(params.id), product!.id, values)
                .then(() => {
                    setSubmitting(false);
                    navigate(`/admin/billing/categories/${params.id}`);
                })
                .catch(error => {
                    setSubmitting(false);
                    clearAndAddHttpError({ key: 'admin:billing:product:create', error });
                });
        }
    };

    return (
        <AdminContentBlock title={'New Product'}>
            <Formik
                onSubmit={submit}
                initialValues={{
                    categoryId: Number(params.id),

                    name: product?.name ?? 'Plan Name',
                    icon: product?.icon ?? undefined,
                    price: product?.price ?? 9.99,
                    description: product?.description ?? 'This is a server plan.',

                    limits: {
                        cpu: product?.limits.cpu ?? 100,
                        memory: product?.limits.memory ?? 1024,
                        disk: product?.limits.disk ?? 4096,
                        backup: product?.limits.backup ?? 0,
                        database: product?.limits.database ?? 0,
                        allocation: product?.limits.allocation ?? 1,
                    },
                }}
                validationSchema={object().shape({
                    name: string().required().max(191).min(3),
                    icon: string().nullable().max(191).min(3),
                    price: number().required().min(0),
                    description: string().nullable().max(191).min(3),
                    limits: object().shape({
                        cpu: number().required().min(10),
                        memory: number().required().min(128),
                        disk: number().required().min(128),
                        backup: number().required().min(0),
                        database: number().required().min(0),
                        allocation: number().required().min(1),
                    }),
                })}
            >
                {({ isSubmitting, isValid }) => (
                    <Form>
                        <div css={tw`grid grid-cols-1 lg:grid-cols-2 gap-4`}>
                            <div css={tw`w-full flex flex-col mr-0 lg:mr-2`}>
                                <AdminBox title={'General Details'} icon={faPuzzlePiece}>
                                    <FieldRow>
                                        <Field
                                            id={'name'}
                                            name={'name'}
                                            type={'text'}
                                            label={'Name'}
                                            description={'A simple name to identify this product.'}
                                        />
                                        <Field
                                            id={'description'}
                                            name={'description'}
                                            type={'text'}
                                            label={'Description'}
                                            description={'A tagline or description for this product.'}
                                        />
                                        <Field
                                            id={'icon'}
                                            name={'icon'}
                                            type={'text'}
                                            label={'Icon'}
                                            description={'An icon to be displayed with this product.'}
                                        />
                                        <Field
                                            id={'price'}
                                            name={'price'}
                                            type={'text'}
                                            label={'Monthly Cost'}
                                            description={
                                                'The cost of this product monthly in the selected billing currency.'
                                            }
                                        />
                                    </FieldRow>
                                </AdminBox>
                                <AdminBox title={'Resource Limits'} className={'lg:mt-4'} icon={faMicrochip}>
                                    <FieldRow>
                                        <Field
                                            id={'limits.cpu'}
                                            name={'limits.cpu'}
                                            type={'text'}
                                            label={'CPU Limit (%)'}
                                            description={'The amount of a CPU thread a server can use.'}
                                        />
                                        <Field
                                            id={'limits.memory'}
                                            name={'limits.memory'}
                                            type={'text'}
                                            label={'Memory Limit (MB)'}
                                            description={'The amount of a memory a server is allowed to use.'}
                                        />
                                        <Field
                                            id={'limits.disk'}
                                            name={'limits.disk'}
                                            type={'text'}
                                            label={'Disk Limit (MB)'}
                                            description={'The amount of a disk a server is allowed to use.'}
                                        />
                                    </FieldRow>
                                </AdminBox>
                            </div>
                            <div css={tw`w-full flex flex-col mr-0 lg:mr-2`}>
                                <AdminBox title={'Feature Limits'} icon={faBell}>
                                    <FieldRow>
                                        <Field
                                            id={'limits.backup'}
                                            name={'limits.backup'}
                                            type={'text'}
                                            label={'Backup Limit'}
                                            description={'The amount of backups this product can have.'}
                                        />
                                        <Field
                                            id={'limits.database'}
                                            name={'limits.database'}
                                            type={'text'}
                                            label={'Database Limit'}
                                            description={'The amount of databases this product can have.'}
                                        />
                                        <Field
                                            id={'limits.allocation'}
                                            name={'limits.allocation'}
                                            type={'text'}
                                            label={'Allocation (Port) Limit'}
                                            description={'The amount of ports this product can have.'}
                                        />
                                    </FieldRow>
                                </AdminBox>
                                <div css={tw`rounded shadow-md mt-4 py-2 pr-6`} style={{ backgroundColor: secondary }}>
                                    <div css={tw`text-right`}>
                                        {product && <ProductDeleteButton product={product} />}
                                        <Button type={'submit'} disabled={isSubmitting || !isValid}>
                                            {product ? 'Update Product' : 'Create Product'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </AdminContentBlock>
    );
};
