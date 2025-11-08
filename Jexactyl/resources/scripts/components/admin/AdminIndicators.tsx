import { useStoreState } from '@/state/hooks';
import Tooltip from '@/elements/tooltip/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollar, faKey, faRecycle, faTicket, IconDefinition } from '@fortawesome/free-solid-svg-icons';

export interface Props {
    text: string;
    icon: IconDefinition;
}

const Indicator = ({ text, icon }: Props) => {
    const { primary, secondary } = useStoreState(state => state.theme.data!.colors);

    return (
        <Tooltip content={text} placement={'left'}>
            <div className={'p-3 rounded-lg'} style={{ backgroundColor: secondary }}>
                <FontAwesomeIcon icon={icon} color={primary} fixedWidth />
            </div>
        </Tooltip>
    );
};

export default () => {
    const settings = useStoreState(state => state.settings.data!);
    const everest = useStoreState(state => state.everest.data!);

    return (
        <div className={'hidden md:block fixed top-3 right-3'}>
            <div className={'grid grid-cols-1 gap-y-2'}>
                {settings.auto_update && <Indicator text={'Automatic updates are enabled.'} icon={faRecycle} />}
                {everest.auth.registration.enabled && <Indicator text={'User registration is enabled.'} icon={faKey} />}
                {everest.billing.enabled && <Indicator text={'Billing module is enabled.'} icon={faDollar} />}
                {everest.tickets.enabled && <Indicator text={'Support ticket system is enabled.'} icon={faTicket} />}
            </div>
        </div>
    );
};
