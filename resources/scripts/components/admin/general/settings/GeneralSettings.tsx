import { Form, Formik } from 'formik';
import tw from 'twin.macro';

import AdminBox from '@/components/elements/AdminBox';
import Field, { FieldRow } from '@/components/elements/Field';
import { Button } from '@/components/elements/button';
import { GeneralSettings, updateGeneralSettings } from '@/api/admin/settings';
import { useStoreState } from '@/state/hooks';
import { faPaintBrush } from '@fortawesome/free-solid-svg-icons';
import useFlash from '@/plugins/useFlash';
import { useEffect } from 'react';
import FlashMessageRender from '@/components/FlashMessageRender';

export default () => {
    const { addFlash, clearFlashes, clearAndAddHttpError } = useFlash();

    const appName = useStoreState(state => state.settings.data!.name);

    const submit = (values: GeneralSettings) => {
        clearFlashes();

        updateGeneralSettings(values)
            .then(() => {
                addFlash({
                    type: 'success',
                    key: 'settings:general',
                    message: 'Settings have been updated successfully.',
                });
            })
            .catch(error => {
                clearAndAddHttpError({
                    key: 'settings:general',
                    error: error,
                });
            });
    };

    useEffect(() => {
        clearFlashes();
    }, []);

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                appName: appName,
            }}
        >
            <Form>
                <FlashMessageRender byKey={'settings:general'} className={'mb-2'} />
                <div css={tw`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6`}>
                    <AdminBox title="Branding" icon={faPaintBrush}>
                        <FieldRow>
                            <Field id={'appName'} name={'appName'} type={'text'} label={'App Name'} description={''} />
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
