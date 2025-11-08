import { useState } from 'react';
import EditSubuserModal from '@server/users/EditSubuserModal';
import { Button } from '@/elements/button/index';

export default () => {
    const [visible, setVisible] = useState(false);

    return (
        <>
            <EditSubuserModal visible={visible} onModalDismissed={() => setVisible(false)} />
            <Button onClick={() => setVisible(true)}>New User</Button>
        </>
    );
};
