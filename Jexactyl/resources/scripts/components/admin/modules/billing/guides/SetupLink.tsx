import { Dialog } from '@/elements/dialog';
import { Dispatch, SetStateAction } from 'react';
import { BillingSetupDialog } from '@admin/modules/billing/SettingsContainer';
import { Alert } from '@/elements/alert';
import Code from '@/elements/Code';
import { Button } from '@/elements/button';

export default ({ setOpen }: { setOpen: Dispatch<SetStateAction<BillingSetupDialog>> }) => {
    //

    return (
        <Dialog open onClose={() => setOpen('none')} title={'How to configure Link'}>
            Before Link payments can be accepted on your panel, you must enable the Link plugin in the Stripe dashboard.
            <Alert type={'warning'} className={'my-2'}>
                If you skip this step, Link payments will not work.
            </Alert>
            <p className={'text-lg font-semibold mt-4 text-white'}>1. Navigate to Stripe Dashboard</p>
            First, navigate to&nbsp;
            <a href={'https://dashboard.stripe.com'} className={'text-blue-300'}>
                Stripe
            </a>
            &nbsp;and login using your credentials. Then, once logged in, go to{' '}
            <Code>Settings {'>'} Payment Methods</Code> and select the payment method configuration to update.
            <p className={'text-lg font-semibold mt-4 text-white'}>2. Enable Link module in Stripe</p>
            Once you have navigated to the payment configuration page, scroll down and click the{' '}
            <Button.Text size={Button.Sizes.Small}>Turn On</Button.Text> button to activate it.
            <p className={'text-lg font-semibold mt-4 text-white'}>3. Check Jexactyl for Link method</p>
            Finally, go back to Jexactyl and visit the billing store. Select a plan, and head to the checkout. You
            should now be able to checkout with Link via Jexactyl.
            <Alert className={'mt-2'} type={'info'}>
                Link should now be working correctly. Any issues? Please visit our community Discord server and let us
                know.
            </Alert>
        </Dialog>
    );
};
