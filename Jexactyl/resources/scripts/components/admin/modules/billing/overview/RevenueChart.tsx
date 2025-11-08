import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { format, startOfDay, endOfDay, isWithinInterval, eachDayOfInterval } from 'date-fns';
import { useStoreState } from '@/state/hooks';
import { BillingAnalytics } from '@definitions/admin';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default ({ data, history }: { data: BillingAnalytics; history: number }) => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - history);
    const symbol = useStoreState(s => s.everest.data!.billing.currency.symbol);

    const daysRange = eachDayOfInterval({
        start: startOfDay(startDate),
        end: endOfDay(now),
    });

    const dailyRevenue = daysRange.map(date => {
        const revenueForDay = data.orders
            .filter(order => {
                const createdAt = new Date(order.created_at);
                return (
                    order.status === 'processed' &&
                    isWithinInterval(createdAt, { start: startOfDay(date), end: endOfDay(date) })
                );
            })
            .reduce((total, order) => {
                return total + (order.total || 0);
            }, 0);

        return revenueForDay;
    });

    const chartData = {
        labels: daysRange.map(day => format(day, 'yyyy-MM-dd')),
        datasets: [
            {
                label: 'Revenue from Successful Orders',
                data: dailyRevenue,
                fill: false,
                borderColor: '#36A2EB',
                tension: 0.1,
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
                        return `${symbol}${context.raw}`;
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date',
                },
            },
            y: {
                title: {
                    display: true,
                    text: `Revenue in ${symbol}`,
                },
                beginAtZero: true,
            },
        },
    };

    return <Line data={chartData} options={chartOptions} />;
};
