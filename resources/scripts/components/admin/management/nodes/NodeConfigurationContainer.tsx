import { faClipboard, faCode } from '@fortawesome/free-solid-svg-icons';
import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';
import getNodeConfiguration from '@/api/admin/nodes/getNodeConfiguration';
import AdminBox from '@elements/AdminBox';
import { Context } from '@admin/management/nodes/NodeRouter';
import CopyOnClick from '@elements/CopyOnClick';
import type { ApplicationStore } from '@/state';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default () => {
    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    const [configuration, setConfiguration] = useState('');

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
        </>
    );
};
