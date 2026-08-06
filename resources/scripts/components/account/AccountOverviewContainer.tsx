import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import tw from 'twin.macro';
import styled from 'styled-components';

import ContentBox from '@/elements/ContentBox';
import PageContentBlock from '@/elements/PageContentBlock';
import CopyOnClick from '@/elements/CopyOnClick';
import UpdateAvatarForm from '@account/forms/UpdateAvatarForm';
import { breakpoint } from '@/assets/theme';
import { useStoreState } from '@/state/hooks';

const Container = styled.div`
    ${tw`flex flex-wrap`};

    & > div {
        ${tw`w-full`};

        ${breakpoint('sm')`
      width: calc(50% - 1rem);
    `}

        ${breakpoint('md')`
      ${tw`w-auto flex-1`};
    `}
    }
`;

const Detail = ({ label, children }: { label: string; children: ReactNode }) => (
    <div css={tw`flex justify-between items-baseline gap-4 py-3 border-b border-neutral-700 last:border-b-0`}>
        <p css={tw`text-xs text-gray-400 uppercase whitespace-nowrap`}>{label}</p>
        <div css={tw`text-sm text-right break-words min-w-0`}>{children}</div>
    </div>
);

export default () => {
    const user = useStoreState(state => state.user.data!);

    return (
        <PageContentBlock title="Account" header description={'An overview of the details on your account.'}>
            <Container css={tw`lg:grid lg:grid-cols-2 mb-10 mt-10`}>
                <ContentBox title="Avatar" showFlashes="account:avatar">
                    <UpdateAvatarForm />
                </ContentBox>

                <ContentBox css={tw`mt-8 lg:mt-0 lg:ml-8`} title="Account Information">
                    <Detail label={'Username'}>{user.username}</Detail>
                    <Detail label={'Email Address'}>{user.email}</Detail>
                    <Detail label={'Account ID'}>
                        <CopyOnClick text={user.uuid}>
                            <code css={tw`font-mono text-xs`}>{user.uuid}</code>
                        </CopyOnClick>
                    </Detail>
                    {user.roleName && <Detail label={'Role'}>{user.roleName}</Detail>}
                    <Detail label={'Member Since'}>{format(user.createdAt, 'MMMM do, yyyy')}</Detail>
                    <p css={tw`text-xs text-gray-400 mt-6`}>
                        Your email, password, and sign-in methods are managed under{' '}
                        <Link to={'/account/security'} css={tw`text-green-400 hover:text-green-200 duration-300`}>
                            Security
                        </Link>
                        .
                    </p>
                </ContentBox>
            </Container>
        </PageContentBlock>
    );
};
