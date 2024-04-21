import Tooltip from '@elements/tooltip/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default () => (
    <Tooltip content={'You must enter a value for this field for this module to work.'}>
        <FontAwesomeIcon
            icon={faExclamationTriangle}
            className={'text-yellow-500 hover:text-yellow-300 duration-300 ml-1'}
        />
    </Tooltip>
);
