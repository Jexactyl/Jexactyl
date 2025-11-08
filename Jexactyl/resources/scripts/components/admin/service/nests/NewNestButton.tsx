import type { FormikHelpers } from 'formik';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import tw from 'twin.macro';
import { object, string } from 'yup';

import createNest from '@/api/routes/admin/nests/createNest';
import getNests from '@/api/routes/admin/nests/getNests';
import { Button } from '@/elements/button';
import { Size, Variant } from '@/elements/button/types';
import Field from '@/elements/Field';
import FlashMessageRender from '@/elements/FlashMessageRender';
import Modal from '@/elements/Modal';
import useFlash from '@/plugins/useFlash';

interface Values {
    name: string;
    description: string;
    author: string;
}

const schema = object().shape({
    name: string().required('A nest name must be provided.').max(32, 'Nest name must not exceed 32 characters.'),
    description: string().max(255, 'Nest description must not exceed 255 characters.'),
    author: string().email().required('You must enter an author email to continue.'),
});

export default () => {
    const [visible, setVisible] = useState(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { mutate } = getNests();

    const submit = ({ name, description, author }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('nest:create');
        setSubmitting(true);

        createNest(name, description, author)
            .then(async nest => {
                await mutate(data => ({ ...data!, items: data!.items.concat(nest) }), false);
                setVisible(false);
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'nest:create', error });
                setSubmitting(false);
            });
    };

    return (
        <>
            <Formik
                onSubmit={submit}
                initialValues={{ name: '', description: '', author: '' }}
                validationSchema={schema}
            >
                {({ isSubmitting, resetForm }) => (
                    <Modal
                        visible={visible}
                        dismissable={!isSubmitting}
                        showSpinnerOverlay={isSubmitting}
                        onDismissed={() => {
                            resetForm();
                            setVisible(false);
                        }}
                    >
                        <FlashMessageRender byKey={'nest:create'} css={tw`mb-6`} />

                        <h2 css={tw`mb-6 text-2xl text-neutral-100`}>New Nest</h2>

                        <Form css={tw`m-0`}>
                            <Field
                                type={'text'}
                                id={'name'}
                                name={'name'}
                                label={'Name'}
                                description={'A short name used to identify this nest.'}
                                autoFocus
                            />

                            <div css={tw`mt-6`}>
                                <Field
                                    type={'text'}
                                    id={'description'}
                                    name={'description'}
                                    label={'Description'}
                                    description={'A description for this nest.'}
                                />
                            </div>

                            <div css={tw`mt-6`}>
                                <Field
                                    type={'text'}
                                    id={'author'}
                                    name={'author'}
                                    label={'Author email'}
                                    description={'An email to identify who made this nest.'}
                                />
                            </div>

                            <div css={tw`flex flex-wrap justify-end mt-6`}>
                                <Button.Text
                                    type="button"
                                    variant={Variant.Secondary}
                                    className="w-full sm:mr-2 sm:w-auto"
                                    onClick={() => setVisible(false)}
                                >
                                    Cancel
                                </Button.Text>

                                <Button type="submit" className="mt-4 w-full sm:mt-0 sm:w-auto">
                                    Create Nest
                                </Button>
                            </div>
                        </Form>
                    </Modal>
                )}
            </Formik>

            <Button
                type="button"
                size={Size.Large}
                className="h-10 whitespace-nowrap px-4 py-0"
                onClick={() => setVisible(true)}
            >
                New Nest
            </Button>
        </>
    );
};
