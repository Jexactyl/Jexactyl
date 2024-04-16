import AdminBox from '@/components/admin/AdminBox';

export default ({ reload }: { reload: boolean }) => {
    return (
        <AdminBox title={'Preview'} className={'lg:col-span-2'}>
            {!reload && <iframe src={'/'} className={'w-full rounded-lg h-[60vh] border-2 border-gray-500'} />}
        </AdminBox>
    );
};
