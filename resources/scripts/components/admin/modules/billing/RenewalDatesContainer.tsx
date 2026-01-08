import { useState } from 'react';
import AdminBox from '@/elements/AdminBox';
import { Button } from '@/elements/button';
import { useStoreActions, useStoreState } from '@/state/hooks';
import { faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';
import Label from '@/elements/Label';
import Input from '@/elements/Input';
import { updateSettings } from '@/api/routes/admin/billing';
import FlashMessageRender from '@/elements/FlashMessageRender';
import useFlash from '@/plugins/useFlash';

export default () => {
    const settings = useStoreState(s => s.everest.data!.billing);
    const updateEverest = useStoreActions(s => s.everest.updateEverest);
    const { clearFlashes, addFlash } = useFlash();

    const [paidRenewalDays, setPaidRenewalDays] = useState<number>(settings.renewal?.days || 30);
    const [freeRenewalDays, setFreeRenewalDays] = useState<number>(settings.renewal?.free_renewal_days || 30);
    const [freeGraceDays, setFreeGraceDays] = useState<number>(
        settings.renewal?.free_suspension_days || 7
    );
    const [paidGraceDays, setPaidGraceDays] = useState<number>(
        settings.renewal?.paid_suspension_days || 30
    );
    const [loading, setLoading] = useState(false);

    const handleSaveAll = async () => {
        clearFlashes('admin:billing');
        setLoading(true);

        try {
            // Save all settings in sequence
            await updateSettings('renewal:days', paidRenewalDays);
            await updateSettings('renewal:free_renewal_days', freeRenewalDays);
            await updateSettings('renewal:free_suspension_days', freeGraceDays);
            await updateSettings('renewal:paid_suspension_days', paidGraceDays);

            // Update state with all new values
            updateEverest({
                billing: {
                    ...settings,
                    renewal: {
                        ...settings.renewal,
                        days: paidRenewalDays,
                        free_renewal_days: freeRenewalDays,
                        free_suspension_days: freeGraceDays,
                        paid_suspension_days: paidGraceDays,
                    },
                },
            });

            addFlash({
                key: 'admin:billing',
                type: 'success',
                message: 'Renewal settings updated successfully.',
            });
        } catch (error) {
            console.error(error);
            addFlash({
                key: 'admin:billing',
                type: 'error',
                message: 'Failed to update renewal settings.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <FlashMessageRender byKey={'admin:billing'} className={'mb-4'} />

            <div className={'grid lg:grid-cols-2 gap-4'}>
                <AdminBox title={'Paid Renewal Period (Days)'} icon={faCalendar}>
                    <p className={'text-gray-400 mb-4'}>
                        Number of days a paid server subscription lasts when purchased or renewed.
                    </p>
                    <div>
                        <Label>Days</Label>
                        <Input
                            type={'number'}
                            min={1}
                            max={365}
                            value={paidRenewalDays}
                            onChange={e => setPaidRenewalDays(parseInt(e.target.value) || 30)}
                            disabled={loading}
                        />
                        <p className={'text-xs text-gray-500 mt-2'}>
                            When a paid server is purchased or renewed, it will be active for this many days.
                        </p>
                    </div>
                </AdminBox>

                <AdminBox title={'Paid Grace Period (Days)'} icon={faClock}>
                    <p className={'text-gray-400 mb-4'}>
                        Number of days after expiration before a paid server is automatically suspended.
                    </p>
                    <div>
                        <Label>Days</Label>
                        <Input
                            type={'number'}
                            min={0}
                            max={90}
                            value={paidGraceDays}
                            onChange={e => setPaidGraceDays(parseInt(e.target.value) || 30)}
                            disabled={loading}
                        />
                        <p className={'text-xs text-gray-500 mt-2'}>
                            Paid servers will be suspended this many days after their renewal date passes.
                        </p>
                    </div>
                </AdminBox>

                <AdminBox title={'Free Renewal Period (Days)'} icon={faCalendar}>
                    <p className={'text-gray-400 mb-4'}>
                        Number of days a free server subscription lasts when created or renewed.
                    </p>
                    <div>
                        <Label>Days</Label>
                        <Input
                            type={'number'}
                            min={1}
                            max={365}
                            value={freeRenewalDays}
                            onChange={e => setFreeRenewalDays(parseInt(e.target.value) || 30)}
                            disabled={loading}
                        />
                        <p className={'text-xs text-gray-500 mt-2'}>
                            When a free server is created or renewed, it will be active for this many days.
                        </p>
                    </div>
                </AdminBox>

                <AdminBox title={'Free Grace Period (Days)'} icon={faClock}>
                    <p className={'text-gray-400 mb-4'}>
                        Number of days after expiration before a free server is automatically suspended. Free servers
                        can only be renewed before this grace period expires.
                    </p>
                    <div>
                        <Label>Days</Label>
                        <Input
                            type={'number'}
                            min={0}
                            max={90}
                            value={freeGraceDays}
                            onChange={e => setFreeGraceDays(parseInt(e.target.value) || 7)}
                            disabled={loading}
                        />
                        <p className={'text-xs text-gray-500 mt-2'}>
                            Free servers will be suspended this many days after their renewal date passes. Self-service
                            renewal is only available during this grace period.
                        </p>
                    </div>
                </AdminBox>
            </div>

            <div className={'flex justify-end mt-6'}>
                <Button onClick={handleSaveAll} disabled={loading}>
                    {loading ? 'Saving...' : 'Save All Settings'}
                </Button>
            </div>
        </div>
    );
};
