import { BillingExceptionFilters } from '@/api/routes/admin/billing/types';
import AdminTable, {
    ContentWrapper,
    Loading,
    NoItems,
    Pagination,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    useTableHooks,
} from '@/elements/AdminTable';
import { useContext, useState } from 'react';
import {
    Context as BillingExceptionContext,
    resolveBillingException,
    useGetBillingExceptions,
} from '@/api/routes/admin/billing/exceptions';
import CopyOnClick from '@/elements/CopyOnClick';
import tw from 'twin.macro';
import { formatDistanceToNowStrict } from 'date-fns';
import { Button } from '@/elements/button';
import { CheckCircleIcon } from '@heroicons/react/outline';
import Pill, { PillStatus } from '@/elements/Pill';
import { BillingExceptionType } from '@definitions/admin';

function getColor(type: BillingExceptionType): PillStatus {
    switch (type) {
        case 'deployment':
            return 'info';
        case 'payment':
            return 'warn';
        case 'storefront':
            return 'success';
        default:
            return 'unknown';
    }
}

function BillingExceptionTable() {
    const { data: exceptions } = useGetBillingExceptions();
    const [resolved, setResolved] = useState<number[]>([]);
    const { setPage, setFilters, sort, setSort, sortDirection } = useContext(BillingExceptionContext);

    const onSearch = (query: string): Promise<void> => {
        return new Promise(resolve => {
            if (query.length < 2) {
                setFilters(null);
            } else {
                setFilters({ title: query });
            }
            return resolve();
        });
    };

    return (
        <AdminTable>
            <ContentWrapper onSearch={onSearch}>
                <Pagination data={exceptions} onPageSelect={setPage}>
                    <div css={tw`overflow-x-auto`}>
                        <table css={tw`w-full table-auto`}>
                            <TableHead>
                                <TableHeader
                                    name={'ID'}
                                    direction={sort === 'id' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('id')}
                                />
                                <TableHeader name={'Exception'} />
                                <TableHeader name={'Resolution'} />
                                <TableHeader
                                    name={'Type'}
                                    direction={sort === 'exception_type' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('exception_type')}
                                />
                                <TableHeader
                                    name={'Created At'}
                                    direction={sort === 'created_at' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('created_at')}
                                />
                                <TableHeader />
                            </TableHead>
                            <TableBody>
                                {exceptions !== undefined &&
                                    exceptions.items.length > 0 &&
                                    exceptions.items.map(exception => (
                                        <TableRow key={exception.id}>
                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                <CopyOnClick text={exception.id}>
                                                    <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                        {exception.id}
                                                    </code>
                                                </CopyOnClick>
                                            </td>
                                            <td className={'px-6 py-4 text-white font-bold'}>{exception.title}</td>
                                            <td className={'px-6 py-4'}>{exception.description}</td>
                                            <td className={'px-6 py-4'}>
                                                <Pill type={getColor(exception.exception_type)}>
                                                    {exception.exception_type}
                                                </Pill>
                                            </td>
                                            <td className={'px-6 py-4'}>
                                                {formatDistanceToNowStrict(exception.created_at, { addSuffix: true })}
                                            </td>
                                            <td className={'px-6 py-4'}>
                                                {resolved.includes(exception.id) ? (
                                                    <Button.Text
                                                        size={Button.Sizes.Small}
                                                        className={'text-white font-bold'}
                                                        disabled
                                                    >
                                                        <CheckCircleIcon className={'w-4 h-4 mt-[2px] mr-0.5'} />{' '}
                                                        Resolved
                                                    </Button.Text>
                                                ) : (
                                                    <Button
                                                        size={Button.Sizes.Small}
                                                        className={'text-white font-bold'}
                                                        onClick={() => {
                                                            resolveBillingException(exception.uuid);
                                                            setResolved(prevResolved => [
                                                                ...prevResolved,
                                                                exception.id,
                                                            ]);
                                                        }}
                                                    >
                                                        <CheckCircleIcon className={'w-4 h-4 mt-[2px] mr-0.5'} />{' '}
                                                        Resolve
                                                    </Button>
                                                )}
                                            </td>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </table>
                        {exceptions === undefined ? <Loading /> : exceptions.items.length < 1 ? <NoItems /> : null}
                    </div>
                </Pagination>
            </ContentWrapper>
        </AdminTable>
    );
}

export default () => {
    const hooks = useTableHooks<BillingExceptionFilters>();

    return (
        <BillingExceptionContext.Provider value={hooks}>
            <BillingExceptionTable />
        </BillingExceptionContext.Provider>
    );
};
