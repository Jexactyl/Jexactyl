import { toggleEventStatus, WebhookEvent } from '@/api/routes/admin/webhooks';
import AdminBox from '@/elements/AdminBox';
import Pill from '@/elements/Pill';
import useStatus from '@/plugins/useStatus';
import { faXmarkCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

export default ({ event }: { event: WebhookEvent }) => {
    if (!event) return <></>;

    const { status, setStatus } = useStatus();

    const doToggle = (event: WebhookEvent) => {
        setStatus('loading');

        toggleEventStatus(!event.enabled, event.id)
            .then(() => {
                setStatus('success');
            })
            .catch(() => setStatus('error'));
    };

    return (
        <AdminBox
            status={status}
            key={event.id}
            className={'capitalize relative'}
            title={event.key.replace(/[:-]/g, ' ')}
        >
            {status === 'none' && (
                <span className={'absolute top-2.5 right-2 space-x-1'}>
                    <Pill type={event.enabled ? 'success' : 'danger'}>{event.enabled ? 'Enabled' : 'Disabled'}</Pill>
                </span>
            )}
            <p className={'text-sm text-gray-400'}>
                {event.description}
                <div
                    className={classNames('absolute top-3.5', status === 'none' ? 'right-20' : 'right-10')}
                    onClick={() => doToggle(event)}
                >
                    {event.enabled ? (
                        <FontAwesomeIcon
                            icon={faXmarkCircle}
                            className={'text-red-400 hover:text-red-300 transition duration-250'}
                        />
                    ) : (
                        <FontAwesomeIcon
                            icon={faPlusCircle}
                            className={'text-green-400 hover:text-green-300 transition duration-250'}
                        />
                    )}
                </div>
            </p>
        </AdminBox>
    );
};
