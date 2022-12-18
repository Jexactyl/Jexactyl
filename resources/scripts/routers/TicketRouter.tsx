import React from 'react';
import { useLocation } from 'react-router';
import TransitionRouter from '@/TransitionRouter';
import SidePanel from '@/components/elements/SidePanel';
import { NotFound } from '@/components/elements/ScreenBlock';
import ViewContainer from '@/components/tickets/ViewContainer';
import useWindowDimensions from '@/plugins/useWindowDimensions';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import MobileNavigation from '@/components/elements/MobileNavigation';
import OverviewContainer from '@/components/tickets/OverviewContainer';

export default () => {
    const location = useLocation();
    const { width } = useWindowDimensions();
    const match = useRouteMatch<{ id: string }>();

    return (
        <>
            {width >= 1280 ? <SidePanel /> : <MobileNavigation />}
            <TransitionRouter>
                <Switch location={location}>
                    <Route path={match.path} exact>
                        <OverviewContainer />
                    </Route>
                    <Route path={`${match.path}/:id`} exact>
                        <ViewContainer />
                    </Route>
                    <Route path={'*'}>
                        <NotFound />
                    </Route>
                </Switch>
            </TransitionRouter>
        </>
    );
};
