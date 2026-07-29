import { ReactNode } from 'react';
import { useStoreState } from '@/state/hooks';

interface Props {
    value: number;
    size?: number;
    strokeWidth?: number;
    label?: ReactNode;
}

export default ({ value, size = 96, strokeWidth = 8, label }: Props) => {
    const { colors } = useStoreState(state => state.theme.data!);

    const clamped = Math.min(100, Math.max(0, value));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clamped / 100) * circumference;

    return (
        <div className={'relative inline-flex items-center justify-center'} style={{ width: size, height: size }}>
            <svg width={size} height={size} className={'-rotate-90'}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill={'none'}
                    stroke={'currentColor'}
                    className={'text-gray-700'}
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill={'none'}
                    stroke={colors.primary}
                    strokeWidth={strokeWidth}
                    strokeLinecap={'round'}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                />
            </svg>
            {label && <div className={'absolute inset-0 flex items-center justify-center'}>{label}</div>}
        </div>
    );
};
