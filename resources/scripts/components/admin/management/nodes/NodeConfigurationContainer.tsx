import { faClipboard, faCode } from '@fortawesome/free-solid-svg-icons';
import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import tw from 'twin.macro';
import { getNodeConfiguration } from '@/api/routes/admin/nodes';
import AdminBox from '@/elements/AdminBox';
import { Alert } from '@/elements/alert';
import { Context } from '@admin/management/nodes/NodeRouter';
import CopyOnClick from '@/elements/CopyOnClick';
import type { ApplicationStore } from '@/state';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default () => {
    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    const [configuration, setConfiguration] = useState('');
    const [searchParams] = useSearchParams();

    const node = Context.useStoreState(state => state.node);

    if (node === undefined) {
        return <></>;
    }

    useEffect(() => {
        clearFlashes('node');

        getNodeConfiguration(node.id)
            .then(configuration => setConfiguration(configuration))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'node', error });
            });
    }, []);

    return (
        <>
            {searchParams.get('setup') === 'true' && (
                <Alert type={'info'} css={tw`mb-4`}>
                    Your node has been created. Copy the configuration below and paste it into&nbsp;
                    <code className={'mx-1'}>/etc/pterodactyl/config.yml</code>&nbsp;on your new node to complete setup.
                </Alert>
            )}

            <AdminBox title={'Configuration'} icon={faCode} css={tw`mb-4`}>
                <div css={tw`relative`}>
                    <div css={tw`absolute top-0 right-0`}>
                        <CopyOnClick text={configuration} showInNotification={false}>
                            <FontAwesomeIcon
                                icon={faClipboard}
                                className={'p-4 text-gray-400 hover:text-gray-200 duration-300'}
                            />
                        </CopyOnClick>
                    </div>
                    <pre css={tw`text-sm rounded font-mono bg-neutral-900 shadow-md px-4 py-3 overflow-x-auto`}>
                        {configuration}
                    </pre>
                </div>
            </AdminBox>

            {searchParams.get('setup') === 'true' && (
                <Alert type={'info'} css={tw`mb-4`}>
                    After this is done, you&apos;ll need to set up Allocations for servers to connect to. Click 'Allocations' at the top of your screen.
                </Alert>
            )}
        </>
    );
};
