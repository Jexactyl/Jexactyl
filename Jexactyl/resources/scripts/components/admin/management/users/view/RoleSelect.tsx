import { useFormikContext } from 'formik';
import { useState, useEffect } from 'react';
import SearchableSelect, { Option } from '@/elements/SearchableSelect';
import type { UserRole } from '@definitions/admin';
import { searchRoles } from '@/api/routes/admin/roles';

export default ({ selected }: { selected?: UserRole }) => {
    const { setFieldValue } = useFormikContext();

    const [userRole, setUserRole] = useState<UserRole | null>(selected || null);
    const [userRoles, setUserRoles] = useState<UserRole[] | null>(null);

    useEffect(() => {
        if (selected) {
            setUserRole(selected);
            setUserRoles(prev =>
                prev && !prev.some(r => r.id === selected.id) ? [selected, ...prev] : prev ?? [selected],
            );
        }
    }, [selected]);

    const onSearch = async (query: string) => {
        searchRoles({ name: query })
            .then(setUserRoles)
            .catch(error => console.log(error));
    };

    const onSelect = (userRole: UserRole | null) => {
        setUserRole(userRole);
        setFieldValue('admin_role_id', userRole?.id || null);
    };

    const getSelectedText = (userRole: UserRole | null): string => userRole?.name || '';

    return (
        <SearchableSelect
            id={'admin_role_id'}
            name={'admin_role_id'}
            label={'Assign Admin Role'}
            placeholder={'Select an admin role... (optional)'}
            items={userRoles}
            selected={userRole}
            setSelected={setUserRole}
            setItems={setUserRoles}
            onSearch={onSearch}
            onSelect={onSelect}
            getSelectedText={getSelectedText}
            nullable
        >
            {userRoles?.map(d => (
                <Option key={d.id} selectId={'admin_role_id'} id={d.id} item={d} active={d.id === userRole?.id}>
                    <div className={'inline-flex items-center'}>{d.name}</div>
                </Option>
            ))}
        </SearchableSelect>
    );
};
