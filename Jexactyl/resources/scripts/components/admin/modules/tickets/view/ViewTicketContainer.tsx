import tw from 'twin.macro';
import AdminContentBlock from '@/elements/AdminContentBlock';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import { statusToColor } from '@admin/modules/tickets/TicketsContainer';
import classNames from 'classnames';
import AdminBox from '@/elements/AdminBox';
import { faCheckCircle, faGears, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import UserSelect from '@admin/modules/tickets/UserSelect';
import { Form, Formik } from 'formik';
import type { FormikHelpers } from 'formik';
import useFlash from '@/plugins/useFlash';
import { Button } from '@/elements/button';
import FlashMessageRender from '@/elements/FlashMessageRender';
import Select from '@/elements/Select';
import Label from '@/elements/Label';
import { useState } from 'react';
import NewMessageDialog from '@admin/modules/tickets/view/NewMessageDialog';
import MessageTable from './MessageTable';
import DeleteTicketDialog from './DeleteTicketDialog';
import { Alert } from '@/elements/alert';
import Spinner from '@/elements/Spinner';
import useStatus from '@/plugins/useStatus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TicketStatus, Values } from '@/api/routes/admin/tickets/types';
import { updateTicket, useTicketFromRoute } from '@/api/routes/admin/tickets';

export default () => {
    const { data: ticket, isLoading } = useTicketFromRoute();
    const boxStatus = useStatus();

    const [unassign, setUnassign] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [status, setStatus] = useState<TicketStatus>('pending');

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();
        boxStatus.setStatus('loading');

        values.status = status;
        if (unassign) {
            values.assigned_to = null;
        }

        updateTicket(ticket!.id, values)
            .then(() => {
                setSubmitting(false);
                boxStatus.setStatus('success');
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'tickets:view', error });
                boxStatus.setStatus('error');
            });
    };

    if (!ticket || isLoading) return <Spinner size={'large'} centered />;

    if (!ticket.user)
        return (
            <Alert type={'danger'}>
                This ticket was created without an assigned user. This ticket must be deleted.&nbsp;
                <DeleteTicketDialog ticketId={ticket.id} />
            </Alert>
        );

    return (
        <AdminContentBlock title={`View ticket: ${ticket.title}`}>
            <div className={'w-full flex flex-row items-center mb-8'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl font-header font-medium inline-flex'}>
                        {ticket.title}
                        <span
                            className={classNames(
                                statusToColor(ticket.status),
                                'capitalize px-2 py-1 ml-2 my-auto text-xs font-medium rounded-full',
                            )}
                        >
                            {ticket.status}
                        </span>
                    </h2>
                    <p
                        className={
                            'text-base text-sm mt-1 text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'
                        }
                    >
                        First created&nbsp;
                        {Math.abs(differenceInHours(ticket.created_at, new Date())) > 48
                            ? format(ticket.created_at, 'MMM do, yyyy h:mma')
                            : formatDistanceToNow(ticket.created_at, { addSuffix: true })}
                    </p>
                </div>
            </div>
            <FlashMessageRender byKey={'tickets:view'} className={'mb-4'} />
            <Formik
                onSubmit={submit}
                initialValues={{
                    title: ticket.title,
                    status: ticket.status,
                    user_id: ticket.user.id,
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <AdminBox title={'Ticket Options'} icon={faGears} status={boxStatus.status}>
                            <div className={'grid lg:grid-cols-3 gap-4'}>
                                <div>
                                    <Label>Update ticket status</Label>
                                    <Select
                                        defaultValue={ticket.status}
                                        onChange={e => setStatus(String(e.target.value) as TicketStatus)}
                                    >
                                        <option value={'pending'}>Pending</option>
                                        <option value={'in-progress'}>In Progress</option>
                                        <option value={'resolved'}>Resolved</option>
                                        <option value={'unresolved'}>Unresolved</option>
                                    </Select>
                                    <p className={'text-xs mt-1 text-gray-400'}>
                                        Change the state of this ticket for the user.
                                    </p>
                                </div>
                                <div>
                                    <div className={classNames(ticket.assigned_to && 'grid grid-cols-8 gap-2')}>
                                        <div className={classNames(ticket.assigned_to && 'col-span-7')}>
                                            <UserSelect isAdmin selected={ticket.assigned_to} />
                                        </div>
                                        {ticket.assigned_to && (
                                            <div>
                                                <FontAwesomeIcon
                                                    icon={unassign ? faCheckCircle : faXmarkCircle}
                                                    onClick={() => setUnassign(!unassign)}
                                                    className={'mt-10 w-5 text-gray-400'}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <p className={'text-xs mt-1 text-gray-400'}>
                                        You may assign a Panel administrator to be responsible for this ticket.
                                    </p>
                                </div>
                                <div>
                                    <UserSelect selected={ticket.user} />
                                    <p className={'text-xs mt-1 text-gray-400'}>
                                        If needed, you can re-assign this ticket to a different user.
                                    </p>
                                </div>
                            </div>
                            <div css={tw`flex flex-row`}>
                                <div className={'ml-auto mt-4'}>
                                    <DeleteTicketDialog ticketId={ticket.id} />
                                    <Button type={'submit'} disabled={isSubmitting}>
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </AdminBox>
                    </Form>
                )}
            </Formik>
            <div className={'border-2 border-gray-700 rounded-full my-12'} />
            <div className={'w-full flex flex-row items-center'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl font-header font-medium inline-flex'}>Ticket Messages</h2>
                </div>
                <div css={tw`flex ml-auto pl-4`}>
                    <NewMessageDialog ticketId={ticket.id} />
                </div>
            </div>
            <MessageTable ticketId={ticket.id} />
        </AdminContentBlock>
    );
};
