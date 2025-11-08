import { lazy } from 'react';
import '@/assets/tailwind.css';
import { store } from '@/state';
import { SiteTheme } from '@/state/theme';
import { StoreProvider } from 'easy-peasy';
import { AdminContext } from '@/state/admin';
import { ServerContext } from '@/state/server';
import { SiteSettings } from '@/state/settings';
import Spinner from '@/elements/Spinner';
import ProgressBar from '@/elements/ProgressBar';
import GlobalStylesheet from '@/assets/css/GlobalStylesheet';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthenticatedRoute from '@/elements/AuthenticatedRoute';
import { NotFound } from '@/elements/ScreenBlock';
import { EverestSettings } from '@/state/everest';
import Onboarding from '@account/Onboarding';
import SpeedDial from '@/elements/SpeedDial';
import SetupContainer from './admin/setup/SetupContainer';

const AdminRouter = lazy(() => import('@/routers/AdminRouter'));
const AuthenticationRouter = lazy(() => import('@/routers/AuthenticationRouter'));
const DashboardRouter = lazy(() => import('@/routers/DashboardRouter'));
const ServerRouter = lazy(() => import('@/routers/ServerRouter'));

interface ExtendedWindow extends Window {
    SiteConfiguration?: SiteSettings;
    ThemeConfiguration?: SiteTheme;
    EverestConfiguration?: EverestSettings;
    PterodactylUser?: {
        uuid: string;
        username: string;
        email: string;
        root_admin: boolean;
        use_totp: boolean;
        language: string;
        avatar_url: string;
        admin_role_name: string;
        admin_role_id?: number;
        state: string;
        updated_at: string;
        created_at: string;
    };
}

function App() {
    const { PterodactylUser, SiteConfiguration, EverestConfiguration, ThemeConfiguration } = window as ExtendedWindow;

    if (PterodactylUser && !store.getState().user.data) {
        store.getActions().user.setUserData({
            uuid: PterodactylUser.uuid,
            username: PterodactylUser.username,
            email: PterodactylUser.email,
            language: PterodactylUser.language,
            rootAdmin: PterodactylUser.root_admin,
            avatarURL: PterodactylUser.avatar_url,
            roleName: PterodactylUser.admin_role_name,
            admin_role_id: PterodactylUser.admin_role_id,
            state: PterodactylUser.state,
            useTotp: PterodactylUser.use_totp,
            createdAt: new Date(PterodactylUser.created_at),
            updatedAt: new Date(PterodactylUser.updated_at),
        });
    }

    if (!store.getState().settings.data) {
        store.getActions().settings.setSettings(SiteConfiguration!);
    }

    if (!store.getState().theme.data) {
        store.getActions().theme.setTheme(ThemeConfiguration!);
    }

    if (!store.getState().everest.data) {
        store.getActions().everest.setEverest(EverestConfiguration!);
    }

    if (PterodactylUser?.state === 'suspended') {
        return (
            <div style={{ color: 'white', fontWeight: 'bold', marginTop: '10px', marginLeft: '10px' }}>
                Your account has been suspended and blocked by an administrator.
            </div>
        );
    }

    const hasAdminRole: boolean = (PterodactylUser?.root_admin || Boolean(PterodactylUser?.admin_role_id)) ?? false;

    return (
        <>
            <GlobalStylesheet />
            <StoreProvider store={store}>
                <ProgressBar />
                {PterodactylUser?.root_admin && !SiteConfiguration?.setup ? (
                    <SetupContainer />
                ) : (
                    <>
                        {' '}
                        {PterodactylUser?.username.startsWith('null_user_') &&
                        EverestConfiguration?.auth.modules.onboarding.enabled ? (
                            <Onboarding />
                        ) : (
                            <div className="mx-auto w-auto">
                                <BrowserRouter>
                                    <Routes>
                                        <Route
                                            path="/auth/*"
                                            element={
                                                <Spinner.Suspense>
                                                    <AuthenticationRouter />
                                                </Spinner.Suspense>
                                            }
                                        />

                                        <Route
                                            path="/server/:id/*"
                                            element={
                                                <AuthenticatedRoute>
                                                    <Spinner.Suspense>
                                                        <ServerContext.Provider>
                                                            {hasAdminRole && <SpeedDial />}
                                                            <ServerRouter />
                                                        </ServerContext.Provider>
                                                    </Spinner.Suspense>
                                                </AuthenticatedRoute>
                                            }
                                        />

                                        <Route
                                            path="/admin/*"
                                            element={
                                                <Spinner.Suspense>
                                                    <AdminContext.Provider>
                                                        <AdminRouter />
                                                    </AdminContext.Provider>
                                                </Spinner.Suspense>
                                            }
                                        />

                                        <Route
                                            path="/*"
                                            element={
                                                <AuthenticatedRoute>
                                                    <Spinner.Suspense>
                                                        {hasAdminRole && <SpeedDial />}
                                                        <DashboardRouter />
                                                    </Spinner.Suspense>
                                                </AuthenticatedRoute>
                                            }
                                        />

                                        <Route path="*" element={<NotFound />} />
                                    </Routes>
                                </BrowserRouter>
                            </div>
                        )}
                    </>
                )}
            </StoreProvider>
        </>
    );
}

export { App };
