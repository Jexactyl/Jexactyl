import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Form, Formik, useFormikContext } from 'formik';
import { useNavigate } from 'react-router-dom';
import Field, { FieldRow } from '@/elements/Field';
import tw from 'twin.macro';
import AdminContentBlock from '@/elements/AdminContentBlock';
import { Button } from '@/elements/button';
import type { ApplicationStore } from '@/state';
import AdminBox from '@/elements/AdminBox';
import { createCategory, updateCategory } from '@/api/routes/admin/billing/categories';
import { object, string, boolean, number } from 'yup';
import { faShoppingBasket } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from '@/state/hooks';
import Label from '@/elements/Label';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ServerServiceContainer } from '@admin/management/servers/ServerStartupContainer';
import { WithRelationships } from '@/api/routes/admin';
import type { Egg } from '@/api/routes/admin/egg';
import { ShoppingCartIcon } from '@heroicons/react/outline';
import CategoryDeleteButton from './CategoryDeleteButton';
import { getEgg } from '@/api/routes/admin/egg';
import { Category } from '@definitions/admin';
import { CategoryValues } from '@/api/routes/admin/billing/types';

interface Props {
    visible: boolean;
    category?: Category;
    setVisible: Dispatch<SetStateAction<boolean>>;
}

function InternalForm({ category, visible, setVisible }: Props) {
    const [egg, setEgg] = useState<WithRelationships<Egg, 'variables'> | undefined>();
    const { setFieldValue, isSubmitting } = useFormikContext<CategoryValues>();
    const { secondary } = useStoreState(state => state.theme.data!.colors);

    useEffect(() => {
        if (category) {
            getEgg(category!.eggId)
                .then(egg => setEgg(egg))
                .catch(error => console.error(error));
        }
    }, []);

    useEffect(() => {
        setFieldValue('eggId', egg?.id);
    }, [egg]);

    return (
        <Form>
            <div css={tw`grid grid-cols-1 lg:grid-cols-2 gap-4`}>
                <div css={tw`w-full flex flex-col mr-0 lg:mr-2`}>
                    <AdminBox title={'Category Details'} icon={faShoppingBasket} isLoading={isSubmitting}>
                        <FieldRow>
                            <Field
                                id={'name'}
                                name={'name'}
                                type={'text'}
                                placeholder={'Minecraft Java'}
                                label={'Category Name'}
                                description={'A simple title for this category.'}
                            />
                            <Field
                                id={'description'}
                                name={'description'}
                                type={'text'}
                                placeholder={'With support for 1.21'}
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
                </div>
                <div css={tw`w-full flex flex-col mr-0 lg:mr-2`}>
                    <ServerServiceContainer
                        selectedEggId={egg?.id}
                        setEgg={setEgg}
                        nestId={category?.nestId ?? 0}
                        noToggle
                    />
                    <div css={tw`rounded shadow-md mt-4 py-2 pr-6`} style={{ backgroundColor: secondary }}>
                        <div css={tw`text-right`}>
                            {category && <CategoryDeleteButton category={category} />}
                            <Button type={'submit'} css={tw`ml-4`}>
                                {category ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Form>
    );
}

export default ({ category }: { category?: Category }) => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState<boolean>(category?.visible || false);

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    const submit = (values: CategoryValues, { setSubmitting }: FormikHelpers<CategoryValues>) => {
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

    const update = (values: CategoryValues, { setSubmitting }: FormikHelpers<CategoryValues>) => {
        clearFlashes();

        values.visible = visible;

        updateCategory(category!.id, values)
            .catch(error => {
                clearAndAddHttpError({ key: 'admin:billing:category:create', error });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <AdminContentBlock title={'New Category'}>
            <div css={tw`w-full flex flex-row items-center m-8`}>
                {category?.icon ? (
                    <img src={category.icon} className={'ww-8 h-8 mr-4'} />
                ) : (
                    <ShoppingCartIcon className={'w-8 h-8 mr-4'} />
                )}
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>
                        {category?.name ?? 'New Product Category'}
                    </h2>
                    <p
                        css={tw`hidden lg:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}
                    >
                        {category?.uuid ?? 'Add a new category to the billing interface.'}
                    </p>
                </div>
            </div>
            <Formik
                onSubmit={category ? update : submit}
                initialValues={{
                    name: category?.name ?? '',
                    icon: category?.icon ?? '',
                    description: category?.description ?? '',
                    visible: category?.visible ?? false,
                    eggId: category?.eggId ?? 0,
                }}
                validationSchema={object().shape({
                    name: string().required().max(191).min(3),
                    icon: string().nullable().max(191).min(3),
                    description: string().nullable().max(191).min(3),
                    visible: boolean().required(),
                    nestId: number(),
                    eggId: number(),
                })}
            >
                <InternalForm category={category} visible={visible} setVisible={setVisible} />
            </Formik>
        </AdminContentBlock>
    );
};
