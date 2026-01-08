import { SubNavigation, SubNavigationLink } from '@/components/admin/SubNavigation';
import AdminContentBlock from '@/elements/AdminContentBlock';
import { AdjustmentsIcon, TerminalIcon } from '@heroicons/react/outline';
import ServerPresetsTable from './ServerPresetsTable';
import ServerPresetDialog from './ServerPresetDialog';

export default () => (
    <AdminContentBlock title={'New Server'} showFlashKey={'admin:servers:presets'}>
        <div className={`w-full flex flex-row items-center mb-8`}>
            <div className={`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                <h2 className={`text-2xl text-neutral-50 font-header font-medium`}>Server Presets</h2>
                <p
                    className={`hidden md:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}
                >
                    Control preset server configurations for administrators.
                </p>
            </div>
            <div className={`flex ml-auto pl-4`}>
                <ServerPresetDialog />
            </div>
        </div>

        <SubNavigation>
            <SubNavigationLink to="/admin/servers" name="All Servers" base>
                <TerminalIcon />
            </SubNavigationLink>
            <SubNavigationLink to="/admin/servers/presets" name="Presets">
                <AdjustmentsIcon />
            </SubNavigationLink>
        </SubNavigation>

        <ServerPresetsTable />
    </AdminContentBlock>
);
