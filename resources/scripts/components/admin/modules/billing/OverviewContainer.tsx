import AdminBox from '@elements/AdminBox';
import ToggleFeatureButton from '@admin/modules/billing/ToggleFeatureButton';

export default () => {
    //

    return (
        <div className={'grid lg:grid-cols-3 gap-4'}>
            <AdminBox title={'Orders (last 7d)'}>Chart</AdminBox>
            <AdminBox title={'Payments (last 7d)'}>Chart</AdminBox>
            <AdminBox title={'Disable Billing Module'}>
                Clicking the button below will disable all modules of the billing system - such as subscriptions, server
                purchasing and more. Make sure that this will not impact your users before disabling.
                <div className={'text-right mt-2'}>
                    <ToggleFeatureButton />
                </div>
            </AdminBox>
        </div>
    );
};
