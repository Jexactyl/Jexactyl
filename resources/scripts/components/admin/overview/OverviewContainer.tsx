import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';

import type { VersionData } from '@/api/admin/getVersion';
import getVersion from '@/api/admin/getVersion';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import { faDesktop } from '@fortawesome/free-solid-svg-icons';
import AdminBox from '../AdminBox';
import Spinner from '@/components/elements/Spinner';
import CopyOnClick from '@/components/elements/CopyOnClick';

const Code = ({ children }: { children: ReactNode }) => {
    return (
        <code css={tw`text-sm font-mono bg-neutral-900 rounded`} style={{ padding: '2px 6px' }}>
            {children}
        </code>
    );
};

export default () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [loading, setLoading] = useState<boolean>(true);
    const [versionData, setVersionData] = useState<VersionData | undefined>(undefined);

    useEffect(() => {
        clearFlashes('overview');

        getVersion()
            .then(versionData => setVersionData(versionData))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'overview', error });
            })
            .then(() => setLoading(false));
    }, []);

    return (
        <AdminContentBlock title={'Overview'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Overview</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        A quick glance at your system.
                    </p>
                </div>
            </div>

            <FlashMessageRender byKey={'overview'} css={tw`mb-4`} />

            <AdminBox title={'Version Information'} icon={faDesktop}>
                {loading ? (
                    <Spinner size={'large'} centered />
                ) : (
                    <>
                        You are currently running version&nbsp;
                        <CopyOnClick text={versionData?.panel.current}>
                            <Code>{versionData?.panel.current}</Code>
                        </CopyOnClick>
                        , with the latest release being &nbsp;
                        <CopyOnClick text={versionData?.panel.latest}>
                            <Code>{versionData?.panel.latest}</Code>
                        </CopyOnClick>
                        .
                    </>
                )}
            </AdminBox>
        </AdminContentBlock>
    );
};
