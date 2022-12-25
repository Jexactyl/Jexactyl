import React from 'react';
import PageContentBlock, { PageContentBlockProps } from '@/components/elements/PageContentBlock';

interface Props extends PageContentBlockProps {
    title: string;
}

const ServerContentBlock: React.FC<Props> = ({ title, children, ...props }) => (
    <PageContentBlock title={title} {...props}>
        {children}
    </PageContentBlock>
);

export default ServerContentBlock;
