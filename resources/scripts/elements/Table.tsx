import { useStoreState } from '@/state/hooks';
import { UsePaginationResult } from '@/plugins/usePagination';
import { Button } from './button';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';

const PaginatedFooter = ({
    pagination,
    noBackground,
}: {
    pagination: UsePaginationResult<any>;
    noBackground?: boolean;
}) => {
    const { colors } = useStoreState(s => s.theme.data!);

    return (
        <div
            style={{ backgroundColor: !noBackground ? colors.secondary : 'transparent' }}
            className={'rounded-b-xl py-2 px-4'}
        >
            <div className={'flex justify-between space-x-2'}>
                <p className={'text-xs font-bold text-gray-400 my-auto'}>
                    Showing <span className={'text-white'}>{pagination.startIndex + 1}</span> to{' '}
                    <span className={'text-white'}>{pagination.endIndex}</span> of{' '}
                    <span className={'text-white'}>{pagination.totalItems}</span> results
                </p>
                <div className={'inline-flex'}>
                    <p className={'text-xs font-bold text-gray-400 my-auto mr-2'}>
                        Page <span className={'text-white'}>{pagination.currentPage}</span> of{' '}
                        <span className={'text-white'}>{pagination.totalPages}</span>
                    </p>
                    <Button.Text
                        disabled={pagination.currentPage === 1}
                        size={Button.Sizes.Small}
                        onClick={pagination.goToPreviousPage}
                    >
                        <ChevronLeftIcon className={'w-4 h-4'} />
                    </Button.Text>
                    <Button.Text
                        disabled={pagination.currentPage === pagination.totalPages}
                        size={Button.Sizes.Small}
                        onClick={pagination.goToNextPage}
                    >
                        <ChevronRightIcon className={'w-4 h-4'} />
                    </Button.Text>
                </div>
            </div>
        </div>
    );
};

export { PaginatedFooter };
