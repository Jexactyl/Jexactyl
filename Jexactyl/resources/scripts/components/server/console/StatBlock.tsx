import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useFitText } from '@flyyer/use-fit-text';
import CopyOnClick from '@/elements/CopyOnClick';
import Icon from '@/elements/Icon';
import styles from './style.module.css';
import { useStoreState } from '@/state/hooks';

interface StatBlockProps {
    title: string;
    copyOnClick?: string;
    color?: string | undefined;
    dark?: boolean | undefined;
    icon?: IconDefinition | undefined;
    children: ReactNode;
    className?: string;
}

function StatBlock({ title, copyOnClick, icon, color, dark, className, children }: StatBlockProps) {
    const colors = useStoreState(state => state.theme.data!.colors);
    const { fontSize, ref } = useFitText({ minFontSize: 8, maxFontSize: 500 });

    return (
        <CopyOnClick text={copyOnClick}>
            <div
                className={classNames(styles.stat_block, className)}
                style={{ backgroundColor: dark ? colors.headers : colors.secondary }}
            >
                <div className={classNames(styles.status_bar || 'bg-slate-700')} />
                {icon && (
                    <div className={classNames(styles.icon, 'bg-black/50')}>
                        <Icon icon={icon} style={{ color: color ?? colors.primary }} />
                    </div>
                )}
                <div className={'flex w-full flex-col justify-center overflow-hidden'}>
                    <p className={'font-header text-xs leading-tight text-slate-200 md:text-sm'}>{title}</p>
                    <div
                        ref={ref}
                        className={'h-[1.75rem] w-full truncate font-semibold text-slate-50'}
                        style={{ fontSize }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </CopyOnClick>
    );
}

export default StatBlock;
