import { Link } from 'react-router-dom';
import tw from 'twin.macro';
import AdminTable, {
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    Loading,
    NoItems,
    useTableHooks,
} from '@/components/admin/AdminTable';
import { ContextFilters, Context as MessagesContext } from '@/api/admin/tickets/messages/getMessages';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import { TicketMessage } from '@/api/admin/tickets/getTickets';

const MessagesTable = ({ messages }: { messages?: TicketMessage[] }) => {
    const length = messages?.length || 0;

    return (
        <AdminTable className={'mt-6'}>
            <div css={tw`overflow-x-auto`}>
                <table css={tw`w-full table-auto`}>
                    <TableHead>
                        <TableHeader name={'Message'} />
                        <TableHeader name={'Sent At'} />
                    </TableHead>

                    <TableBody>
                        {messages !== undefined &&
                            length > 0 &&
                            messages.map(message => (
                                <TableRow key={message.id}>
                                    {message.author ? (
                                        <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                            <Link
                                                to={`/admin/users/${message.author.id}`}
                                                className={'text-primary-400'}
                                            >
                                                {message.author.email}
                                            </Link>
                                        </td>
                                    ) : (
                                        <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                            <Link to={`/admin/users`} className={'text-primary-400'}>
                                                Ticket Owner
                                            </Link>
                                        </td>
                                    )}
                                    <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                        {message.message}
                                    </td>
                                    <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                        {Math.abs(differenceInHours(message.createdAt, new Date())) > 48
                                            ? format(message.createdAt!, 'MMM do, yyyy h:mma')
                                            : formatDistanceToNow(message.createdAt!, { addSuffix: true })}
                                    </td>
                                </TableRow>
                            ))}
                    </TableBody>
                </table>

                {!messages ? <Loading /> : messages.length < 1 ? <NoItems /> : null}
            </div>
        </AdminTable>
    );
};

export default ({ messages }: { messages?: TicketMessage[] }) => {
    const hooks = useTableHooks<ContextFilters>();

    return (
        <MessagesContext.Provider value={hooks}>
            <MessagesTable messages={messages} />
        </MessagesContext.Provider>
    );
};
