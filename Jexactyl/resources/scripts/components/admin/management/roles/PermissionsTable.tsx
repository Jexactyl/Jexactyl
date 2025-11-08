import { getRolePermisisons, updateRole } from '@/api/routes/admin/roles';
import Spinner from '@/elements/Spinner';
import { useEffect, useState } from 'react';
import { PanelPermissions } from '@/state/server/permissions';
import AdminBox from '@/elements/AdminBox';
import Checkbox from '@/elements/inputs/Checkbox';
import Tooltip from '@/elements/tooltip/Tooltip';
import { Button } from '@/elements/button';
import { UserRole } from '@definitions/admin';
import SpinnerOverlay from '@/elements/SpinnerOverlay';

export default ({ role }: { role: UserRole }) => {
    const [permissions, setPermissions] = useState<PanelPermissions>();
    const [selected, setSelected] = useState<string[] | undefined>(role.permissions);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const updateSelected = (value: string) => {
        setSelected(selected => {
            const current = selected ?? [];
            if (current.includes(value)) {
                return current.filter(v => v !== value);
            } else {
                return [value, ...current];
            }
        });
    };

    const save = () => {
        setSubmitting(true);
        updateRole(role.id, role.name, role.description, role.color, selected).then(() => setSubmitting(false));
    };

    useEffect(() => {
        getRolePermisisons().then(data => setPermissions(data.attributes.permissions));
    }, []);

    if (!permissions || !role) return <Spinner size={'large'} centered />;

    return (
        <>
            <div className={'grid lg:grid-cols-4 gap-4'}>
                <SpinnerOverlay visible={submitting} />
                {Object.keys(permissions).map(key => {
                    const keys = Object.keys(permissions[key]?.keys ?? {});
                    const allSelected = keys.every(pkey => selected?.includes(`${key}.${pkey}`));
                    const someSelected = keys.some(pkey => selected?.includes(`${key}.${pkey}`));
                    const handleSelectAll = () => {
                        setSelected(selected => {
                            const current = selected ?? [];
                            if (allSelected) {
                                // Remove all keys in this group
                                return current.filter(v => !keys.map(pkey => `${key}.${pkey}`).includes(v));
                            } else {
                                // Add all keys in this group
                                const toAdd = keys.map(pkey => `${key}.${pkey}`).filter(k => !current.includes(k));
                                return [...current, ...toAdd];
                            }
                        });
                    };
                    return (
                        <AdminBox
                            title={key[0]?.toUpperCase() + key.slice(1, key.length).toString()}
                            key={key}
                            className={'relative'}
                        >
                            <p className={'mb-4 text-gray-400 text-xs'}>{permissions[key]?.description}</p>
                            <div className={'absolute top-0 right-0 pt-2 pr-4'}>
                                <Checkbox
                                    id={`select-all-${key}`}
                                    checked={allSelected}
                                    indeterminate={!allSelected && someSelected}
                                    onChange={handleSelectAll}
                                />
                            </div>
                            <div className={'px-1'}>
                                {keys.map(pkey => (
                                    <div key={`${key}.${pkey}`}>
                                        <Checkbox
                                            id={`${key}.${pkey}`}
                                            checked={selected?.includes(`${key}.${pkey}`) ?? false}
                                            name={`${key}.${pkey}`}
                                            onChange={() => updateSelected(`${key}.${pkey}`)}
                                        />
                                        <Tooltip placement={'top'} content={permissions[key]?.keys[pkey] ?? ''}>
                                            <div
                                                className={'inline-flex my-auto ml-2 font-semibold'}
                                            >{`${key}.${pkey}`}</div>
                                        </Tooltip>
                                    </div>
                                ))}
                            </div>
                        </AdminBox>
                    );
                })}
            </div>
            <div className={'text-right mt-4'}>
                <Button onClick={save}>Save</Button>
            </div>
        </>
    );
};
