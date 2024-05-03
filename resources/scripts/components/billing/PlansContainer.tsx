import Spinner from '@elements/Spinner';
import useFlash from '@/plugins/useFlash';
import { useEffect, useState } from 'react';
import PageContentBlock from '@elements/PageContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import { Body, BodyItem, Header, HeaderItem, Table } from '@elements/Table';
import { BillingPlan, BillingPlanState, getBillingPlans } from '@/api/billing/getBillingPlans';
import Pill, { PillStatus } from '../elements/Pill';

function getFormatted(date: number): string {
    let prefix = 'th';

    console.log(date);

    switch (date) {
        case 1:
        case 21:
        case 31:
            prefix = 'st';
            break;
        case 2:
        case 22:
            prefix = 'nd';
            break;
        case 3:
            prefix = 'rd';
            break;
        default:
            break;
    }

    return `${date}${prefix}`;
}

function getType(state: BillingPlanState): PillStatus {
    switch (state) {
        case 'paid':
            return 'success';
        case 'arrears':
        case 'cancelled':
        case 'terminated':
            return 'danger';
        case 'processing':
        case 'due':
            return 'warn';
        default:
            return 'unknown';
    }
}

export default () => {
    const [plans, setPlans] = useState<BillingPlan[] | undefined>();
    const [loading, setLoading] = useState<boolean>(false);

    const { clearFlashes, clearAndAddHttpError } = useFlash();

    useEffect(() => {
        clearFlashes();
        setLoading(true);

        getBillingPlans()
            .then(data => setPlans(data))
            .then(() => setLoading(false))
            .catch(error => {
                setLoading(false);
                clearAndAddHttpError({ key: 'billing:plans', error });
            });
    }, []);

    return (
        <PageContentBlock>
            <div className={'text-3xl lg:text-5xl font-bold mt-8 mb-12'}>
                Billing Activity
                <p className={'text-gray-400 font-normal text-sm mt-1'}>
                    View and manage the active and previous subscriptions you&apos;ve created.
                </p>
                <FlashMessageRender byKey={'billing:plans'} className={'mt-4'} />
            </div>
            <div className={'text-gray-400 text-center'}>
                {loading ? (
                    <Spinner centered />
                ) : !plans || plans.length < 1 ? (
                    "No items could be found. Create a new plan on the 'Order' tab."
                ) : (
                    <Table>
                        <Header>
                            <HeaderItem>Name</HeaderItem>
                            <HeaderItem>Price</HeaderItem>
                            <HeaderItem>Bill Date</HeaderItem>
                            <HeaderItem>Description</HeaderItem>
                            <HeaderItem>&nbsp;</HeaderItem>
                        </Header>
                        <Body>
                            {plans.map(plan => (
                                <BodyItem item={plan.name} key={plan.id}>
                                    <td className={'px-6 py-4 text-white'}>${plan.price}/mo</td>
                                    <td className={'px-6 py-4'}>{getFormatted(plan.billDate)} of month</td>
                                    <td className={'px-6 py-4'}>{plan.description}</td>
                                    <td className={'pr-12 py-4 text-right'}>
                                        <Pill type={getType(plan.state)}>{plan.state}</Pill>
                                    </td>
                                </BodyItem>
                            ))}
                        </Body>
                    </Table>
                )}
            </div>
        </PageContentBlock>
    );
};
