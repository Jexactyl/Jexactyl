import sendPowerAction from '@/api/server/sendPowerAction';
import { faCircleNodes, faList, faPlay, faPowerOff, faRotateForward, faSkull } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@elements/dialog';
import TitledGreyBox from '../elements/TitledGreyBox';
import { Button } from '../elements/button';
import { Dispatch, SetStateAction } from 'react';
import { Server } from '@/api/server/getServer';
import { ServerStats } from '@/api/server/getServerResourceUsage';
import { PowerAction } from '../server/console/ServerConsoleContainer';
import useFlash from '@/plugins/useFlash';
import { statusToColor } from '@/components/dashboard/ServerRow';
import Input from '../elements/Input';
import Label from '../elements/Label';
import CopyOnClick from '../elements/CopyOnClick';

interface Props {
    server: Server;
    open: boolean;
    stats?: ServerStats | null;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export default (props: Props) => {
    const { addFlash } = useFlash();
    const state = props.stats?.status || 'offline';

    const onClick = (action: PowerAction) => {
        props.setOpen(false);

        if (!props.server.status) {
            sendPowerAction(props.server.uuid, action);

            addFlash({
                key: 'dashboard',
                type: 'success',
                message: `Power action sent to instance ${props.server.id}.`,
            });
        } else {
            addFlash({
                key: 'dashboard',
                type: 'error',
                message: `Unable to send power action: server marked as ${props.server.status}. Please contact an administrator`,
            });
        }
    };

    return (
        <Dialog title={`Server options: ${props.server.name}`} open={props.open} onClose={() => props.setOpen(false)}>
            <div className={'grid lg:grid-cols-3 gap-3 mt-6'}>
                <TitledGreyBox title={'Power Options'} icon={faPowerOff} className={'lg:col-span-2'}>
                    This server is currently&nbsp;
                    <span className={statusToColor(state)}>{state}</span>.
                    <div className={'grid grid-cols-4 gap-2 mt-2'}>
                        <Button onClick={() => onClick('start')} disabled={state !== 'offline'}>
                            <FontAwesomeIcon icon={faPlay} />
                        </Button>
                        <Button.Text disabled={state !== 'running'} onClick={() => onClick('restart')}>
                            <FontAwesomeIcon icon={faRotateForward} />
                        </Button.Text>
                        <Button.Text onClick={() => onClick('stop')} disabled={state !== 'running'}>
                            <FontAwesomeIcon icon={faPowerOff} />
                        </Button.Text>
                        <Button.Danger onClick={() => onClick('kill')} disabled={state !== 'stopping'}>
                            <FontAwesomeIcon icon={faSkull} />
                        </Button.Danger>
                    </div>
                </TitledGreyBox>
                <TitledGreyBox title={'State'} icon={faCircleNodes} className={'lg:col-span-1'}>
                    <p className={'text-xl text-center font-semibold'}>{props.server.status ?? 'Available'}</p>
                </TitledGreyBox>
                <TitledGreyBox title={'Details'} icon={faList} className={'lg:col-span-3'}>
                    <Label>Connection ID</Label>
                    <CopyOnClick
                        text={`${props.server.allocations[0]!.ip}:${props.server.allocations[0]!.port}`}
                        showInNotification
                    >
                        <Input
                            disabled
                            placeholder={`${props.server.allocations[0]!.ip}:${props.server.allocations[0]!.port}`}
                        />
                    </CopyOnClick>
                    <Label className={'my-6'}>Unique Identifier</Label>
                    <Input disabled placeholder={props.server.uuid} />
                    <Label className={'my-6'}>Linked Node</Label>
                    <Input disabled placeholder={props.server.node} />
                </TitledGreyBox>
            </div>
        </Dialog>
    );
};
