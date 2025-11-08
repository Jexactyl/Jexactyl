import Stepper from '@/elements/Stepper';
import { faArrowRight, faCheck, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import Spinner from '@/elements/Spinner';
import { useStoreState } from '@/state/hooks';
import ContentBox from '@/elements/ContentBox';
import { differenceInDays, parseISO } from 'date-fns';
import SuccessChart from './SuccessChart';
import RevenueChart from './RevenueChart';
import Select from '@/elements/Select';
import SetupStripe from '@admin/modules/billing/guides/SetupStripe';
import { getBillingAnalytics } from '@/api/routes/admin/billing';
import { BillingAnalytics, Order } from '@definitions/admin';

export default () => {
    const now = new Date();
    const [history, setHistory] = useState<number>(14);
    const settings = useStoreState(s => s.everest.data!.billing);
    const [analytics, setAnalytics] = useState<BillingAnalytics>();

    useEffect(() => {
        getBillingAnalytics()
            .then(data => setAnalytics(data))
            .catch(error => console.error(error));
    }, []);

    if (!analytics || !analytics.orders) return <Spinner size={'large'} centered />;

    const hasProducts = analytics.products?.length ?? 0 >= 1;
    const hasOrders = analytics.orders?.length ?? 0 >= 1;

    const successfulOrders: Order[] = analytics.orders.filter(
        x => x.status === 'processed' && differenceInDays(now, parseISO(x.created_at.toString())) <= history,
    );
    const allOrders: Order[] = analytics.orders.filter(
        x => differenceInDays(now, parseISO(x.created_at.toString())) <= history,
    );
    const successRate: string = ((successfulOrders.length / allOrders.length) * 100).toFixed(1);

    const revenue: string = successfulOrders.reduce((total, order) => total + order.total, 0).toFixed(2);

    return (
        <div className={'grid lg:grid-cols-5 gap-4'}>
            <SetupStripe />
            <ol className="space-y-4 w-full">
                <Select onChange={e => setHistory(Number(e.currentTarget.value))}>
                    <option value={7}>Last 7 days</option>
                    <option selected value={14}>
                        Last 14 days
                    </option>
                    <option value={30}>Last month</option>
                    <option value={60}>Last 2 months</option>
                    <option value={90}>Last 3 months</option>
                    <option value={180}>Last 6 months</option>
                    <option value={360}>Last year</option>
                </Select>
                <h2 className={'text-neutral-300 mb-4 px-4 text-2xl'}>Suggested Actions</h2>
                <Stepper className={'text-green-500'} icon={faCheck} content={'Enable billing module'} />
                <Stepper
                    className={hasProducts ? 'text-green-500' : 'text-blue-500'}
                    icon={hasProducts ? faCheck : faArrowRight}
                    content={'Add your first product'}
                    link={'/admin/billing/categories'}
                />
                <Stepper
                    className={hasOrders ? 'text-green-500' : hasProducts ? 'text-blue-500' : 'text-gray-500'}
                    icon={hasOrders ? faCheck : faEllipsis}
                    content={'Secure your first sale'}
                    link={'/admin/billing/orders'}
                />
                <Stepper
                    className={settings.link || settings.paypal ? 'text-green-500' : 'text-blue-500'}
                    icon={settings.link || settings.paypal ? faCheck : faArrowRight}
                    content={'Add PayPal support'}
                    link={'/admin/billing/settings'}
                />
            </ol>
            <div className={'flex flex-col items-center rounded-lg shadow md:flex-row col-span-4'}>
                <div className={'w-full grid grid-cols-3 mb-auto gap-6'}>
                    <ContentBox>
                        <h1 className={'text-2xl font-bold'}>
                            <span className={'text-4xl'}>{successRate}</span>% conversion rate
                        </h1>
                        <p className={'text-gray-400 text-sm mt-2'}>
                            Out of {allOrders.length} orders, {successfulOrders.length} were processed.
                        </p>
                        <SuccessChart data={analytics} history={history} />
                    </ContentBox>
                    <ContentBox className={'col-span-2'}>
                        <h1 className={'text-2xl font-bold'}>
                            {settings.currency.symbol}
                            <span className={'text-4xl'}>{revenue}</span> total revenue
                        </h1>
                        <p className={'text-gray-400 text-sm mt-2'}>
                            Your {successfulOrders.length} successful orders have generated {settings.currency.symbol}
                            {revenue} {settings.currency.code} over the last {history} days.
                        </p>
                        <RevenueChart data={analytics} history={history} />
                    </ContentBox>
                </div>
            </div>
        </div>
    );
};
