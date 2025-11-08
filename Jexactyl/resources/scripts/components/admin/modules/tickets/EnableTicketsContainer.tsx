import { useStoreState } from '@/state/hooks';
import SupportSvg from '@/assets/images/themed/SupportSvg';
import { faTicket } from '@fortawesome/free-solid-svg-icons';
import FeatureContainer from '@/elements/FeatureContainer';
import ToggleTicketsButton from '@admin/modules/tickets/ToggleTicketsButton';

export default () => {
    const primary = useStoreState(state => state.theme.data!.colors.primary);

    return (
        <FeatureContainer image={<SupportSvg color={primary} />} icon={faTicket} title={'Ticket System'}>
            Jexactyl&apos;s ticket interface allows your users to create tickets for support on the panel. Users can
            create, update and view tickets which admins can reply to and mark as a certain status. This feature can be
            toggled at anytime to suit your business&apos; needs.
            <p className={'text-right'}>
                <ToggleTicketsButton />
            </p>
        </FeatureContainer>
    );
};
