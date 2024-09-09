import { Form, Formik } from 'formik';
import tw from 'twin.macro';

import AdminBox from '@elements/AdminBox';
import Field from '@elements/Field';
import { Button } from '@elements/button';
import { GeneralSettings, updateGeneralSettings } from '@/api/admin/settings';
import { useStoreActions, useStoreState } from '@/state/hooks';
import { faPaintBrush, faRecycle, faShapes } from '@fortawesome/free-solid-svg-icons';
import useFlash from '@/plugins/useFlash';
import { useEffect } from 'react';
import FlashMessageRender from '@/components/FlashMessageRender';
import Label from '@/components/elements/Label';

export default () => {
    const { addFlash, clearFlashes, clearAndAddHttpError } = useFlash();

    const settings = useStoreState(state => state.settings.data!);
    const updateSettings = useStoreActions(actions => actions.settings.updateSettings);

    const submit = (values: GeneralSettings) => {
        clearFlashes();

        updateGeneralSettings(values)
            .then(() => {
                updateSettings(values);

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
                name: settings.name,
                indicators: settings.indicators,
                auto_update: settings.auto_update,
            }}
        >
            <Form>
                <FlashMessageRender byKey={'settings:general'} className={'mb-2'} />
                <div css={tw`grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6`}>
                    <AdminBox title={'Application Name'} icon={faPaintBrush}>
                        <Field id={'name'} name={'name'} type={'text'} description={''} />
                        <p className={'text-gray-400 text-xs mt-1.5'}>
                            Configure the name of this Panel to suit your needs.
                        </p>
                    </AdminBox>
                    <AdminBox title={'Automatic Updates'} icon={faRecycle}>
                        <div>
                            <div className={'inline-flex'}>
                                <Label className={'mt-1 mr-2'}>Allow Automatic Updates?</Label>
                                <Field
                                    id={'auto_update'}
                                    name={'auto_update'}
                                    type={'checkbox'}
                                    defaultChecked={settings.auto_update}
                                />
                            </div>
                            <p className={'text-gray-400 text-xs mt-1.5'}>
                                If enabled, Jexactyl will automatically update in order to keep your system secure and
                                introduce new features.
                            </p>
                        </div>
                    </AdminBox>
                    <AdminBox title={'Admin Indicators'} icon={faShapes}>
                        <div>
                            <div className={'inline-flex'}>
                                <Label className={'mt-1 mr-2'}>Show admin indicators?</Label>
                                <Field
                                    id={'indicators'}
                                    name={'indicators'}
                                    type={'checkbox'}
                                    defaultChecked={settings.indicators}
                                />
                            </div>
                            <p className={'text-gray-400 text-xs mt-1.5'}>
                                If enabled, small boxes will appear in the top-right of the UI indicating whether
                                Jexactyl modules are enabled/disabled. Only on large screens.
                            </p>
                        </div>
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
