import React from 'react';
import * as Icon from 'react-feather';
import { useLocation } from 'react-router';
import TransitionRouter from '@/TransitionRouter';
import SidePanel from '@/components/elements/SidePanel';
import { NotFound } from '@/components/elements/ScreenBlock';
import useWindowDimensions from '@/plugins/useWindowDimensions';
import { NavLink, Route, Switch, useRouteMatch } from 'react-router-dom';
import CreateContainer from '@/components/store/CreateContainer';
import PurchaseContainer from '@/components/store/PurchaseContainer';
import OverviewContainer from '@/components/store/OverviewContainer';
import MobileNavigation from '@/components/elements/MobileNavigation';
import ResourcesContainer from '@/components/store/ResourcesContainer';
import SubNavigation from '@/components/elements/SubNavigation';

export default () => {
    const location = useLocation();
    const { width } = useWindowDimensions();
    const match = useRouteMatch<{ id: string }>();

    return (
        <>
            {width >= 1280 ? <SidePanel /> : <MobileNavigation />}
            <SubNavigation className={'j-down'}>
                <div>
                    <NavLink to={match.path} exact>
                        <div className={'flex items-center justify-between'}>
                            Store <Icon.ShoppingCart className={'ml-1'} size={18} />
                        </div>
                    </NavLink>
                    <NavLink to={`${match.path}/resources`}>
                        <div className={'flex items-center justify-between'}>
                            Resources <Icon.Cpu className={'ml-1'} size={18} />
                        </div>
                    </NavLink>
                    <NavLink to={`${match.path}/credits`}>
                        <div className={'flex items-center justify-between'}>
                            Balance <Icon.DollarSign className={'ml-1'} size={18} />
                        </div>
                    </NavLink>
                    <NavLink to={`${match.path}/create`}>
                        <div className={'flex items-center justify-between'}>
                            Create Server <Icon.Server className={'ml-1'} size={18} />
                        </div>
                    </NavLink>
                </div>
            </SubNavigation>
            <TransitionRouter>
                <Switch location={location}>
                    <Route path={`${match.path}`} exact>
                        <OverviewContainer />
                    </Route>
                    <Route path={`${match.path}/credits`} exact>
                        <PurchaseContainer />
                    </Route>
                    <Route path={`${match.path}/resources`} exact>
                        <ResourcesContainer />
                    </Route>
                    <Route path={`${match.path}/create`} exact>
                        <CreateContainer />
                    </Route>
                    <Route path={'*'}>
                        <NotFound />
                    </Route>
                </Switch>
            </TransitionRouter>
        </>
    );
};
