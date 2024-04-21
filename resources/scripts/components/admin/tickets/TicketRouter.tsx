import { useStoreState } from '@/state/hooks';
import { Route, Routes } from 'react-router-dom';
import { NotFound } from '@/components/elements/ScreenBlock';
import NewTicketForm from '@/components/admin/tickets/NewTicketForm';
import TicketsContainer from '@/components/admin/tickets/TicketsContainer';
import ViewTicketContainer from '@/components/admin/tickets/view/ViewTicketContainer';
import EnableTicketsContainer from './EnableTicketsContainer';

export default () => {
    const enabled = useStoreState(state => state.everest.data!.tickets.enabled);

    return (
        <Routes>
            {enabled ? (
                <Route path={'/'} element={<TicketsContainer />} />
            ) : (
                <Route path={'/'} element={<EnableTicketsContainer />} />
            )}
            <Route path={'/new'} element={<NewTicketForm />} />
            <Route path={'/:id'} element={<ViewTicketContainer />} />
            <Route path={'/*'} element={<NotFound />} />
        </Routes>
    );
};
