import { Form, Formik } from 'formik';
import tw from 'twin.macro';

import AdminBox from '@/elements/AdminBox';
import Field from '@/elements/Field';
import { Button } from '@/elements/button';
import { GeneralSettings, updateGeneralSettings } from '@/api/routes/admin/settings';
import { useStoreActions, useStoreState } from '@/state/hooks';
import { faPaintBrush, faPlusCircle, faRecycle, faShapes, faImage, faEye } from '@fortawesome/free-solid-svg-icons';
import useFlash from '@/plugins/useFlash';
import { useEffect } from 'react';
import FlashMessageRender from '@/elements/FlashMessageRender';
import Label from '@/elements/Label';

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
                logo: settings.logo,
                indicators: settings.indicators,
                auto_update: settings.auto_update,
                speed_dial: settings.speed_dial,
                activity: {
                    enabled: {
                        account: settings.activity.enabled.account,
                        server: settings.activity.enabled.server,
                        admin: settings.activity.enabled.admin,
                    }
                },
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
                    <AdminBox title={'Application Logo'} icon={faImage}>
                        <Field id={'logo'} name={'logo'} type={'url'} description={''} />
                        <p className={'text-gray-400 text-xs mt-1.5'}>
                            Configure the logo of this Panel to suit your needs.
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
                    <AdminBox title={'Speed Dial'} icon={faPlusCircle}>
                        <div>
                            <div className={'inline-flex'}>
                                <Label className={'mt-1 mr-2'}>Show speed dial component?</Label>
                                <Field
                                    id={'speed_dial'}
                                    name={'speed_dial'}
                                    type={'checkbox'}
                                    defaultChecked={settings.speed_dial}
                                />
                            </div>
                            <p className={'text-gray-400 text-xs mt-1.5'}>
                                If enabled, a component will show to admins in the client-side UI for quick actions -
                                such as creating a server or user.
                            </p>
                        </div>
                    </AdminBox>
                    <AdminBox title={'Activity Logging'} icon={faEye}>
                        <div>
                            <div className={'bg-black/50 rounded-lg p-2 grid lg:grid-cols-3 gap-4 place-items-center'}>
                                <div className={'inline-flex'}>
                                    <Label className={'mt-1 mr-2'}>Account</Label>
                                    <Field
                                        id={'activity.enabled.account'}
                                        name={'activity.enabled.account'}
                                        type={'checkbox'}
                                        defaultChecked={settings.activity.enabled.account}
                                    />
                                </div>
                                <div className={'inline-flex'}>
                                    <Label className={'mt-1 mr-2'}>Server</Label>
                                    <Field
                                        id={'activity.enabled.server'}
                                        name={'activity.enabled.server'}
                                        type={'checkbox'}
                                        defaultChecked={settings.activity.enabled.server}
                                    />
                                </div>
                                <div className={'inline-flex'}>
                                    <Label className={'mt-1 mr-2'}>Admin</Label>
                                    <Field
                                        id={'activity.enabled.admin'}
                                        name={'activity.enabled.admin'}
                                        type={'checkbox'}
                                        defaultChecked={settings.activity.enabled.admin}
                                    />
                                </div>
                            </div>
                            <p className={'text-gray-400 text-xs mt-1.5'}>
                                Check the boxes you wish to log activity for. By default, all of these are enabled.
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
