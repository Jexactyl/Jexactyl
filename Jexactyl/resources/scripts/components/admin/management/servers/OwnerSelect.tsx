import { useFormikContext } from 'formik';
import { useState } from 'react';

import { searchUserAccounts } from '@/api/routes/admin/users';
import SearchableSelect, { Option } from '@/elements/SearchableSelect';
import type { User } from '@definitions/admin';

export default ({ selected }: { selected?: User }) => {
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
        setFieldValue('ownerId', user?.id || null);
    };

    const getSelectedText = (user: User | null): string => user?.email || '';

    return (
        <SearchableSelect
            id={'ownerId'}
            name={'ownerId'}
            label={'Owner'}
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
            {users?.map(d => (
                <Option key={d.id} selectId={'ownerId'} id={d.id} item={d} active={d.id === user?.id}>
                    {d.email} ({d.username})
                </Option>
            ))}
        </SearchableSelect>
    );
};
