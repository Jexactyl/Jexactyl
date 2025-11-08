import { Form, Formik } from 'formik';
import tw from 'twin.macro';
import AdminBox from '@/elements/AdminBox';
import Field from '@/elements/Field';
import { Button } from '@/elements/button';
import { AlertSettings, updateAlertSettings } from '@/api/routes/admin/alerts';
import { useStoreActions, useStoreState } from '@/state/hooks';
import { faEye, faList, faPaintBrush } from '@fortawesome/free-solid-svg-icons';
import useFlash from '@/plugins/useFlash';
import { useEffect, useState } from 'react';
import FlashMessageRender from '@/elements/FlashMessageRender';
import Label from '@/elements/Label';
import Select from '@/elements/Select';
import { AlertType } from '@/state/everest';

export default () => {
    const { addFlash, clearFlashes, clearAndAddHttpError } = useFlash();

    const { alert } = useStoreState(state => state.everest.data!);
    const [type, setType] = useState<AlertType>(alert.type);
    const updateEverest = useStoreActions(actions => actions.everest.updateEverest);

    const submit = (values: AlertSettings) => {
        clearFlashes();

        values.type = type;

        updateAlertSettings(values)
            .then(uuid => {
                updateEverest({ alert: { ...values, uuid } });

                addFlash({
                    type: 'success',
                    key: 'settings:alert',
                    message: 'Settings have been updated successfully.',
                });
            })
            .catch(error => {
                clearAndAddHttpError({
                    key: 'settings:alert',
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
                enabled: alert.enabled,
                type: alert.type,
                position: alert.position,
                content: alert.content,
            }}
        >
            <Form>
                <FlashMessageRender byKey={'settings:alert'} className={'mb-2'} />
                <div css={tw`grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6`}>
                    <AdminBox title={'Alert Status'} icon={faEye}>
                        <div>
                            <div className={'inline-flex'}>
                                <Label className={'mt-1 mr-2'}>Show alert to users?</Label>
                                <Field
                                    id={'enabled'}
                                    name={'enabled'}
                                    type={'checkbox'}
                                    defaultChecked={alert.enabled}
                                />
                            </div>
                            <p className={'text-gray-400 text-xs mt-1.5'}>
                                If enabled, your alert as it is currently configured will instantly be displayed to
                                users.
                            </p>
                        </div>
                    </AdminBox>
                    <AdminBox title={'Alert Type'} icon={faList}>
                        <div>
                            <div>
                                <Select
                                    onChange={e => setType(e.currentTarget.value as AlertType)}
                                    defaultValue={alert.type}
                                >
                                    <option value={'success'}>Success (Green)</option>
                                    <option value={'info'}>Info (Blue)</option>
                                    <option value={'warning'}>Warning (Yellow)</option>
                                    <option value={'danger'}>Danger (Red)</option>
                                </Select>
                            </div>
                            <p className={'text-gray-400 text-xs mt-1.5'}>
                                This option allows you to customize the severity and color of the alert shown.
                            </p>
                        </div>
                    </AdminBox>
                    <AdminBox title={'Alert Content'} icon={faPaintBrush} className={'md:col-span-2'}>
                        <Field id={'content'} name={'content'} type={'text'} description={''} />
                        <p className={'text-gray-400 text-xs mt-1.5'}>
                            Configure the alert to display content to end users.
                        </p>
                        <p className={'text-gray-400 text-xs mt-1'}>
                            Current UUID: <span className={'text-gray-600'}>{alert.uuid}</span>
                        </p>
                    </AdminBox>
                </div>
                <div css={tw`w-full flex flex-row items-center mt-6`}>
                    <div css={tw`flex ml-auto`}>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </div>
            </Form>
        </Formik>
    );
};
