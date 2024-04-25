import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import Field, { FieldRow } from '@elements/Field';
import tw from 'twin.macro';
import AdminContentBlock from '@elements/AdminContentBlock';
import { Button } from '@elements/button';
import type { ApplicationStore } from '@/state';
import type { Values } from '@/api/admin/billing/categories';
import AdminBox from '@elements/AdminBox';
import { createCategory } from '@/api/admin/billing/categories';
import { object, string, boolean } from 'yup';
import { faShoppingBasket } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from '@/state/hooks';
import Label from '@/components/elements/Label';
import { useState } from 'react';

const initialValues: Values = {
    name: 'Minecraft: Java Edition',
    icon: '',
    description: 'Supports Minecraft 1.20.1',
    visible: false,
};

export default () => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState<boolean>(initialValues.visible);

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );
    const { secondary } = useStoreState(state => state.theme.data!.colors);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('admin:billing:category:create');

        values.visible = visible;

        createCategory(values)
            .then(data => navigate(`/admin/billing/categories/${data.id}`))
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
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>New Product Category</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        Add a new product category to the billing interface.
                    </p>
                </div>
            </div>

            <Formik
                onSubmit={submit}
                initialValues={initialValues}
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
                                            <Label htmlFor={'visible'}>Visible on creation</Label>
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
                                            <p className={'mt-3 text-xs'}>Should this category be visible instantly?</p>
                                        </div>
                                    </FieldRow>
                                </AdminBox>
                                <div css={tw`rounded shadow-md mt-4 py-2 pr-6`} style={{ backgroundColor: secondary }}>
                                    <div css={tw`flex flex-row`}>
                                        <Button type={'submit'} css={tw`ml-auto`} disabled={isSubmitting || !isValid}>
                                            Create
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
