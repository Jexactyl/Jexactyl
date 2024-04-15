import AdminContentBlock from '@/components/admin/AdminContentBlock';

export default () => {
    return (
        <AdminContentBlock>
            <div className={'w-full flex flex-row items-center mb-8'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>System Theme</h2>
                    <p className={'text-primary-400 text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'}>
                        View and update the theme of this interface.
                    </p>
                </div>
            </div>
        </AdminContentBlock>
    );
};
