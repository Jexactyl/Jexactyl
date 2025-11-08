import { Alert } from '@/elements/alert';

export default ({ untested }: { untested?: boolean }) => (
    <Alert type={untested ? 'warning' : 'danger'} className={'w-full my-3'}>
        {untested
            ? 'This feature has not been tested and could contain bugs. If you find any software issue, please report it on GitHub.'
            : 'This feature is unfinished and will not work as expected. This alert will be removed when it has been completed.'}
    </Alert>
);
