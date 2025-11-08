import type { Filters } from '@/api/routes/admin/databases/getDatabases';
import { Context as DatabasesContext } from '@/api/routes/admin/databases/getDatabases';
import { useTableHooks } from '@/elements/AdminTable';
import DatabasesTable from './DatabasesTable';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/elements/button';
import { PlusIcon } from '@heroicons/react/outline';
import AdminContentBlock from '@/elements/AdminContentBlock';
import { Dialog } from '@/elements/dialog';
import { useState } from 'react';
import createDatabase from '@/api/routes/admin/databases/createDatabase';
import { useStoreActions } from '@/state/hooks';
import { InformationContainer, Values } from '@admin/management/databases/DatabaseEditContainer';
import { FormikHelpers } from 'formik';

interface Props {
    filters?: Filters;
}

export default ({ filters }: Props) => {
    const navigate = useNavigate();
    const hooks = useTableHooks<Filters>(filters);

    const [open, setOpen] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useStoreActions(actions => actions.flashes);

    const submit = ({ name, host, port, username, password }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('admin:databases');

        createDatabase(name, host, port, username, password)
            .then(database => navigate(`/admin/databases/${database.id}`))
            .catch(error => clearAndAddHttpError({ key: 'admin:databases', error }))
            .finally(() => setSubmitting(false));
    };

    return (
        <AdminContentBlock>
            <Dialog title={'Create a New Database'} open={open} onClose={() => setOpen(false)} size={'lg'}>
                <InformationContainer title={'Information'} onSubmit={submit} />
            </Dialog>
            <div className={'w-full flex flex-row items-center mb-8'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>Database Hosts</h2>
                    <p className={'hidden lg:block text-base text-neutral-400 whitespace-nowrap'}>
                        Modify node database hosts linked to the Panel.
                    </p>
                </div>
                <div className={'w-full text-right mb-4'}>
                    <Button
                        icon={PlusIcon}
                        size={Button.Sizes.Large}
                        onClick={() => setOpen(true)}
                        className={'h-10 px-4 py-0 whitespace-nowrap'}
                    >
                        New Database Host
                    </Button>
                </div>
            </div>
            <DatabasesContext.Provider value={hooks}>
                <DatabasesTable />
            </DatabasesContext.Provider>
        </AdminContentBlock>
    );
};
