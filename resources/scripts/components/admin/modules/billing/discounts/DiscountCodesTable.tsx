import { useGetDiscountCodes, DiscountCodeContext } from '@/api/routes/admin/billing';
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
import CopyOnClick from '@/elements/CopyOnClick';
import tw from 'twin.macro';
import { useContext, useEffect } from 'react';
import useFlash from '@/plugins/useFlash';
import { DiscountCodeFilters } from '@/api/routes/admin/billing';
import { formatDistanceToNowStrict } from 'date-fns';
import { useStoreState } from '@/state/hooks';
import DiscountCodeDialog from './DiscountCodeDialog';
import DeleteDiscountCodeButton from './DeleteDiscountCodeButton';

function DiscountCodesTable() {
    const { data: orders, error } = useGetDiscountCodes();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { setSort, sort, setPage, sortDirection, setFilters } = useContext(DiscountCodeContext);

    const currency = useStoreState(state => state.everest.data!.billing.currency.symbol);

    const onSearch = (query: string): Promise<void> => {
        return new Promise(resolve => {
            if (query.length < 2) {
                setFilters(null);
            } else {
                setFilters({ code: query });
            }
            return resolve();
        });
    };

    useEffect(() => {
        if (!error) {
            clearFlashes('admin:billing:discount-codes');
            return;
        }

        clearAndAddHttpError({ key: 'admin:billing:discount-codes', error });
    }, [error]);

    return (
        <>
            <AdminTable>
                <ContentWrapper onSearch={onSearch}>
                    <Pagination data={orders} onPageSelect={setPage}>
                        <div css={tw`overflow-x-auto`}>
                            <table css={tw`w-full table-auto`}>
                                <TableHead>
                                    <TableHeader
                                        name={'ID'}
                                        direction={sort === 'id' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('id')}
                                    />
                                    <TableHeader name={'Code'} />
                                    <TableHeader name={'Discount'} />
                                    <TableHeader name={'Uses Left'} />
                                    <TableHeader name={'Expires At'} />
                                    <TableHeader name={'Created At'} />
                                    <TableHeader />
                                </TableHead>
                                <TableBody>
                                    {orders !== undefined &&
                                        orders.items.length > 0 &&
                                        orders.items.map(discountCode => (
                                            <TableRow key={discountCode.id}>
                                                {
                                                    <>
                                                        {console.log(
                                                            discountCode.expires_at,
                                                            typeof discountCode.expires_at,
                                                        )}
                                                    </>
                                                }

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <CopyOnClick text={discountCode.id}>
                                                        <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                            {discountCode.id}
                                                        </code>
                                                    </CopyOnClick>
                                                </td>
                                                <td className={'px-6 py-4'}>
                                                    <CopyOnClick text={discountCode.code}>
                                                        <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                            {discountCode.code}
                                                        </code>
                                                    </CopyOnClick>
                                                </td>
                                                <td className={'px-6 py-4'}>
                                                    {discountCode.value}
                                                    {discountCode.type === 'percentage' ? '%' : currency} off
                                                </td>
                                                <td className={'px-6 py-4'}>
                                                    {discountCode.uses ? `${discountCode.uses} remaining` : 'Unlimited'}
                                                </td>
                                                <td className={'px-6 py-4'}>
                                                    {discountCode.expires_at
                                                        ? formatDistanceToNowStrict(discountCode.expires_at, {
                                                              addSuffix: true,
                                                          })
                                                        : 'No Expiration'}
                                                </td>
                                                <td className={'px-6 py-4'}>
                                                    {formatDistanceToNowStrict(discountCode.created_at, {
                                                        addSuffix: true,
                                                    })}
                                                </td>
                                                <td className={'px-6 py-4'}>
                                                    <DiscountCodeDialog discountCode={discountCode} />
                                                    <DeleteDiscountCodeButton id={discountCode.id} />
                                                </td>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </table>
                            {orders === undefined ? <Loading /> : orders.items.length < 1 ? <NoItems /> : null}
                        </div>
                    </Pagination>
                </ContentWrapper>
            </AdminTable>
        </>
    );
}

export default () => {
    const hooks = useTableHooks<DiscountCodeFilters>();

    return (
        <DiscountCodeContext.Provider value={hooks}>
            <DiscountCodesTable />
        </DiscountCodeContext.Provider>
    );
};
