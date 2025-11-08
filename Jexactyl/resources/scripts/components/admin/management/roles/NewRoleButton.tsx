import { Form, Formik, FormikHelpers } from 'formik';
import { useState } from 'react';
import tw from 'twin.macro';
import { object, string } from 'yup';
import { getRoles, createRole } from '@/api/routes/admin/roles';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { Button } from '@/elements/button';
import Field from '@/elements/Field';
import useFlash from '@/plugins/useFlash';
import { Dialog } from '@/elements/dialog';
import SpinnerOverlay from '@/elements/SpinnerOverlay';

interface Values {
    name: string;
    description: string;
    color: string;
}

const schema = object().shape({
    name: string().required('A role name must be provided.').max(32, 'Role name must not exceed 32 characters.'),
    description: string().max(255, 'Role description must not exceed 255 characters.'),
    color: string().nullable(),
});

export default () => {
    const [visible, setVisible] = useState(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { mutate } = getRoles();

    const submit = ({ name, description, color }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('role:create');
        setSubmitting(true);

        createRole(name, description, color)
            .then(async role => {
                await mutate(data => ({ ...data!, items: data!.items.concat(role) }), false);
                setVisible(false);
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'role:create', error });
                setSubmitting(false);
            });
    };

    return (
        <>
            <Formik
                onSubmit={submit}
                initialValues={{ name: '', description: '', color: '' }}
                validationSchema={schema}
            >
                {({ isSubmitting, resetForm }) => (
                    <Dialog
                        open={visible}
                        preventExternalClose={isSubmitting}
                        onClose={() => {
                            resetForm();
                            setVisible(false);
                        }}
                    >
                        <SpinnerOverlay visible={isSubmitting} />
                        <FlashMessageRender byKey={'role:create'} css={tw`mb-6`} />
                        <h2 css={tw`mb-6 text-2xl text-neutral-100`}>New Role</h2>
                        <Form css={tw`m-0`}>
                            <Field
                                type={'text'}
                                id={'name'}
                                name={'name'}
                                label={'Name'}
                                description={'A short name used to identify this role.'}
                                autoFocus
                            />

                            <div css={tw`mt-6`}>
                                <Field
                                    type={'text'}
                                    id={'description'}
                                    name={'description'}
                                    label={'Description'}
                                    description={'A description for this role.'}
                                />
                            </div>
                            <div css={tw`mt-6`}>
                                <Field
                                    type={'color'}
                                    id={'color'}
                                    name={'color'}
                                    label={'Role Color'}
                                    description={'Set a color for this role. (optional)'}
                                />
                            </div>

                            <div css={tw`flex flex-wrap justify-end mt-6`}>
                                <Button
                                    type={'button'}
                                    variant={Button.Variants.Secondary}
                                    css={tw`w-full sm:w-auto sm:mr-2`}
                                    onClick={() => setVisible(false)}
                                >
                                    Cancel
                                </Button>
                                <Button css={tw`w-full mt-4 sm:w-auto sm:mt-0`} type={'submit'}>
                                    Create Role
                                </Button>
                            </div>
                        </Form>
                    </Dialog>
                )}
            </Formik>

            <Button
                type={'button'}
                size={Button.Sizes.Large}
                css={tw`h-10 px-4 py-0 whitespace-nowrap`}
                onClick={() => setVisible(true)}
            >
                New Role
            </Button>
        </>
    );
};
