import tw from 'twin.macro';
import { Link, NavLink } from 'react-router-dom';
import { AdminContext } from '@/state/admin';
import { useContext, ChangeEvent, useEffect, useState } from 'react';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import AdminTable, {
    ContentWrapper,
    Loading,
    NoItems,
    Pagination,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/admin/AdminTable';
import { useGetTickets, Context as TicketContext, TicketStatus } from '@/api/admin/tickets/getTickets';
import AdminCheckbox from '../AdminCheckbox';
import { Button } from '@/components/elements/button';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import classNames from 'classnames';
import Select from '@/components/elements/Select';
import AdminBox from '../AdminBox';
import { faGears } from '@fortawesome/free-solid-svg-icons';
import Label from '@/components/elements/Label';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from '@/state/hooks';
import FlashMessageRender from '@/components/FlashMessageRender';
import Spinner from '@/components/elements/Spinner';
import { CheckCircleIcon } from '@heroicons/react/outline';
import updateTicketSettings from '@/api/admin/tickets/updateTicketSettings';

function RowCheckbox({ id }: { id: number }) {
    const isChecked = AdminContext.useStoreState(state => state.tickets.selectedTickets.indexOf(id) >= 0);
    const appendSelectedTicket = AdminContext.useStoreActions(actions => actions.tickets.appendSelectedTicket);
    const removeSelectedTicket = AdminContext.useStoreActions(actions => actions.tickets.removeSelectedTicket);

    return (
        <AdminCheckbox
            name={id.toString()}
            checked={isChecked}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.currentTarget.checked) {
                    appendSelectedTicket(id);
                } else {
                    removeSelectedTicket(id);
                }
            }}
        />
    );
}

export const statusToColor = (status: TicketStatus): string => {
    switch (status) {
        case 'in-progress':
            return 'bg-yellow-200 text-yellow-800';
        case 'unresolved':
            return 'bg-red-200 text-red-800';
        case 'resolved':
            return 'bg-green-200 text-green-800';
        default:
            return 'bg-gray-400 text-gray-800';
    }
};

export default () => {
    const { data: tickets } = useGetTickets();
    const { page, setPage, setFilters, sort, setSort, sortDirection } = useContext(TicketContext);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const enabled = useStoreState(state => state.everest.data!.tickets.enabled);

    const update = async (key: string, value: any) => {
        clearFlashes();
        setLoading(true);
        setSuccess(false);

        updateTicketSettings(key, value)
            .then(() => {
                setSuccess(true);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                clearAndAddHttpError({ key: 'tickets', error });
            });

        setTimeout(() => setSuccess(false), 2000);
    };
    const setSelectedTickets = AdminContext.useStoreActions(actions => actions.tickets.setSelectedTickets);
    const selectedTicketsLength = AdminContext.useStoreState(state => state.tickets.selectedTickets.length);

    const onSelectAllClick = (e: ChangeEvent<HTMLInputElement>) => {
        setSelectedTickets(e.currentTarget.checked ? tickets?.items?.map(ticket => ticket.id) || [] : []);
    };

    const onSearch = (query: string): Promise<void> => {
        return new Promise(resolve => {
            if (query.length < 2) {
                setFilters(null);
            } else {
                // setFilters({ title: query });
            }
            return resolve();
        });
    };

    useEffect(() => {
        setSelectedTickets([]);
    }, [page]);

    return (
        <AdminContentBlock title={'Tickets'}>
            <div className={'w-full flex flex-row items-center mb-8'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>Tickets</h2>
                    <p className={'text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'}>
                        Update settings and manage user tickets.
                    </p>
                </div>
                <div css={tw`flex ml-auto pl-4`}>
                    <Link to={'/admin/tickets/new'}>
                        <Button>New Ticket</Button>
                    </Link>
                </div>
            </div>
            <AdminBox title={'Ticket Options'} icon={faGears} className={'mb-10'}>
                <FlashMessageRender byKey={'tickets'} className={'my-2'} />
                {loading && <Spinner className={'absolute top-0 right-0 m-3.5'} size={'small'} />}
                {success && <CheckCircleIcon className={'w-5 h-5 absolute top-0 right-0 m-3.5 text-green-500'} />}
                <div className={'grid lg:grid-cols-3 gap-4'}>
                    <div>
                        <Label>Allow Ticket Creation</Label>
                        <Select id={'enabled'} name={'enabled'} onChange={e => update('enabled', e.target.value)}>
                            <option value={1} selected={enabled}>
                                Enabled
                            </option>
                            <option value={0} selected={!enabled}>
                                Disabled
                            </option>
                        </Select>
                        <p className={'text-xs text-gray-400 mt-1'}>Toggle whether users can create tickets.</p>
                    </div>
                </div>
            </AdminBox>
            <AdminTable>
                <ContentWrapper
                    onSearch={onSearch}
                    onSelectAllClick={onSelectAllClick}
                    checked={selectedTicketsLength === (tickets?.items.length === 0 ? -1 : tickets?.items.length)}
                >
                    <Pagination data={tickets} onPageSelect={setPage}>
                        <div css={tw`overflow-x-auto`}>
                            <table css={tw`w-full table-auto`}>
                                <TableHead>
                                    <TableHeader
                                        name={'ID'}
                                        direction={sort === 'id' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('id')}
                                    />
                                    <TableHeader
                                        name={'Title'}
                                        direction={sort === 'title' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('title')}
                                    />
                                    <TableHeader
                                        name={'Created At'}
                                        direction={sort === 'created_at' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('created_at')}
                                    />
                                    <TableHeader
                                        name={'Status'}
                                        direction={sort === 'status' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('status')}
                                    />
                                </TableHead>
                                <TableBody>
                                    {tickets !== undefined &&
                                        tickets.items.length > 0 &&
                                        tickets.items.map(ticket => (
                                            <TableRow key={ticket.id}>
                                                <td css={tw`pl-6`}>
                                                    <RowCheckbox id={ticket.id} />
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <CopyOnClick text={ticket.id}>
                                                        <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                            {ticket.id}
                                                        </code>
                                                    </CopyOnClick>
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <NavLink
                                                        to={`/admin/tickets/${ticket.id}`}
                                                        css={tw`text-primary-400 hover:text-primary-300`}
                                                    >
                                                        {ticket.title}
                                                    </NavLink>
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    {Math.abs(differenceInHours(ticket.createdAt, new Date())) > 48
                                                        ? format(ticket.createdAt, 'MMM do, yyyy h:mma')
                                                        : formatDistanceToNow(ticket.createdAt, { addSuffix: true })}
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <span
                                                        className={classNames(
                                                            statusToColor(ticket.status),
                                                            'capitalize px-2 inline-flex text-xs leading-5 font-medium rounded-full',
                                                        )}
                                                    >
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </table>

                            {tickets === undefined ? <Loading /> : tickets.items.length < 1 ? <NoItems /> : null}
                        </div>
                    </Pagination>
                </ContentWrapper>
            </AdminTable>
        </AdminContentBlock>
    );
};
