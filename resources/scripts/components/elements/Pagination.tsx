import * as React from 'react';
import { PaginatedResult } from '@/api/http';
import tw from 'twin.macro';
import styled from 'styled-components';
import { Button } from '@elements/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';

interface RenderFuncProps<T> {
    items: T[];
    isLastPage: boolean;
    isFirstPage: boolean;
}

interface Props<T> {
    data: PaginatedResult<T>;
    showGoToLast?: boolean;
    showGoToFirst?: boolean;
    onPageSelect: (page: number) => void;
    children: (props: RenderFuncProps<T>) => React.ReactNode;
}

const Block = styled(Button)`
    ${tw`p-0 w-10 h-10`}

    &:not(:last-of-type) {
        ${tw`mr-2`};
    }
`;

function Pagination<T>({ data: { items, pagination }, onPageSelect, children }: Props<T>) {
    const isFirstPage = pagination.currentPage === 1;
    const isLastPage = pagination.currentPage >= pagination.totalPages;

    const pages = [];

    // Start two spaces before the current page. If that puts us before the starting page default
    // to the first page as the starting point.
    const start = Math.max(pagination.currentPage - 2, 1);
    const end = Math.min(pagination.totalPages, pagination.currentPage + 5);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return (
        <>
            {children({ items, isFirstPage, isLastPage })}
            {pages.length > 1 && (
                <div css={tw`my-3 flex justify-center`}>
                    {(pages?.[0] ?? 0) > 1 && !isFirstPage && (
                        <Block.Text size={Button.Sizes.Small} onClick={() => onPageSelect(1)} className={'mx-1'}>
                            <FontAwesomeIcon icon={faAngleDoubleLeft} />
                        </Block.Text>
                    )}
                    {pages.map(i => (
                        <Block.Text
                            size={Button.Sizes.Small}
                            className={'mx-1'}
                            key={`block_page_${i}`}
                            onClick={() => onPageSelect(i)}
                        >
                            {i}
                        </Block.Text>
                    ))}
                    {(pages?.[4] ?? 0) < pagination.totalPages && !isLastPage && (
                        <Block.Text
                            size={Button.Sizes.Small}
                            onClick={() => onPageSelect(pagination.totalPages)}
                            className={'mx-1'}
                        >
                            <FontAwesomeIcon icon={faAngleDoubleRight} />
                        </Block.Text>
                    )}
                </div>
            )}
        </>
    );
}

export default Pagination;
