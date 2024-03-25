import { Form, Formik } from 'formik';
import tw from 'twin.macro';

import AdminBox from '@/components/admin/AdminBox';
import Field, { FieldRow } from '@/components/elements/Field';
import { Button } from '@/components/elements/button';
import { GeneralSettings, updateGeneralSettings } from '@/api/admin/settings';
import { useNavigate } from 'react-router-dom';
import { useStoreState } from '@/state/hooks';
import { faMagnifyingGlass, faPaintBrush } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const navigate = useNavigate();
    const appName = useStoreState(state => state.settings.data!.name);
    const recaptchaKey = useStoreState(state => state.settings.data!.recaptcha.siteKey);

    const submit = (values: GeneralSettings) => {
        updateGeneralSettings(values)
            .then(() => navigate('/admin/settings'))
            .catch(error => console.log(error));
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                appName: appName,
                googleAnalytics: recaptchaKey,
            }}
        >
            <Form>
                <div css={tw`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6`}>
                    <AdminBox title="Branding" icon={faPaintBrush}>
                        <FieldRow>
                            <Field id={'appName'} name={'appName'} type={'text'} label={'App Name'} description={''} />
                        </FieldRow>
                    </AdminBox>

                    <AdminBox title="Analytics" icon={faMagnifyingGlass}>
                        <FieldRow>
                            <Field
                                id={'googleAnalytics'}
                                name={'googleAnalytics'}
                                type={'text'}
                                label={'Google Analytics'}
                                description={''}
                            />
                        </FieldRow>
                    </AdminBox>
                </div>
                <div css={tw`w-full flex flex-row items-center mt-6`}>
                    <div css={tw`flex text-xs text-gray-500`}>
                        These changes may not apply until users refresh the page.
                    </div>

                    <div css={tw`flex ml-auto`}>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </div>
            </Form>
        </Formik>
    );
};
