import { Server } from '@/api/routes/admin/server';
import updateServer, { Values } from '@/api/routes/admin/servers/updateServer';
import { Button } from '@/elements/button';
import { Dialog } from '@/elements/dialog';
import Input from '@/elements/Input';
import Label from '@/elements/Label';
import { CashIcon, ClockIcon, PencilAltIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import { Form, Formik } from 'formik';
import { useState } from 'react';

export default ({ server }: { server: Server }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [billable, setBillable] = useState<boolean>(Boolean(server.billingProductId));

    const [renewalDateStr, setRenewalDateStr] = useState<string>(
        server.renewalDate
            ? new Date(server.renewalDate).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
    );

    const localStrToUTC = (localStr: string): Date => {
        const localDate = new Date(localStr);
        return new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
    };

    const submit = () => {
        if (!renewalDateStr) {
            console.error('No date selected');
            return;
        }

        const utcDate = localStrToUTC(renewalDateStr);

        updateServer(server.id, {
            ...(server as unknown as Partial<Values>),
            renewalDate: utcDate,
        })
            .then(() => window.location.reload())
            .catch(error => console.log(error.message));
    };

    return (
        <>
            <Dialog open={open} onClose={() => setOpen(false)} title={'Edit Server Billing'}>
                <Formik onSubmit={submit} initialValues={{}}>
                    <Form>
                        <div className={'grid space-y-6'}>
                            <div>
                                <div className={'flex'}>
                                    <Label>
                                        <CashIcon className={'w-4 inline-flex'} /> Billing Status
                                    </Label>
                                    <span className={'ml-2 italic text-gray-400 text-sm'}>
                                        Should this server be billed automatically?
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setBillable(true)}
                                    className={classNames(
                                        billable ? 'bg-black/50' : 'bg-black/25',
                                        'rounded-l py-3 px-6 font-bold text-white',
                                    )}
                                >
                                    Enabled
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBillable(false)}
                                    className={classNames(
                                        !billable ? 'bg-black/50' : 'bg-black/25',
                                        'rounded-r py-3 px-6 font-bold text-white',
                                    )}
                                >
                                    Disabled
                                </button>
                            </div>

                            <div>
                                <div className={'flex'}>
                                    <Label>
                                        <ClockIcon className={'w-4 inline-flex'} /> Renewal Date
                                    </Label>
                                    <span className={'ml-2 italic text-gray-400 text-sm'}>
                                        Adjust when this server will renew.
                                    </span>
                                </div>
                                <Input
                                    type="datetime-local"
                                    value={renewalDateStr}
                                    onChange={e => setRenewalDateStr(e.target.value)}
                                />
                                <p>Server will be set to next renew on: {renewalDateStr.split('T')[0]}</p>
                            </div>

                            <div className={'ml-auto'}>
                                <Button type="button" onClick={submit}>
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Formik>
            </Dialog>

            <Button size={Button.Sizes.Small} onClick={() => setOpen(true)}>
                Edit <PencilAltIcon className={'ml-1 w-4'} />
            </Button>
        </>
    );
};
