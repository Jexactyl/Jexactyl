import * as React from 'react';
import { Dialog, RenderDialogProps } from './';
import { Button } from '@/elements/button/index';

type ConfirmationProps = Omit<RenderDialogProps, 'description' | 'children'> & {
    children: React.ReactNode;
    confirm?: string | undefined;
    buttonType?: 'success' | 'info' | 'warning' | 'danger';
    onConfirmed: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export default ({ confirm = 'Okay', children, onConfirmed, buttonType, ...props }: ConfirmationProps) => {
    return (
        <Dialog {...props} description={typeof children === 'string' ? children : undefined}>
            {typeof children !== 'string' && children}
            <Dialog.Footer>
                <Button.Text onClick={props.onClose}>Cancel</Button.Text>
                {(!buttonType || buttonType === 'info') && <Button.Info onClick={onConfirmed}>{confirm}</Button.Info>}
                {buttonType === 'danger' && <Button.Danger onClick={onConfirmed}>{confirm}</Button.Danger>}
                {buttonType === 'warning' && <Button.Warn onClick={onConfirmed}>{confirm}</Button.Warn>}
                {buttonType === 'success' && <Button onClick={onConfirmed}>{confirm}</Button>}
            </Dialog.Footer>
        </Dialog>
    );
};
