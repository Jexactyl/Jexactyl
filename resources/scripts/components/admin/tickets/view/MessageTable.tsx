import { useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import tw from 'twin.macro';
import AdminTable, {
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    Pagination,
    Loading,
    NoItems,
    useTableHooks,
} from '@/components/admin/AdminTable';
import {
    ContextFilters,
    Context as MessagesContext,
    useGetTicketMessages,
} from '@/api/admin/tickets/messages/getMessages';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';

const MessagesTable = () => {
    const params = useParams<'id'>();

    const { setPage } = useContext(MessagesContext);
    const { data: messages } = useGetTicketMessages(Number(params.id));

    if (!messages) return <></>;

    const length = messages?.items?.length || 0;

    return (
        <AdminTable className={'mt-6'}>
            <Pagination data={messages} onPageSelect={setPage}>
                <div css={tw`overflow-x-auto`}>
                    <table css={tw`w-full table-auto`}>
                        <TableHead>
                            <TableHeader name={'Message'} />
                            <TableHeader name={'Sent At'} />
                        </TableHead>

                        <TableBody>
                            {messages !== undefined &&
                                length > 0 &&
                                messages.items.map(message => (
                                    <TableRow key={message.id}>
                                        <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                            <Link
                                                to={`/admin/users/${message.author.id}`}
                                                className={'text-primary-400'}
                                            >
                                                {message.author.email}
                                            </Link>
                                        </td>
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

                    {!messages ? <Loading /> : length < 1 ? <NoItems /> : null}
                </div>
            </Pagination>
        </AdminTable>
    );
};

export default () => {
    const hooks = useTableHooks<ContextFilters>();

    return (
        <MessagesContext.Provider value={hooks}>
            <MessagesTable />
        </MessagesContext.Provider>
    );
};
