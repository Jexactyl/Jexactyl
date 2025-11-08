import { Alert } from '@/elements/alert';
import AdminBox from '@/elements/AdminBox';
import { useStoreActions, useStoreState } from '@/state/hooks';
import { faCircle, faDesktop, faList } from '@fortawesome/free-solid-svg-icons';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode, useState } from 'react';
import classNames from 'classnames';
import { updateAlertSettings } from '@/api/routes/admin/alerts';
import { AlertPosition } from '@/state/everest';
import useFlash from '@/plugins/useFlash';
import MessageBox, { FlashMessageType } from '@/elements/MessageBox';
import useStatus from '@/plugins/useStatus';
import { Dialog } from '@/elements/dialog';
import { capitalize } from '@/lib/strings';

const DemoBox = ({ children, selected }: { children: ReactNode; selected: boolean }) => {
    const { primary } = useStoreState(state => state.theme.data!.colors);

    return (
        <div
            className={classNames(
                selected && 'border border-blue-500',
                'bg-black/50 hover:bg-black/75 transition duration-300 rounded-lg p-3 text-center w-full h-48 relative',
            )}
            style={{ borderColor: primary }}
        >
            <div className={'absolute top-0 right-0 p-2 text-gray-400 text-xs font-semibold'}>
                <FontAwesomeIcon icon={faCircle} className={'text-green-500/75 mx-0.5'} size={'xs'} />
                <FontAwesomeIcon icon={faCircle} className={'text-yellow-500/75 mx-0.5'} size={'xs'} />
                <FontAwesomeIcon icon={faCircle} className={'text-red-500/75 mx-0.5'} size={'xs'} />
            </div>
            {children}
        </div>
    );
};

export default () => {
    const { status, setStatus } = useStatus();
    const { clearAndAddHttpError } = useFlash();
    const [open, setOpen] = useState<boolean>(false);

    const { alert } = useStoreState(state => state.everest.data!);
    const { primary } = useStoreState(state => state.theme.data!.colors);
    const updateEverest = useStoreActions(actions => actions.everest.updateEverest);

    const submit = (pos: AlertPosition) => {
        setStatus('loading');

        updateAlertSettings({ position: pos })
            .then(uuid => {
                updateEverest({ alert: { ...alert, uuid, position: pos } });

                setStatus('success');
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'alerts:view', error });
                setStatus('error');
            });
    };

    return (
        <>
            <Dialog.Confirm
                open={open}
                buttonType={alert.type}
                onClose={() => setOpen(false)}
                title={capitalize(alert.type)}
                onConfirmed={() => setOpen(false)}
            >
                {alert.content}
            </Dialog.Confirm>
            <FlashMessageRender byKey={'alerts:view'} className={'mb-2'} />
            <AdminBox title={'Preview'} icon={faDesktop}>
                {alert.enabled && alert.position === 'top-center' ? (
                    <Alert type={alert.type}>{alert.content}</Alert>
                ) : alert.position === 'bottom-right' ? (
                    <>
                        <p className={'text-center text-lg text-gray-400 font-semibold'}>
                            Alert is being displayed in the bottom-right mode.
                        </p>
                        <div className={'fixed bottom-2 right-2 z-50 m-4'}>
                            <MessageBox type={alert.type as FlashMessageType}>{alert.content}</MessageBox>
                        </div>
                    </>
                ) : alert.position === 'bottom-left' ? (
                    <>
                        <p className={'text-center text-lg text-gray-400 font-semibold'}>
                            Alert is being displayed in the bottom-left mode.
                        </p>
                        <div className={'fixed bottom-2 left-64 z-50 m-4'}>
                            <MessageBox type={alert.type as FlashMessageType}>{alert.content}</MessageBox>
                        </div>
                    </>
                ) : alert.position === 'center' ? (
                    <p className={'text-center text-lg text-gray-400 font-semibold'}>
                        Alert is being displayed as a dialog in the center.
                    </p>
                ) : (
                    <p className={'text-center text-lg text-gray-400 font-semibold'}>
                        Alert is currently disabled, so no preview is available.
                    </p>
                )}
            </AdminBox>
            <div className={'mt-6'}>
                <AdminBox title={'Alert Format'} icon={faList} status={status}>
                    <div className={'grid md:grid-cols-4 gap-8'}>
                        <div onClick={() => submit('top-center' as AlertPosition)}>
                            <DemoBox selected={alert.position === 'top-center'}>
                                <div
                                    style={{ backgroundColor: primary }}
                                    className={'absolute inset-x-12 top-12 h-5 rounded'}
                                ></div>
                            </DemoBox>
                            <p className={'text-xs text-gray-400 mt-1'}>
                                Position the alert in the center of the page.
                            </p>
                        </div>
                        <div onClick={() => submit('bottom-right' as AlertPosition)}>
                            <DemoBox selected={alert.position === 'bottom-right'}>
                                <div
                                    style={{ backgroundColor: primary }}
                                    className={'absolute bottom-0 right-0 m-4 h-5 rounded-full w-24'}
                                >
                                    &nbsp;
                                </div>
                            </DemoBox>
                            <p className={'text-xs text-gray-400 mt-1'}>Position the alert to the bottom right.</p>
                        </div>
                        <div onClick={() => submit('bottom-left' as AlertPosition)}>
                            <DemoBox selected={alert.position === 'bottom-left'}>
                                <div
                                    style={{ backgroundColor: primary }}
                                    className={'absolute bottom-0 left-0 m-4 h-5 rounded-full w-24'}
                                >
                                    &nbsp;
                                </div>
                            </DemoBox>
                            <p className={'text-xs text-gray-400 mt-1'}>
                                Position the alert to the bottom left of the page.
                            </p>
                        </div>
                        <div
                            onClick={() => {
                                setOpen(true);
                                submit('center' as AlertPosition);
                            }}
                        >
                            <DemoBox selected={alert.position === 'center'}>
                                <div
                                    style={{ backgroundColor: primary }}
                                    className={
                                        'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-20 w-32 rounded'
                                    }
                                >
                                    &nbsp;
                                </div>
                            </DemoBox>
                            <p className={'text-xs text-gray-400 mt-1'}>
                                Position the alert in the center of the page as a dialog.
                            </p>
                        </div>
                    </div>
                </AdminBox>
            </div>
        </>
    );
};
