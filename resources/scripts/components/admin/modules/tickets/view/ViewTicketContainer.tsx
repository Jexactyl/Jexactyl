import tw from 'twin.macro';
import { useTicketFromRoute } from '@/api/admin/tickets/getTicket';
import AdminContentBlock from '@/components/elements/AdminContentBlock';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import { statusToColor } from '@admin/modules/tickets/TicketsContainer';
import classNames from 'classnames';
import AdminBox from '@/components/elements/AdminBox';
import { faGears } from '@fortawesome/free-solid-svg-icons';
import UserSelect from '../UserSelect';
import { Form, Formik } from 'formik';
import type { FormikHelpers } from 'formik';
import useFlash from '@/plugins/useFlash';
import { Button } from '@/components/elements/button';
import updateTicket from '@/api/admin/tickets/updateTicket';
import type { Values } from '@/api/admin/tickets/updateTicket';
import FlashMessageRender from '@/components/FlashMessageRender';
import Select from '@/components/elements/Select';
import Label from '@/components/elements/Label';
import { useState } from 'react';
import { TicketStatus } from '@/api/admin/tickets/getTickets';
import NewMessageDialog from '@admin/modules/tickets/view/NewMessageDialog';
import MessageTable from './MessageTable';
import { useNavigate } from 'react-router-dom';
import DeleteTicketDialog from './DeleteTicketDialog';

export default () => {
    const navigate = useNavigate();
    const { data: ticket } = useTicketFromRoute();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [status, setStatus] = useState<TicketStatus>('pending');

    if (!ticket) return <></>;

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        values.status = status;

        updateTicket(ticket.id, values)
            .then(() => {
                setSubmitting(false);
                navigate('/admin/tickets');
            })
            .catch(error => clearAndAddHttpError({ key: 'tickets:view', error }));
    };

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
                        {Math.abs(differenceInHours(ticket.createdAt, new Date())) > 48
                            ? format(ticket.createdAt, 'MMM do, yyyy h:mma')
                            : formatDistanceToNow(ticket.createdAt, { addSuffix: true })}
                    </p>
                </div>
            </div>
            <FlashMessageRender byKey={'tickets:view'} className={'mb-4'} />
            <Formik
                onSubmit={submit}
                initialValues={{
                    status: ticket.status,
                    assigned_to: ticket.assignedTo?.id || 0,
                    user_id: ticket.user.id,
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <AdminBox title={'Ticket Options'} icon={faGears}>
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
                                    <UserSelect isAdmin selected={ticket.assignedTo} />
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
                                    <DeleteTicketDialog />
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
                    <NewMessageDialog />
                </div>
            </div>
            <MessageTable messages={ticket.relationships.messages} />
        </AdminContentBlock>
    );
};
