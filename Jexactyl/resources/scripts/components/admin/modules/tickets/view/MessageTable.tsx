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
    ContentWrapper,
    Pagination,
} from '@/elements/AdminTable';
import { Context as MessagesContext, getTicketMessages } from '@/api/routes/admin/tickets/messages';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import { Context as TicketMessageContext } from '@/api/routes/admin/tickets/messages';
import { useStoreState } from '@/state/hooks';
import { useContext, useState } from 'react';
import CopyOnClick from '@/elements/CopyOnClick';
import { Button } from '@/elements/button';
import { Dialog } from '@/elements/dialog';
import { Alert } from '@/elements/alert';
import { TicketMessageFilters } from '@/api/routes/admin/tickets/types';

const MessagesTable = ({ ticketId }: { ticketId: number }) => {
    const { data: messages, error } = getTicketMessages(ticketId);
    const [visible, setVisible] = useState<string | null>(null);
    const { colors } = useStoreState(state => state.theme.data!);
    const { setPage, sort, setSort, sortDirection } = useContext(TicketMessageContext);

    if (error) return <Alert type={'danger'}>Unable to render messages: {error}</Alert>;

    return (
        <>
            {/* this is a really dumb comparison but TS is dumber. */}
            {visible !== null && (
                <Dialog open={Boolean(visible)} onClose={() => setVisible(null)} title={'Message Content'}>
                    <p className={'text-gray-300 italic'}>{visible.toString()}</p>
                </Dialog>
            )}
            <AdminTable className={'mt-6'}>
                <ContentWrapper>
                    <Pagination data={messages} onPageSelect={setPage}>
                        <div css={tw`overflow-x-auto`}>
                            <table css={tw`w-full table-auto`}>
                                <TableHead>
                                    <TableHeader
                                        name={'ID'}
                                        direction={sort === 'id' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('id')}
                                    />
                                    <TableHeader name={'Author'} />
                                    <TableHeader name={'Message'} />
                                    <TableHeader name={'Sent At'} />
                                    <TableHeader />
                                </TableHead>

                                <TableBody>
                                    {messages !== undefined &&
                                        messages.items.length > 0 &&
                                        messages.items
                                            .map(message => (
                                                <TableRow key={message.id}>
                                                    <td
                                                        css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}
                                                    >
                                                        <CopyOnClick text={message.id}>
                                                            <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                                {message.id}
                                                            </code>
                                                        </CopyOnClick>
                                                    </td>
                                                    {message.author ? (
                                                        <td
                                                            css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}
                                                        >
                                                            <Link
                                                                to={`/admin/users/${message.author.id}`}
                                                                style={{ color: colors.primary }}
                                                                className={'hover:brightness-125 duration-300'}
                                                            >
                                                                {message.author.email}
                                                            </Link>
                                                        </td>
                                                    ) : (
                                                        <td
                                                            css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}
                                                        >
                                                            <Link
                                                                to={`/admin/users`}
                                                                style={{ color: colors.primary }}
                                                                className={'hover:brightness-125 duration-300'}
                                                            >
                                                                Ticket Owner
                                                            </Link>
                                                        </td>
                                                    )}
                                                    <td
                                                        css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}
                                                    >
                                                        {message.message.slice(0, 64)}
                                                        {message.message.length > 64 && '...'}
                                                    </td>
                                                    <td
                                                        css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}
                                                    >
                                                        {Math.abs(differenceInHours(message.created_at, new Date())) >
                                                        48
                                                            ? format(message.created_at!, 'MMM do, yyyy h:mma')
                                                            : formatDistanceToNow(message.created_at!, {
                                                                  addSuffix: true,
                                                              })}
                                                    </td>
                                                    <td
                                                        css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}
                                                    >
                                                        <Button onClick={() => setVisible(message.message)}>
                                                            Read Message
                                                        </Button>
                                                    </td>
                                                </TableRow>
                                            ))
                                            .toReversed()}
                                </TableBody>
                            </table>

                            {messages === undefined ? <Loading /> : messages.items.length < 1 ? <NoItems /> : null}
                        </div>
                    </Pagination>
                </ContentWrapper>
            </AdminTable>
        </>
    );
};

export default ({ ticketId }: { ticketId: number }) => {
    const hooks = useTableHooks<TicketMessageFilters>();

    return (
        <MessagesContext.Provider value={hooks}>
            <MessagesTable ticketId={ticketId} />
        </MessagesContext.Provider>
    );
};
