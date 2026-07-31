import { useCallback, useContext, useEffect, useState } from 'react';
import { debounce } from 'debounce';
import { Link } from 'react-router-dom';
import tw from 'twin.macro';
import Pill, { PillStatus } from '@/elements/Pill';
import Input from '@/elements/Input';
import CopyOnClick from '@/elements/CopyOnClick';
import AdminTable, {
    ContentWrapper,
    Pagination,
    TableHead,
    TableHeader,
    TableBody,
    TableRow,
    Loading,
    NoItems,
    useTableHooks,
} from '@/elements/AdminTable';
import useFlash from '@/plugins/useFlash';
import { formatDistanceToNowStrict } from 'date-fns';
import { InvoiceContext, InvoiceFilters, useGetInvoices, downloadInvoice } from '@/api/routes/admin/billing';
import { DownloadIcon } from '@heroicons/react/outline';

function type(state: string | null): PillStatus {
    switch (state) {
        case 'processed':
            return 'success';
        case 'failed':
            return 'danger';
        case 'pending':
            return 'warn';
        default:
            return 'unknown';
    }
}

const FilterField = ({
    label,
    placeholder,
    value,
    onChange,
}: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
}) => {
    const [text, setText] = useState(value);

    useEffect(() => {
        setText(value);
    }, [value]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debounced = useCallback(
        debounce((query: string) => onChange(query), 250),
        [onChange],
    );

    return (
        <label css={tw`flex flex-col w-full sm:w-52`}>
            <span css={tw`mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400`}>{label}</span>
            <Input
                css={tw`h-8`}
                placeholder={placeholder}
                value={text}
                onChange={e => {
                    setText(e.currentTarget.value);
                    debounced(e.currentTarget.value);
                }}
            />
        </label>
    );
};

function InvoicesTable() {
    const { data: invoices, error } = useGetInvoices();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { setSort, sort, setPage, sortDirection, filters, setFilters } = useContext(InvoiceContext);
    const [downloading, setDownloading] = useState<number | null>(null);

    const onSearch = (query: string): Promise<void> => {
        return new Promise(resolve => {
            setFilters(current => ({ ...current, number: query || undefined }));
            return resolve();
        });
    };

    const download = (id: number, number: string | null) => {
        setDownloading(id);

        downloadInvoice(id, `${number ?? id}.pdf`)
            .catch(error => clearAndAddHttpError({ key: 'admin:billing:invoices', error }))
            .then(() => setDownloading(null));
    };

    useEffect(() => {
        if (!error) {
            clearFlashes('admin:billing:invoices');
            return;
        }

        clearAndAddHttpError({ key: 'admin:billing:invoices', error });
    }, [error]);

    return (
        <AdminTable>
            <div css={tw`flex flex-wrap items-end gap-4 px-6 py-4`}>
                <FilterField
                    label={'Billed To'}
                    placeholder={'Filter by username or email...'}
                    value={filters?.user ?? ''}
                    onChange={value => setFilters(current => ({ ...current, user: value || undefined }))}
                />
                <FilterField
                    label={'Status'}
                    placeholder={'pending, processed, failed, expired...'}
                    value={filters?.status ?? ''}
                    onChange={value => setFilters(current => ({ ...current, status: value || undefined }))}
                />
            </div>
            <ContentWrapper onSearch={onSearch}>
                <Pagination data={invoices} onPageSelect={setPage}>
                    <div css={tw`overflow-x-auto`}>
                        <table css={tw`w-full table-auto`}>
                            <TableHead>
                                <TableHeader
                                    name={'Invoice #'}
                                    direction={sort === 'number' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('number')}
                                />
                                <TableHeader name={'Billed To'} />
                                <TableHeader name={'Total'} />
                                <TableHeader name={'Status'} />
                                <TableHeader
                                    name={'Generated At'}
                                    direction={sort === 'generated_at' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('generated_at')}
                                />
                                <TableHeader />
                            </TableHead>
                            <TableBody>
                                {invoices !== undefined &&
                                    invoices.items.length > 0 &&
                                    invoices.items.map(invoice => (
                                        <TableRow key={invoice.id}>
                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                <CopyOnClick text={invoice.number ?? invoice.id}>
                                                    <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                        {invoice.number ?? `#${invoice.id}`}
                                                    </code>
                                                </CopyOnClick>
                                            </td>
                                            <td css={tw`px-6 py-4`}>
                                                {invoice.user.id ? (
                                                    <Link
                                                        to={`/admin/users/${invoice.user.id}`}
                                                        css={tw`hover:brightness-125`}
                                                    >
                                                        {invoice.user.username ?? invoice.user.email ?? 'Unknown'}
                                                    </Link>
                                                ) : (
                                                    invoice.user.username ?? invoice.user.email ?? 'Unknown'
                                                )}
                                            </td>
                                            <td css={tw`px-6 py-4 text-white font-bold`}>
                                                {invoice.total !== null ? `$${invoice.total}` : '—'}
                                            </td>
                                            <td css={tw`px-6 py-4 text-left`}>
                                                {invoice.status ? (
                                                    <Pill size={'small'} type={type(invoice.status)}>
                                                        {invoice.status}
                                                    </Pill>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td css={tw`px-6 py-4`}>
                                                {invoice.generated_at
                                                    ? formatDistanceToNowStrict(invoice.generated_at, {
                                                          addSuffix: true,
                                                      })
                                                    : 'Pending'}
                                            </td>
                                            <td css={tw`pr-6 py-4 text-right`}>
                                                <button
                                                    type={'button'}
                                                    aria-label={'Download invoice'}
                                                    disabled={downloading === invoice.id}
                                                    onClick={() => download(invoice.id, invoice.number)}
                                                    css={tw`text-neutral-400 hover:text-neutral-100 transition-colors duration-150 disabled:opacity-50`}
                                                >
                                                    <DownloadIcon css={tw`w-5 h-5`} />
                                                </button>
                                            </td>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </table>
                        {invoices === undefined ? <Loading /> : invoices.items.length < 1 ? <NoItems /> : null}
                    </div>
                </Pagination>
            </ContentWrapper>
        </AdminTable>
    );
}

export default () => {
    const hooks = useTableHooks<InvoiceFilters>();

    return (
        <InvoiceContext.Provider value={hooks}>
            <InvoicesTable />
        </InvoiceContext.Provider>
    );
};
