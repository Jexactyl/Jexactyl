import { lazy } from 'react';
import '@/assets/tailwind.css';
import { store } from '@/state';
import { StoreProvider } from 'easy-peasy';
import { AdminContext } from '@/state/admin';
import { ServerContext } from '@/state/server';
import { SiteSettings } from '@/state/settings';
import Spinner from '@/components/elements/Spinner';
import NotFoundSvg from '@/assets/images/not_found.svg';
import ProgressBar from '@/components/elements/ProgressBar';
import GlobalStylesheet from '@/assets/css/GlobalStylesheet';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthenticatedRoute from '@/components/elements/AuthenticatedRoute';
import ScreenBlock, { NotFound } from '@/components/elements/ScreenBlock';

const AdminRouter = lazy(() => import('@/routers/AdminRouter'));
const AuthenticationRouter = lazy(() => import('@/routers/AuthenticationRouter'));
const DashboardRouter = lazy(() => import('@/routers/DashboardRouter'));
const ServerRouter = lazy(() => import('@/routers/ServerRouter'));

interface ExtendedWindow extends Window {
    SiteConfiguration?: SiteSettings;
    PterodactylUser?: {
        uuid: string;
        username: string;
        email: string;
        /* eslint-disable camelcase */
        root_admin: boolean;
        use_totp: boolean;
        language: string;
        avatar_url: string;
        admin_role_name: string;
        state: string;
        updated_at: string;
        created_at: string;
        /* eslint-enable camelcase */
    };
}

// setupInterceptors(history);

function App() {
    const { PterodactylUser, SiteConfiguration } = window as ExtendedWindow;
    if (PterodactylUser && !store.getState().user.data) {
        store.getActions().user.setUserData({
            uuid: PterodactylUser.uuid,
            username: PterodactylUser.username,
            email: PterodactylUser.email,
            language: PterodactylUser.language,
            rootAdmin: PterodactylUser.root_admin,
            avatarURL: PterodactylUser.avatar_url,
            roleName: PterodactylUser.admin_role_name,
            state: PterodactylUser.state,
            useTotp: PterodactylUser.use_totp,
            createdAt: new Date(PterodactylUser.created_at),
            updatedAt: new Date(PterodactylUser.updated_at),
        });
    }

    if (!store.getState().settings.data) {
        store.getActions().settings.setSettings(SiteConfiguration!);
    }

    if (PterodactylUser?.state === 'suspended') {
        return (
            <ScreenBlock
                image={NotFoundSvg}
                title={'Account Suspended'}
                message={'Your account has been suspended. Please contact an administrator.'}
            />
        );
    }

    return (
        <>
            <GlobalStylesheet />
            <StoreProvider store={store}>
                <ProgressBar />

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
                                            <DashboardRouter />
                                        </Spinner.Suspense>
                                    </AuthenticatedRoute>
                                }
                            />

                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </BrowserRouter>
                </div>
            </StoreProvider>
        </>
    );
}

export { App };
