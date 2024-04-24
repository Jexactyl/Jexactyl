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
import Label from '@/components/elements/Label';
import { useState } from 'react';
import CategoryDeleteButton from './CategoryDeleteButton';

export default () => {
    const { data: category } = useCategoryFromRoute();

    const [visible, setVisible] = useState<boolean>(category?.visible || false);

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    if (!category) return <>No category could be found</>;

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('admin:billing:category:create');

        values.visible = visible;

        updateCategory(category.id, values)
            .then(() => {
                window.location.reload();
            })
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'admin:billing:category:create', error });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <AdminContentBlock title={'New Category'}>
            <div css={tw`w-full flex flex-row items-center my-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>{category.name}</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        {category.uuid}
                    </p>
                </div>
            </div>

            <Formik
                onSubmit={submit}
                initialValues={{
                    name: category.name,
                    description: category.description,
                    icon: category.icon,
                    visible: category.visible,
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
                                <AdminBox title={'Category Details'} icon={faShoppingBasket}>
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
                                                        checked={!visible}
                                                        onClick={() => setVisible(false)}
                                                    />
                                                    <span css={tw`text-neutral-300 ml-2`}>No</span>
                                                </label>

                                                <label css={tw`inline-flex items-center ml-2`}>
                                                    <Field
                                                        name={'visible'}
                                                        type={'radio'}
                                                        value={'true'}
                                                        checked={visible}
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
                                    <CategoryDeleteButton category={category} />
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
            <div css={tw`w-full flex flex-row items-center my-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Products</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        A list of the available products in this category.
                    </p>
                </div>
            </div>
        </AdminContentBlock>
    );
};
