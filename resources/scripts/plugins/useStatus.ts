import { useState } from 'react';

export type Status = 'loading' | 'success' | 'error' | 'none';

const useStatus = () => {
    const [status, setStatus] = useState<Status>('none');

    if (status === 'success') {
        setTimeout(() => setStatus('none'), 2000);
    }

    return { status, setStatus };
};

export default useStatus;
