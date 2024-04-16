import { forwardRef } from 'react';
import classNames from 'classnames';

import type { ButtonProps } from '@/components/elements/button/types';
import { Options } from '@/components/elements/button/types';
import styles from './style.module.css';
import { useStoreState } from '@/state/hooks';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, shape, size, variant, className, ...rest }, ref) => {
        return (
            <button
                ref={ref}
                className={classNames(
                    styles.button,
                    {
                        [styles.secondary]: variant === Options.Variant.Secondary,
                        [styles.square]: shape === Options.Shape.IconSquare,
                        [styles.small]: size === Options.Size.Small,
                        [styles.large]: size === Options.Size.Large,
                    },
                    className,
                )}
                {...rest}
            >
                {children}
            </button>
        );
    },
);

const StandardButton = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => {
    const { primary } = useStoreState(state => state.theme.data!.colors);

    return (
        // @ts-expect-error not sure how to get this correct
        <Button ref={ref} className={className} style={{ backgroundColor: primary }} {...props} />
    );
});

const TextButton = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
    // @ts-expect-error not sure how to get this correct
    <Button ref={ref} className={classNames(styles.text, className)} {...props} />
));

const DangerButton = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
    // @ts-expect-error not sure how to get this correct
    <Button ref={ref} className={classNames(styles.danger, className)} {...props} />
));

const InfoButton = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
    // @ts-expect-error not sure how to get this correct
    <Button ref={ref} className={classNames(styles.info, className)} {...props} />
));

const WarnButton = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
    // @ts-expect-error not sure how to get this correct
    <Button ref={ref} className={classNames(styles.warn, className)} {...props} />
));

const _Button = Object.assign(StandardButton, {
    Sizes: Options.Size,
    Shapes: Options.Shape,
    Variants: Options.Variant,
    Text: TextButton,
    Danger: DangerButton,
    Info: InfoButton,
    Warn: WarnButton,
});

export default _Button;
