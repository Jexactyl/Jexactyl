import { useFormikContext } from 'formik';
import { useState } from 'react';

import { searchUserAccounts } from '@/api/routes/admin/users';
import SearchableSelect, { Option } from '@/elements/SearchableSelect';
import type { User } from '@definitions/admin';
import Avatar from '@/elements/Avatar';

export default ({ selected, isAdmin }: { selected?: User; isAdmin?: boolean }) => {
    const { setFieldValue } = useFormikContext();

    const [user, setUser] = useState<User | null>(selected || null);
    const [users, setUsers] = useState<User[] | null>(null);

    const onSearch = async (query: string) => {
        const [byUsername, byEmail] = await Promise.all([
            searchUserAccounts({ filters: { username: query } }),
            searchUserAccounts({ filters: { email: query } }),
        ]);

        const combined = [...new Map([...byUsername, ...byEmail].map(n => [n.id, n])).values()];
        setUsers(combined);
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
            label={isAdmin ? 'Assign to Administrator (optional)' : 'Ticket Owner'}
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
                        <div className={'inline-flex items-center mr-2'}>
                            <Avatar name={d.uuid} size={20} />
                        </div>
                        <div className={'inline-flex items-center'}>
                            {d.username} ({d.email})
                        </div>
                    </Option>
                ))}
        </SearchableSelect>
    );
};
