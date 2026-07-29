import { ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface LimitProps {
    icon: IconDefinition;
    limit: ReactElement;
}

export default ({ icon, limit }: LimitProps) => (
    <div className={'text-gray-400 mt-1'}>
        <FontAwesomeIcon icon={icon} className={'w-4 h-4 mr-2'} />
        {limit}
    </div>
);
