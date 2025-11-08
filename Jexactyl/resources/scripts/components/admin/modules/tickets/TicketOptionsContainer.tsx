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
import { faFirstOrder } from '@fortawesome/free-brands-svg-icons';
import ToggleTicketsButton from './ToggleTicketsButton';
import { updateTicketSettings } from '@/api/routes/admin/tickets';

export interface TicketSettings {
    maxCount: number;
}

export default () => {
    const { addFlash, clearFlashes, clearAndAddHttpError } = useFlash();

    const settings = useStoreState(state => state.everest.data!.tickets);

    const submit = (values: TicketSettings) => {
        clearFlashes();

        updateTicketSettings('max_count', Number(values.maxCount))
            .then(() => {
                addFlash({
                    type: 'success',
                    key: 'admin:tickets',
                    message: 'Settings have been updated successfully.',
                });
            })
            .catch(error => {
                clearAndAddHttpError({
                    key: 'admin:tickets',
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
                maxCount: settings.maxCount,
            }}
        >
            <Form>
                <FlashMessageRender byKey={'settings:general'} className={'mb-2'} />
                <div css={tw`grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6`}>
                    <AdminBox title={'Maximum Ticket Count'} icon={faFirstOrder}>
                        <div>
                            <div>
                                <Label className={'mt-1 mr-2'}>What should the limit be?</Label>
                                <Field id={'maxCount'} name={'maxCount'} defaultValue={settings.maxCount} />
                            </div>
                            <p className={'text-gray-400 text-xs mt-1.5'}>
                                If you wish, you can set a maximum amount of tickets that a user can create.
                            </p>
                        </div>
                    </AdminBox>
                </div>
                <div css={tw`w-full flex flex-row items-center mt-6`}>
                    <div css={tw`flex text-xs text-gray-500`}>
                        These changes may not apply until users refresh the page.
                    </div>

                    <div css={tw`flex ml-auto`}>
                        <ToggleTicketsButton />
                        <Button type="submit">Save Changes</Button>
                    </div>
                </div>
            </Form>
        </Formik>
    );
};
