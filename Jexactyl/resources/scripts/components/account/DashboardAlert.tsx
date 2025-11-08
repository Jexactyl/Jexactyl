import { Alert } from '@/elements/alert';
import { useStoreState } from '@/state/hooks';
import MessageBox, { FlashMessageType } from '@/elements/MessageBox';
import { usePersistedState } from '@/plugins/usePersistedState';
import { capitalize } from '@/lib/strings';
import { Dialog } from '@/elements/dialog';

export default () => {
    const { uuid: user } = useStoreState(s => s.user.data!);
    const { alert } = useStoreState(s => s.everest.data!);

    const [open, setOpen] = usePersistedState(`alert_${alert.uuid}_${user}`, true);

    return (
        <>
            {alert.enabled && (
                <>
                    {alert.position === 'top-center' && <Alert type={alert.type}>{alert.content}</Alert>}
                    {alert.position === 'bottom-left' && (
                        <div className={'fixed bottom-2 left-2 z-50 m-4'}>
                            <MessageBox type={alert.type as FlashMessageType}>{alert.content}</MessageBox>
                        </div>
                    )}
                    {alert.position === 'bottom-right' && (
                        <div className={'fixed bottom-2 right-2 z-50 m-4'}>
                            <MessageBox type={alert.type as FlashMessageType}>{alert.content}</MessageBox>
                        </div>
                    )}
                    {alert.position === 'center' && open && (
                        <Dialog.Confirm
                            open
                            buttonType={alert.type}
                            onClose={() => setOpen(false)}
                            title={capitalize(alert.type)}
                            onConfirmed={() => setOpen(false)}
                        >
                            {alert.content}
                        </Dialog.Confirm>
                    )}
                </>
            )}
        </>
    );
};
