import { memo, useCallback, useState } from 'react';
import isEqual from 'react-fast-compare';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import InputSpinner from '@/elements/InputSpinner';
import { Textarea } from '@/elements/Input';
import Can from '@/elements/Can';
import { Button } from '@/elements/button/index';
import GreyRowBox from '@/elements/GreyRowBox';
import { type Allocation } from '@definitions/server';
import styled from 'styled-components';
import { debounce } from 'debounce';
import { setAllocationNotes, setPrimaryAllocation, getAllocations } from '@/api/routes/server/allocations';
import { useFlashKey } from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import CopyOnClick from '@/elements/CopyOnClick';
import DeleteAllocationButton from '@server/network/DeleteAllocationButton';
import { ip } from '@/lib/formatters';
import Code from '@/elements/Code';

const Label = styled.label`
    ${tw`uppercase text-xs mt-1 text-neutral-400 block px-1 select-none transition-colors duration-150`}
`;

interface Props {
    allocation: Allocation;
}

const AllocationRow = ({ allocation }: Props) => {
    const [loading, setLoading] = useState(false);
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('server:network');
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { mutate } = getAllocations();

    const onNotesChanged = useCallback((id: number, notes: string) => {
        mutate(data => data?.map(a => (a.id === id ? { ...a, notes } : a)), false);
    }, []);

    const doSetNotes = debounce((notes: string) => {
        setLoading(true);
        clearFlashes();

        setAllocationNotes(uuid, allocation.id, notes)
            .then(() => onNotesChanged(allocation.id, notes))
            .catch(error => clearAndAddHttpError(error))
            .then(() => setLoading(false));
    }, 750);

    const doSetPrimary = () => {
        clearFlashes();
        mutate(data => data?.map(a => ({ ...a, isDefault: a.id === allocation.id })), false);

        setPrimaryAllocation(uuid, allocation.id).catch(error => {
            clearAndAddHttpError(error);
            mutate();
        });
    };

    return (
        <GreyRowBox $hoverable={false} className={'mt-2 flex-wrap md:flex-nowrap'}>
            <div className={'flex w-full items-center md:w-auto'}>
                <div className={'pl-4 pr-6 text-neutral-400'}>
                    <FontAwesomeIcon icon={faNetworkWired} />
                </div>
                <div className={'mr-4 flex-1 md:w-40'}>
                    {allocation.alias ? (
                        <CopyOnClick text={allocation.alias}>
                            <Code dark className={'w-40 truncate'}>
                                {allocation.alias}
                            </Code>
                        </CopyOnClick>
                    ) : (
                        <CopyOnClick text={ip(allocation.ip)}>
                            <Code dark>{ip(allocation.ip)}</Code>
                        </CopyOnClick>
                    )}
                    <Label>{allocation.alias ? 'Hostname' : 'IP Address'}</Label>
                </div>
                <div className={'w-16 overflow-hidden md:w-24'}>
                    <Code dark>{allocation.port}</Code>
                    <Label>Port</Label>
                </div>
            </div>
            <div className={'mt-4 w-full md:mt-0 md:w-auto md:flex-1'}>
                <InputSpinner visible={loading}>
                    <Textarea
                        className={'border-transparent bg-neutral-800 hover:border-neutral-600'}
                        placeholder={'Notes'}
                        defaultValue={allocation.notes || undefined}
                        onChange={e => doSetNotes(e.currentTarget.value)}
                    />
                </InputSpinner>
            </div>
            <div className={'mt-4 flex w-full justify-end space-x-4 md:mt-0 md:w-48'}>
                {allocation.isDefault ? (
                    <Button size={Button.Sizes.Small} className={'!bg-blue-600 !text-slate-50'} disabled>
                        Primary
                    </Button>
                ) : (
                    <>
                        <Can action={'allocation.delete'}>
                            <DeleteAllocationButton allocation={allocation.id} />
                        </Can>
                        <Can action={'allocation.update'}>
                            <Button.Text size={Button.Sizes.Small} onClick={doSetPrimary}>
                                Make Primary
                            </Button.Text>
                        </Can>
                    </>
                )}
            </div>
        </GreyRowBox>
    );
};

export default memo(AllocationRow, isEqual);
