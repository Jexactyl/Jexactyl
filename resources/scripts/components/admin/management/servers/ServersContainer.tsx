import { NavLink } from 'react-router-dom';
import tw from 'twin.macro';
import FlashMessageRender from '@/elements/FlashMessageRender';
import AdminContentBlock from '@/elements/AdminContentBlock';
import ServersTable from '@admin/management/servers/ServersTable';
import { Button } from '@/elements/button';
import { AdjustmentsIcon, TerminalIcon } from '@heroicons/react/outline';
import { SubNavigation, SubNavigationLink } from '@admin/SubNavigation';
import PresetCreationDialog from './PresetCreationDialog';

export default () => (
    <AdminContentBlock title={'Servers'}>
        <div css={tw`w-full flex flex-row items-center mb-8`}>
            <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Servers</h2>
                <p
                    css={tw`hidden md:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}
                >
                    All servers available on the system.
                </p>
            </div>

            <div css={tw`flex ml-auto pl-4 space-x-4`}>
                <NavLink to={`/admin/servers/new`}>
                    <Button.Text type={'button'} size={Button.Sizes.Large} css={tw`h-10 px-4 py-0 whitespace-nowrap`}>
                        Create Server
                    </Button.Text>
                </NavLink>
                <PresetCreationDialog />
            </div>
        </div>

        <FlashMessageRender byKey={'servers'} css={tw`mb-4`} />

        <SubNavigation>
            <SubNavigationLink to="/admin/servers" name="All Servers" base>
                <TerminalIcon />
            </SubNavigationLink>
            <SubNavigationLink to="/admin/servers/presets" name="Presets">
                <AdjustmentsIcon />
            </SubNavigationLink>
        </SubNavigation>

        <ServersTable />
    </AdminContentBlock>
);
