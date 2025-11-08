import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useStoreState } from '@/state/hooks';
import { UsePaginationResult } from '@/plugins/usePagination';
import { Button } from './button';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Header = ({ children }: { children: ReactNode }) => {
    const { colors } = useStoreState(s => s.theme.data!);

    return (
        <thead className={'text-xs uppercase text-gray-400'} style={{ backgroundColor: colors.headers }}>
            <tr>{children}</tr>
        </thead>
    );
};

const HeaderItem = ({ children }: { children: ReactNode }) => <th className={'px-6 py-3'}>{children}</th>;

const Body = ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>;

const BodyItem = ({ item, to, children }: { item: string; to?: string; children: ReactNode }) => {
    const { colors } = useStoreState(s => s.theme.data!);

    return (
        <tr className={'border-b-2 border-gray-700'} style={{ backgroundColor: colors.secondary }}>
            <th
                style={{ color: colors.primary }}
                className={'px-6 py-4 font-bold whitespace-nowrap hover:brightness-150 duration-300'}
            >
                {to ? <Link to={to}>{item}</Link> : item}
            </th>
            {children}
        </tr>
    );
};

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
            className={'rounded-b-lg py-2 px-4'}
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
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </Button.Text>
                    <Button.Text
                        disabled={pagination.currentPage === pagination.totalPages}
                        size={Button.Sizes.Small}
                        onClick={pagination.goToNextPage}
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </Button.Text>
                </div>
            </div>
        </div>
    );
};

const Table = ({ children }: { children: ReactNode[] }) => {
    const { colors } = useStoreState(s => s.theme.data!);

    return (
        <div className={'relative overflow-x-auto'}>
            <div className={'py-5 rounded-t-lg'} style={{ backgroundColor: colors.secondary }}></div>
            <table className={'w-full text-sm text-left text-gray-400'}>{children}</table>
        </div>
    );
};

export { Table, Header, HeaderItem, Body, BodyItem, PaginatedFooter };
