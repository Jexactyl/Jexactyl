import Tooltip from '@/elements/tooltip/Tooltip';
import { ExclamationIcon } from '@heroicons/react/solid';

export default () => (
    <Tooltip content={'You must enter a value for this field for this module to work.'}>
        <span className={'inline-flex align-middle ml-1'}>
            <ExclamationIcon className={'w-4 h-4 text-yellow-500 hover:text-yellow-300 duration-300'} />
        </span>
    </Tooltip>
);
