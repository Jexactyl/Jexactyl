import { differenceInDays, parseISO } from 'date-fns';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { BillingAnalytics } from '@definitions/admin';

ChartJS.register(ArcElement, Tooltip, Legend);

export default ({ data, history }: { data: BillingAnalytics; history: number }) => {
    const now = new Date();

    const successfulOrders: number = data.orders.filter(
        x => x.status === 'processed' && differenceInDays(now, parseISO(x.created_at.toString())) <= history,
    ).length;

    const failedOrders: number = data.orders.filter(
        x => x.status === 'failed' && differenceInDays(now, parseISO(x.created_at.toString())) <= history,
    ).length;

    const expiredOrders: number = data.orders.filter(
        x => x.status === 'expired' && differenceInDays(now, parseISO(x.created_at.toString())) <= history,
    ).length;

    const pendingOrders: number = data.orders.filter(
        x => x.status === 'pending' && differenceInDays(now, parseISO(x.created_at.toString())) <= history,
    ).length;

    const chartData = {
        labels: ['Successful Orders', 'Failed Orders', 'Expired Orders', 'Pending Orders'],
        datasets: [
            {
                label: 'Order Status',
                data: [successfulOrders, failedOrders, expiredOrders, pendingOrders],
                backgroundColor: ['green', 'red', 'gray', 'orange'],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const value = context.raw;
                        const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${context.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };

    return <Doughnut data={chartData} options={chartOptions} className={'p-4'} />;
};
