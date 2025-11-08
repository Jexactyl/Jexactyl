import admin from '@/routers/routes/admin';
import server from '@/routers/routes/server';
import account from '@/routers/routes/account';

const routes = { account, server, admin } as const;

export default routes;
