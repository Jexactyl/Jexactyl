import { getLinks, type Values, Context as LinksContext, CustomLink } from '@/api/routes/admin/links';
import { useStoreState } from '@/state/hooks';
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
import { Dispatch, SetStateAction, useContext } from 'react';
import tw from 'twin.macro';
import { VisibleDialog } from './LinksContainer';
import Pill from '@/elements/Pill';
import { Button } from '@/elements/button';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
    setOpen: Dispatch<SetStateAction<VisibleDialog>>;
    setLink: Dispatch<SetStateAction<CustomLink | null>>;
}

const LinksTable = ({ setOpen, setLink }: Props) => {
    const { data: links, error, isValidating } = getLinks();
    const { colors } = useStoreState(state => state.theme.data!);
    const { setPage, sort, sortDirection, setSort, setFilters } = useContext(LinksContext);

    const length = links?.items?.length || 0;

    const onSearch = (query: string): Promise<void> => {
        return new Promise(resolve => {
            if (query.length < 2) {
                setFilters(null);
            } else {
                setPage(1);
                setFilters({
                    name: query,
                });
            }
            return resolve();
        });
    };

    return (
        <AdminTable>
            <ContentWrapper onSearch={onSearch}>
                <Pagination data={links} onPageSelect={setPage}>
                    <div css={tw`overflow-x-auto`}>
                        <table css={tw`w-full table-auto`}>
                            <TableHead>
                                <TableHeader
                                    name={'ID'}
                                    direction={sort === 'id' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('id')}
                                />
                                <TableHeader
                                    name={'Name'}
                                    direction={sort === 'name' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('name')}
                                />
                                <TableHeader
                                    name={'URL'}
                                    direction={sort === 'url' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('url')}
                                />
                                <TableHeader
                                    name={'Is Visible'}
                                    direction={sort === 'visibe' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('visible')}
                                />
                                <TableHeader name={'Actions'} />
                            </TableHead>

                            <TableBody>
                                {links !== undefined &&
                                    !error &&
                                    !isValidating &&
                                    length > 0 &&
                                    links.items.map(link => (
                                        <TableRow key={link.id}>
                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                    {link.id}
                                                </code>
                                            </td>
                                            <td
                                                css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap font-bold hover:brightness-125`}
                                                style={{ color: colors.primary }}
                                            >
                                                {link.name}
                                            </td>
                                            <td
                                                css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap font-bold hover:brightness-125`}
                                            >
                                                {link.url}
                                            </td>
                                            <td
                                                css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap font-bold hover:brightness-125`}
                                            >
                                                {link.visible ? (
                                                    <Pill type={'success'}>Visible</Pill>
                                                ) : (
                                                    <Pill type={'danger'}>Hidden</Pill>
                                                )}
                                            </td>
                                            <td className={'px-6 py-4 space-x-3'}>
                                                <Button
                                                    onClick={() => {
                                                        setLink(link);
                                                        setOpen('update');
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faPencil} className={'text-white'} />
                                                </Button>
                                                <Button.Danger
                                                    onClick={() => {
                                                        setLink(link);
                                                        setOpen('delete');
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </Button.Danger>
                                            </td>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </table>

                        {links === undefined || (error && isValidating) ? <Loading /> : length < 1 ? <NoItems /> : null}
                    </div>
                </Pagination>
            </ContentWrapper>
        </AdminTable>
    );
};

export default ({ setOpen, setLink }: Props) => {
    const hooks = useTableHooks<Values>();

    return (
        <LinksContext.Provider value={hooks}>
            <LinksTable setLink={setLink} setOpen={setOpen} />
        </LinksContext.Provider>
    );
};
