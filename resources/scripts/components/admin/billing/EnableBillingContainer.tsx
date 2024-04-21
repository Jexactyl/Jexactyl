import { useStoreState } from '@/state/hooks';
import { Button } from '@/components/elements/button';
import BillingSvg from '@/assets/images/themed/BillingSvg';
import { faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import FeatureContainer from '@/components/elements/FeatureContainer';

export default () => {
    const primary = useStoreState(state => state.theme.data!.colors.primary);

    return (
        <FeatureContainer image={<BillingSvg color={primary} />} icon={faMoneyBillWave} title={'Billing System'}>
            Use Jexactyl&apos;s billing and payment system to create subscriptions, manage customers and update
            balances. View PDF invoices, manually change subscription details and so much more with our easy-to-use
            interface and deep integration with third-party payment gateways like Stripe and PayPal.
            <p className={'text-right mt-2'}>
                <Button.Text disabled>Coming Soon</Button.Text>
            </p>
        </FeatureContainer>
    );
};
