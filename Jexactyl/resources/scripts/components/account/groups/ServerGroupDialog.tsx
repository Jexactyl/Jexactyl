import { Dialog } from '@/elements/dialog';
import { Button } from '@/elements/button';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { faPlus, faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addServerToGroup, deleteServerGroup, getServerGroups } from '@/api/routes/server/groups';
import { type ServerGroup } from '@definitions/server';
import ModifyServerGroup from '@account/groups/ModifyServerGroup';
import Pill from '@/elements/Pill';
import Spinner from '@/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/elements/FlashMessageRender';

export interface VisibleDialog {
    open: 'index' | 'modify' | 'delete' | 'add' | 'none';
    serverId?: string;
}

interface Props {
    open: VisibleDialog;
    groups: ServerGroup[];
    setOpen: Dispatch<SetStateAction<VisibleDialog>>;
    setGroups: Dispatch<SetStateAction<ServerGroup[]>>;
}

export default ({ open, setOpen, groups, setGroups }: Props) => {
    const { clearAndAddHttpError, clearFlashes, addFlash } = useFlash();
    const [group, setGroup] = useState<ServerGroup | undefined>();

    useEffect(() => {
        getServerGroups().then(data => setGroups(data));
    }, [open.open === 'index']);

    const onDelete = (id: number) => {
        clearFlashes();

        deleteServerGroup(id)
            .then(() => {
                addFlash({ type: 'success', key: 'dashboard:groups', message: 'Server group deleted successfully.' });
                setOpen({ open: 'none' });
            })
            .catch(error => clearAndAddHttpError({ key: 'dashboard:groups', error }));
    };

    const onAdd = (id: number) => {
        clearFlashes();

        addServerToGroup(id, open.serverId!)
            .then(() => {
                addFlash({ type: 'success', key: 'dashboard:groups', message: 'Server group added successfully.' });
                setOpen({ open: 'none', serverId: undefined });

                window.location.reload();
            })
            .catch(error => clearAndAddHttpError({ key: 'dashboard:groups', error }));
    };

    if (!groups) return <Spinner size={'large'} centered />;

    return (
        <>
            <FlashMessageRender byKey={'dashboard:groups'} />
            <ModifyServerGroup open={open.open === 'modify'} group={group} setOpen={setOpen} />
            <Dialog open={open.open === 'add'} onClose={() => setOpen({ open: 'none' })} title={'Add group to server'}>
                {groups ? (
                    <div className={'my-3 grid grid-cols-2 lg:grid-cols-3 gap-4 cursor-pointer'}>
                        {groups?.map(group => (
                            <Pill size={'large'} type={'unknown'} key={group.id}>
                                <span style={{ color: group.color }}>{group.name}</span>
                                <div
                                    className={
                                        'absolute right-4 my-auto text-green-500/75 hover:text-green-400 transition duration-250'
                                    }
                                    onClick={() => {
                                        setGroup(group);
                                        onAdd(group.id);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPlusCircle} size={'sm'} />
                                </div>
                            </Pill>
                        ))}
                    </div>
                ) : (
                    <div className={'text-gray-400 mt-4 text-center font-semibold'}>
                        No groups exist on this account.
                    </div>
                )}
            </Dialog>
            <Dialog
                open={open.open === 'index'}
                onClose={() => setOpen({ open: 'none' })}
                title={'Server Group Configuration'}
            >
                <div className={'absolute top-4 right-16'}>
                    <Button size={Button.Sizes.Small} onClick={() => setOpen({ open: 'modify' })}>
                        <FontAwesomeIcon icon={faPlus} className={'mr-1'} /> Create
                    </Button>
                </div>
                {groups ? (
                    <div className={'my-3 grid grid-cols-2 lg:grid-cols-3 gap-4 cursor-pointer'}>
                        {groups?.map(group => (
                            <Pill size={'large'} key={group.id} type={'unknown'}>
                                <div
                                    key={group.id}
                                    onClick={() => {
                                        setGroup(group);
                                        setOpen({ open: 'modify' });
                                    }}
                                >
                                    <span style={{ color: group.color }}>{group.name}</span>
                                </div>
                                <div
                                    onClick={() => onDelete(group.id)}
                                    className={
                                        'absolute right-4 my-auto text-red-500/75 hover:text-red-400 transition duration-250'
                                    }
                                >
                                    <FontAwesomeIcon icon={faTrash} size={'sm'} />
                                </div>
                            </Pill>
                        ))}
                    </div>
                ) : (
                    <div className={'text-gray-400 mt-4 text-center font-semibold'}>
                        No groups exist on this account.
                    </div>
                )}
            </Dialog>
        </>
    );
};
