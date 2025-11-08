import { Form, Formik } from 'formik';
import tw from 'twin.macro';
import AdminBox from '@/elements/AdminBox';
import Field from '@/elements/Field';
import { Button } from '@/elements/button';
import { useStoreState } from '@/state/hooks';
import useFlash from '@/plugins/useFlash';
import { useEffect } from 'react';
import FlashMessageRender from '@/elements/FlashMessageRender';
import Label from '@/elements/Label';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import ToggleWebhooksButton from './ToggleWebhooksButton';
import { update } from '@/api/routes/admin/webhooks';

export interface WebhookSettings {
    url: string;
}

export default () => {
    const { addFlash, clearFlashes, clearAndAddHttpError } = useFlash();

    const settings = useStoreState(state => state.everest.data!.webhooks);

    const submit = (values: WebhookSettings) => {
        clearFlashes();

        update('url', values.url)
            .then(() => {
                addFlash({
                    type: 'success',
                    key: 'admin:webhooks',
                    message: 'Settings have been updated successfully.',
                });
            })
            .catch(error => {
                clearAndAddHttpError({
                    key: 'admin:webhooks',
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
                url: '',
            }}
        >
            <Form>
                <FlashMessageRender byKey={'admin:webhooks'} className={'mb-2'} />
                <div css={tw`grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6`}>
                    <AdminBox title={'Webhook URL'} icon={faLink}>
                        <div>
                            <div>
                                <Label className={'mt-1 mr-2'}>Webhook URL Configuration</Label>
                                <Field
                                    id={'url'}
                                    name={'url'}
                                    placeholder={
                                        settings.url
                                            ? 'The webhook URL has already been provided.'
                                            : 'Provide a webhook URL here'
                                    }
                                />
                            </div>
                            <p className={'text-gray-400 text-xs mt-1.5'}>
                                Set the webhook URL to use for sending data.
                            </p>
                        </div>
                    </AdminBox>
                </div>
                <div css={tw`w-full flex flex-row items-center mt-6`}>
                    <div css={tw`flex text-xs text-gray-500`}>These changes will apply as soon you save them.</div>

                    <div css={tw`flex ml-auto`}>
                        <ToggleWebhooksButton />
                        <Button type="submit">Save Changes</Button>
                    </div>
                </div>
            </Form>
        </Formik>
    );
};
