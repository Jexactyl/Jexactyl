import * as React from 'react';
import { IconPosition } from '@/elements/dialog/DialogIcon';

type Callback<T> = ((value: T) => void) | React.Dispatch<React.SetStateAction<T>>;

export interface DialogProps {
    open: boolean;
    onClose: () => void;
}

export type IconPosition = 'title' | 'container' | undefined;

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DialogIconProps {
    type: 'danger' | 'info' | 'success' | 'warning';
    position?: IconPosition;
    className?: string;
}

export interface RenderDialogProps extends DialogProps {
    hideCloseIcon?: boolean;
    preventExternalClose?: boolean;
    title?: string;
    subDialog?: boolean;
    description?: string | undefined;
    children?: React.ReactNode;
    size?: DialogSize;
}

export type WrapperProps = Omit<RenderDialogProps, 'children' | 'open' | 'onClose'>;
export interface DialogWrapperContextType {
    props: Readonly<WrapperProps>;
    setProps: React.Dispatch<React.SetStateAction<WrapperProps>>;
    close: () => void;
}

export interface DialogContextType {
    setIcon: Callback<React.ReactNode>;
    setFooter: Callback<React.ReactNode>;
    setIconPosition: Callback<IconPosition>;
}
