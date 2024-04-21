import { useFormikContext } from 'formik';
import { useState } from 'react';

import { searchUserAccounts } from '@/api/admin/users';
import SearchableSelect, { Option } from '@elements/SearchableSelect';
import type { User } from '@definitions/admin';

export default ({ selected, isAdmin }: { selected?: User; isAdmin?: boolean }) => {
    const { setFieldValue } = useFormikContext();

    const [user, setUser] = useState<User | null>(selected || null);
    const [users, setUsers] = useState<User[] | null>(null);

    const onSearch = async (query: string) => {
        setUsers(await searchUserAccounts({ filters: { username: query, email: query } }));
    };

    const onSelect = (user: User | null) => {
        setUser(user);
        setFieldValue(isAdmin ? 'assigned_to' : 'user_id', user?.id || null);
    };

    const getSelectedText = (user: User | null): string => user?.email || '';

    return (
        <SearchableSelect
            id={isAdmin ? 'assigned_to' : 'user_id'}
            name={isAdmin ? 'assigned_to' : 'user_id'}
            label={isAdmin ? 'Assign to Administrator' : 'Ticket Owner'}
            placeholder={'Select a user...'}
            items={users}
            selected={user}
            setSelected={setUser}
            setItems={setUsers}
            onSearch={onSearch}
            onSelect={onSelect}
            getSelectedText={getSelectedText}
            nullable
        >
            {users
                ?.filter(x => (isAdmin ? x.isRootAdmin : !x.isRootAdmin))
                .map(d => (
                    <Option
                        key={d.id}
                        selectId={isAdmin ? 'assigned_to' : 'user_id'}
                        id={d.id}
                        item={d}
                        active={d.id === user?.id}
                    >
                        {d.email}
                    </Option>
                ))}
        </SearchableSelect>
    );
};
