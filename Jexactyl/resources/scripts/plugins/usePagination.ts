import { useState } from 'react';

export interface UsePaginationResult<T> {
    paginatedItems: T[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
    setPage: (page: number) => void;
}

function usePagination<T>(items: T[], itemsPerPage: number): UsePaginationResult<T> {
    const [currentPage, setCurrentPage] = useState<number>(1);

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    const paginatedItems = items.slice(startIndex, endIndex);

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const setPage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return {
        paginatedItems,
        currentPage,
        totalPages,
        totalItems,
        startIndex,
        endIndex,
        goToNextPage,
        goToPreviousPage,
        setPage,
    };
}

export default usePagination;
