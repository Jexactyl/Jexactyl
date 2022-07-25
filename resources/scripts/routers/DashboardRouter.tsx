import React from 'react';
import tw from 'twin.macro';
import * as Icon from 'react-feather';
import { useLocation } from 'react-router';
import TransitionRouter from '@/TransitionRouter';
import Spinner from '@/components/elements/Spinner';
import SidePanel from '@/components/elements/SidePanel';
import { NavLink, Route, Switch } from 'react-router-dom';
import { NotFound } from '@/components/elements/ScreenBlock';
import SubNavigation from '@/components/elements/SubNavigation';
import useWindowDimensions from '@/plugins/useWindowDimensions';
import InformationBox from '@/components/elements/InformationBox';
import MobileNavigation from '@/components/elements/MobileNavigation';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import AccountApiContainer from '@/components/dashboard/AccountApiContainer';
import AccountSSHContainer from '@/components/dashboard/ssh/AccountSSHContainer';
import AccountOverviewContainer from '@/components/dashboard/AccountOverviewContainer';
import AccountSecurityContainer from '@/components/dashboard/AccountSecurityContainer';
import { faCircle, faCoins, faScroll, faUserLock } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const location = useLocation();
    const { width } = useWindowDimensions();

    return (
        <>
            {width >= 1280 ? <SidePanel /> : <MobileNavigation />}
            {location.pathname.startsWith('/account') ? (
                <SubNavigation className={'j-down'}>
                    <div>
                        <NavLink to={'/account'} exact>
                            <div css={tw`flex items-center justify-between`}>
                                帐户 <Icon.User css={tw`ml-1`} size={18} />
                            </div>
                        </NavLink>
                        <NavLink to={'/account/security'}>
                            <div css={tw`flex items-center justify-between`}>
                                安全 <Icon.Key css={tw`ml-1`} size={18} />
                            </div>
                        </NavLink>
                        <NavLink to={'/account/api'}>
                            <div css={tw`flex items-center justify-between`}>
                                API <Icon.Code css={tw`ml-1`} size={18} />
                            </div>
                        </NavLink>
                        <NavLink to={'/account/ssh'}>
                            <div css={tw`flex items-center justify-between`}>
                                SSH 密钥 <Icon.Terminal css={tw`ml-1`} size={18} />
                            </div>
                        </NavLink>
                    </div>
                </SubNavigation>
            ) : (
                <SubNavigation className={'j-down'}>
                    <div>
                        <InformationBox icon={faCircle} iconCss={'animate-pulse text-green-500'}>
                            赚取 <span className={'text-green-600'}>3</span> 积分 / 分钟。
                        </InformationBox>
                        <InformationBox icon={faCoins}>
                            您有 <span className={'text-green-600'}>234723</span> 个积分可用。
                        </InformationBox>
                        <InformationBox icon={faUserLock}>
                            <span className={'text-yellow-600'}>启用动态口令认证</span> 以保护您的帐户。
                        </InformationBox>
                        <InformationBox icon={faScroll}>
                            <span className={'text-neutral-400'}>已登录</span> - 4 分钟前
                        </InformationBox>
                    </div>
                </SubNavigation>
            )}
            <TransitionRouter>
                <React.Suspense fallback={<Spinner centered />}>
                    <Switch location={location}>
                        <Route path={'/'} exact>
                            <DashboardContainer />
                        </Route>
                        <Route path={'/account'} exact>
                            <AccountOverviewContainer />
                        </Route>
                        <Route path={'/account/security'} exact>
                            <AccountSecurityContainer />
                        </Route>
                        <Route path={'/account/api'} exact>
                            <AccountApiContainer />
                        </Route>
                        <Route path={'/account/ssh'} exact>
                            <AccountSSHContainer />
                        </Route>
                        <Route path={'*'}>
                            <NotFound />
                        </Route>
                    </Switch>
                </React.Suspense>
            </TransitionRouter>
        </>
    );
};
