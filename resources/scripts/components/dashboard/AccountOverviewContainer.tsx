import tw from 'twin.macro';
import * as React from 'react';
import { breakpoint } from '@/theme';
import styled from 'styled-components/macro';
import { useStoreState } from '@/state/hooks';
import { useLocation } from 'react-router-dom';
import Alert from '@/components/elements/alert/Alert';
import ContentBox from '@/components/elements/ContentBox';
import PageContentBlock from '@/components/elements/PageContentBlock';
import DiscordAccountForm from '@/components/dashboard/forms/DiscordAccountForm';
import UpdateUsernameForm from '@/components/dashboard/forms/UpdateUsernameForm';
import AddReferralCodeForm from '@/components/dashboard/forms/AddReferralCodeForm';
import UpdateEmailAddressForm from '@/components/dashboard/forms/UpdateEmailAddressForm';

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

export default () => {
    const { state } = useLocation<undefined | { twoFactorRedirect?: boolean }>();
    const discordEnabled = useStoreState((state) => state.settings.data!.registration.discord);
    const referralEnabled = useStoreState((state) => state.storefront.data!.referrals.enabled);

    return (
        <PageContentBlock title={'Account Overview'}>
            <h1 className={'j-left text-5xl'}>账户概况</h1>
            <h3 className={'j-left text-2xl text-neutral-500'}>需要启用动态口令认证.</h3>
            {state?.twoFactorRedirect && (
                <Alert type={'error'}>
                    您的帐户必须启用动态口令认证才能继续使用。
                </Alert>
            )}
            <Container
                className={'j-up'}
                css={[tw`lg:grid lg:grid-cols-2 gap-8 mb-10`, state?.twoFactorRedirect ? tw`mt-4` : tw`mt-10`]}
            >
                <ContentBox title={'更新密码'} showFlashes={'account:username'}>
                    <UpdateUsernameForm />
                </ContentBox>
                <ContentBox title={'更新电子邮箱地址'} showFlashes={'account:email'}>
                    <UpdateEmailAddressForm />
                </ContentBox>
                {referralEnabled === 'true' && (
                    <ContentBox title={'推广码'} showFlashes={'account:referral'}>
                        <AddReferralCodeForm />
                    </ContentBox>
                )}
                {discordEnabled === 'true' && (
                    <ContentBox title={'关联 Discord'} showFlashes={'account:discord'}>
                        <DiscordAccountForm />
                    </ContentBox>
                )}
            </Container>
        </PageContentBlock>
    );
};
