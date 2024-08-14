import { NavLink } from 'react-router-dom';
import tw from 'twin.macro';
import type { Filters } from '@/api/admin/databases/getDatabases';
import { Context as DatabasesContext } from '@/api/admin/databases/getDatabases';
import FlashMessageRender from '@/components/FlashMessageRender';
import AdminContentBlock from '@elements/AdminContentBlock';
import { useTableHooks } from '@elements/AdminTable';
import { Button } from '@elements/button';
import { Size } from '@elements/button/types';
import DatabasesTable from './DatabasesTable';

interface Props {
    filters?: Filters;
}

const DatabasesContainer = () => {
    return (
        <AdminContentBlock title={'Databases'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Database Hosts</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        Database hosts that servers can have databases created on.
                    </p>
                </div>

                <div css={tw`flex ml-auto pl-4`}>
                    <NavLink to="/admin/databases/new">
                        <Button type="button" size={Size.Large} css={tw`h-10 px-4 py-0 whitespace-nowrap`}>
                            New Database Host
                        </Button>
                    </NavLink>
                </div>
            </div>

            <FlashMessageRender byKey={'databases'} css={tw`mb-4`} />

            <DatabasesTable />
        </AdminContentBlock>
    );
};

export default ({ filters }: Props) => {
    const hooks = useTableHooks<Filters>(filters);

    return (
        <DatabasesContext.Provider value={hooks}>
            <DatabasesContainer />
        </DatabasesContext.Provider>
    );
};
