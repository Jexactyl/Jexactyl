import { type Schedule } from '@definitions/server';
import { useStoreState } from '@/state/hooks';
import classNames from 'classnames';

interface Props {
    cron: Schedule['cron'];
    className?: string;
}

const ScheduleCronRow = ({ cron, className }: Props) => {
    const { colors } = useStoreState(state => state.theme.data!);

    return (
        <div className={classNames('flex', className)} style={{ backgroundColor: colors.secondary }}>
            <div className={'w-1/5 text-center sm:w-auto'}>
                <p className={'font-medium'}>{cron.minute}</p>
                <p className={'text-2xs uppercase text-neutral-500'}>Minute</p>
            </div>
            <div className={'ml-4 w-1/5 text-center sm:w-auto'}>
                <p className={'font-medium'}>{cron.hour}</p>
                <p className={'text-2xs uppercase text-neutral-500'}>Hour</p>
            </div>
            <div className={'ml-4 w-1/5 text-center sm:w-auto'}>
                <p className={'font-medium'}>{cron.dayOfMonth}</p>
                <p className={'text-2xs uppercase text-neutral-500'}>Day (Month)</p>
            </div>
            <div className={'ml-4 w-1/5 text-center sm:w-auto'}>
                <p className={'font-medium'}>{cron.month}</p>
                <p className={'text-2xs uppercase text-neutral-500'}>Month</p>
            </div>
            <div className={'ml-4 w-1/5 text-center sm:w-auto'}>
                <p className={'font-medium'}>{cron.dayOfWeek}</p>
                <p className={'text-2xs uppercase text-neutral-500'}>Day (Week)</p>
            </div>
        </div>
    );
};

export default ScheduleCronRow;
