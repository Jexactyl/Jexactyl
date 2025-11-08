import useFlash from '@/plugins/useFlash';
import { useState, useEffect } from 'react';
import Spinner from '@/elements/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHeart } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';

export default ({ database, className }: { database: string; className?: string }) => {
    const { clearFlashes } = useFlash();
    const [error, setError] = useState<boolean>(false);

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<boolean>();

    useEffect(() => {
        clearFlashes('node');

        fetch(database, { method: 'no-cors' })
            .then(() => setStatus(true))
            .catch(() => setError(true))
            .then(() => setLoading(false));
    }, []);

    if (loading) return <Spinner size={'small'} />;

    return (
        <FontAwesomeIcon
            icon={error ? faExclamationTriangle : faHeart}
            className={classNames(className, status ? 'text-green-400' : 'text-red-400', 'animate-pulse text-lg')}
        />
    );
};
