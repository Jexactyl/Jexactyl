import tw from 'twin.macro';
import styled from 'styled-components';

import ContentBox from '@/elements/ContentBox';
import { breakpoint } from '@/assets/theme';
import UpdatePasswordForm from '@account/forms/UpdatePasswordForm';
import UpdateEmailAddressForm from '@account/forms/UpdateEmailAddressForm';
import ConfigureTwoFactorForm from '@account/forms/ConfigureTwoFactorForm';

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

export default () => (
    <Container css={tw`lg:grid lg:grid-cols-3 my-10`}>
        <ContentBox title="Update Password" showFlashes="account:password">
            <UpdatePasswordForm />
        </ContentBox>

        <ContentBox css={tw`mt-8 lg:mt-0 lg:ml-8`} title="Update Email Address" showFlashes="account:email">
            <UpdateEmailAddressForm />
        </ContentBox>

        <ContentBox css={tw`mt-8 lg:mt-0 lg:ml-8`} title="Two-Step Verification">
            <ConfigureTwoFactorForm />
        </ContentBox>
    </Container>
);
