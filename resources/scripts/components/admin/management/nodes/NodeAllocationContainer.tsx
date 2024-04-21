import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import tw from 'twin.macro';

import AdminBox from '@elements/AdminBox';
import AllocationTable from '@admin/management/nodes/allocations/AllocationTable';
import CreateAllocationForm from '@admin/management/nodes/allocations/CreateAllocationForm';

export default () => {
    const params = useParams<'id'>();

    return (
        <>
            <div css={tw`w-full grid grid-cols-12 gap-x-8`}>
                <div css={tw`w-full flex col-span-8`}>
                    <AllocationTable nodeId={Number(params.id)} />
                </div>

                <div css={tw`w-full flex col-span-4`}>
                    <AdminBox icon={faNetworkWired} title={'Allocations'} css={tw`h-auto w-full`}>
                        <CreateAllocationForm nodeId={Number(params.id)} />
                    </AdminBox>
                </div>
            </div>
        </>
    );
};
