import AdminContentBlock from '@/elements/AdminContentBlock';
import InvoicesTable from './InvoicesTable';

export default () => (
    <AdminContentBlock title={'Billing Invoices'}>
        <div className={'w-full flex flex-row items-center p-8'}>
            <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>Invoices</h2>
                <p
                    className={
                        'hidden lg:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'
                    }
                >
                    Generated PDF invoices for orders placed on this Panel.
                </p>
            </div>
        </div>
        <InvoicesTable />
    </AdminContentBlock>
);
