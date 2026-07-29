import { ReactNode } from 'react';
import classNames from 'classnames';
import { useStoreState } from '@/state/hooks';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { hexToRgba } from '@/lib/helpers';

interface Props {
    icon: IconDefinition;
    label: string;
    value: ReactNode;
    caption?: ReactNode;
    className?: string;
}

export default ({ icon, label, value, caption, className }: Props) => {
    const { colors } = useStoreState(state => state.theme.data!);

    return (
        <div
            className={classNames('p-4 rounded-xl shadow-lg ring-1 ring-white/5', className)}
            style={{ backgroundColor: colors.secondary }}
        >
            <div className={'flex items-center justify-between'}>
                <p className={'text-gray-400 text-xs font-semibold uppercase tracking-wide'}>{label}</p>
                <div
                    className={'w-8 h-8 rounded-lg flex items-center justify-center shrink-0'}
                    style={{ backgroundColor: hexToRgba(colors.primary, 0.1) }}
                >
                    <FontAwesomeIcon icon={icon} className={'w-3.5 h-3.5'} style={{ color: colors.primary }} />
                </div>
            </div>
            <p className={'text-2xl lg:text-3xl font-bold font-header mt-3 text-neutral-100 truncate'}>{value}</p>
            {caption && <p className={'text-gray-500 text-xs mt-1'}>{caption}</p>}
        </div>
    );
};
