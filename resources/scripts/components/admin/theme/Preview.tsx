import AdminBox from '@/components/admin/AdminBox';
import { faDesktop } from '@fortawesome/free-solid-svg-icons';

export default ({ reload }: { reload: boolean }) => {
    return (
        <AdminBox title={'Preview'} icon={faDesktop} className={'lg:col-span-2'}>
            {!reload && <iframe src={'/'} className={'w-full rounded-lg h-[60vh] border-2 border-gray-500'} />}
        </AdminBox>
    );
};
