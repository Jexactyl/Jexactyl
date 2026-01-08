import { Button } from '@/elements/button';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { Form, useFormikContext, FormikHelpers, Formik } from 'formik';
import tw from 'twin.macro';
import Field from '@/elements/Field';
import { object, string } from 'yup';
import useFlash from '@/plugins/useFlash';
import { updateSettings } from '@/api/routes/admin/billing';
import { useStoreActions, useStoreState } from '@/state/hooks';

interface Values {
    terms: string;
    privacy: string;
}

const LinksForm = () => {
    const { isSubmitting } = useFormikContext<Values>();
    const settings = useStoreState(s => s.everest.data!.billing);

    return (
        <>
            <SpinnerOverlay visible={isSubmitting} />
            <Form css={tw`mb-0 grid lg:grid-cols-2 gap-4 mt-4`}>
                <Field
                    id={'terms'}
                    name={'terms'}
                    label={'Terms of Service URL'}
                    placeholder={settings.links.terms}
                    type={'text'}
                />
                <Field
                    id={'privacy'}
                    name={'privacy'}
                    label={'Privacy Policy URL'}
                    placeholder={settings.links.privacy}
                    type={'text'}
                />
                <div css={tw`lg:col-span-2 flex items-center justify-end`}>
                    <Button type={'submit'}>Save</Button>
                </div>
            </Form>
        </>
    );
};

export default () => {
    const { clearFlashes } = useFlash();
    const settings = useStoreState(s => s.everest.data!.billing);
    const updateEverest = useStoreActions(s => s.everest.updateEverest);

    const submit = async (key: string, value: boolean | string) => {
        await updateSettings(key, value)
            .then(() => {
                updateEverest({ billing: { ...settings, [key]: value } });
            })
            .catch(error => console.log(error));
    };

    const confirm = ({ terms, privacy }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        setSubmitting(true);
        clearFlashes('billing:settings');

        submit('links:terms', terms)
            .then(() => {
                submit('links:privacy', privacy);
            })
            .finally(() => setSubmitting(false));
    };

    return (
        <Formik
            onSubmit={confirm}
            initialValues={{
                terms: '',
                privacy: '',
            }}
            validationSchema={object().shape({
                terms: string().url().nullable(),
                privacy: string().url().nullable(),
            })}
        >
            <LinksForm />
        </Formik>
    );
};
