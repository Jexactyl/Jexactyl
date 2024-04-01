import { Route, Routes } from 'react-router-dom';
import { NotFound } from '@/components/elements/ScreenBlock';
import NewTicketForm from '@/components/admin/tickets/NewTicketForm';
import TicketsContainer from '@/components/admin/tickets/TicketsContainer';
import ViewTicketContainer from '@/components/admin/tickets/view/ViewTicketContainer';

export default () => (
    <Routes>
        <Route path={'/'} element={<TicketsContainer />} />
        <Route path={'/new'} element={<NewTicketForm />} />
        <Route path={'/:id'} element={<ViewTicketContainer />} />
        <Route path={'/*'} element={<NotFound />} />
    </Routes>
);
