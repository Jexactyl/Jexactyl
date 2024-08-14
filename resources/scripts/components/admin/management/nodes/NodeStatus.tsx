import useFlash from '@/plugins/useFlash';
import { useState, useEffect } from 'react';
import getNodeInformation, { NodeInformation } from '@/api/admin/nodes/getNodeInformation';
import Spinner from '@/components/elements/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHeart } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import Tooltip from '@/components/elements/tooltip/Tooltip';

export default ({ node, className }: { node: number; className?: string }) => {
    const { clearFlashes } = useFlash();
    const [error, setError] = useState<boolean>(false);

    const [loading, setLoading] = useState(true);
    const [info, setInfo] = useState<NodeInformation | null>(null);

    useEffect(() => {
        clearFlashes('node');

        getNodeInformation(node)
            .then(info => setInfo(info))
            .catch(error => {
                console.error(error);
                setError(true);
            })
            .then(() => setLoading(false));
    }, []);

    if (loading) return <Spinner size={'small'} />;

    return (
        <Tooltip placement={'top'} content={info ? `v${info.version}` : 'Node Unavailable'}>
            <FontAwesomeIcon
                icon={error ? faExclamationTriangle : faHeart}
                className={classNames(className, info ? 'text-green-400' : 'text-red-400', 'animate-pulse text-lg')}
            />
        </Tooltip>
    );
};
