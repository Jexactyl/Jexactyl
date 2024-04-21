import { Route, Routes } from 'react-router-dom';
import EnableBillingContainer from '@admin/modules/billing/EnableBillingContainer';

export default () => {
    const enabled = false;

    return (
        <Routes>
            {enabled ? (
                <Route path={'/'} element={<>enabled</>} />
            ) : (
                <Route path={'/'} element={<EnableBillingContainer />} />
            )}
        </Routes>
    );
};
