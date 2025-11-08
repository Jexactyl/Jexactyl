import { useRef, useState } from 'react';
import * as React from 'react';
import { Dialog as HDialog } from '@headlessui/react';
import { Button } from '@/elements/button/index';
import { AnimatePresence, motion } from 'framer-motion';
import { DialogContext, IconPosition, RenderDialogProps } from './';
import { ReplyIcon, XIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import styles from './style.module.css';

const variants = {
    open: {
        scale: 1,
        opacity: 1,
        transition: {
            type: 'spring',
            damping: 15,
            stiffness: 300,
            duration: 0.15,
        },
    },
    closed: {
        scale: 0.75,
        opacity: 0,
        transition: {
            type: 'easeIn',
            duration: 0.15,
        },
    },
    bounce: {
        scale: 0.95,
        opacity: 1,
        transition: { type: 'linear', duration: 0.075 },
    },
};

const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-4xl',
    xl: 'max-w-7xl',
};

export default ({
    open,
    title,
    description,
    onClose,
    hideCloseIcon,
    preventExternalClose,
    children,
    subDialog,
    size = 'md',
}: RenderDialogProps) => {
    const container = useRef<HTMLDivElement>(null);
    const [icon, setIcon] = useState<React.ReactNode>();
    const [footer, setFooter] = useState<React.ReactNode>();
    const [iconPosition, setIconPosition] = useState<IconPosition>('title');
    const [down, setDown] = useState(false);

    const onContainerClick = (down: boolean, e: React.MouseEvent<HTMLDivElement>): void => {
        if (e.target instanceof HTMLElement && container.current?.isSameNode(e.target)) {
            setDown(down);
        }
    };

    const onDialogClose = (): void => {
        if (!preventExternalClose) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <DialogContext.Provider value={{ setIcon, setFooter, setIconPosition }}>
                    <HDialog
                        static
                        as={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        open={open}
                        onClose={onDialogClose}
                    >
                        <div className="fixed inset-0 z-40 bg-slate-900/50" />
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div
                                ref={container}
                                className={styles.container}
                                onMouseDown={e => onContainerClick(true, e)}
                                onMouseUp={e => onContainerClick(false, e)}
                            >
                                <HDialog.Panel
                                    as={motion.div}
                                    initial="closed"
                                    animate={down ? 'bounce' : 'open'}
                                    exit="closed"
                                    variants={variants}
                                    className={classNames(styles.panel, sizeMap[size])}
                                >
                                    <div className="flex overflow-y-auto p-6 pb-0">
                                        {iconPosition === 'container' && icon}
                                        <div className="max-h-[70vh] min-w-0 flex-1">
                                            <div className="flex items-center">
                                                {iconPosition !== 'container' && icon}
                                                <div>
                                                    {title && (
                                                        <HDialog.Title className={styles.title}>{title}</HDialog.Title>
                                                    )}
                                                    {description && (
                                                        <HDialog.Description>{description}</HDialog.Description>
                                                    )}
                                                </div>
                                            </div>
                                            {children}
                                            <div className="invisible h-6" />
                                        </div>
                                    </div>
                                    {footer}
                                    {!hideCloseIcon && (
                                        <div className="absolute right-0 top-0 m-4">
                                            <Button.Text
                                                size={Button.Sizes.Small}
                                                shape={Button.Shapes.IconSquare}
                                                onClick={onClose}
                                                className="group"
                                            >
                                                {subDialog ? (
                                                    <ReplyIcon className={styles.close_icon} />
                                                ) : (
                                                    <XIcon className={styles.close_icon} />
                                                )}
                                            </Button.Text>
                                        </div>
                                    )}
                                </HDialog.Panel>
                            </div>
                        </div>
                    </HDialog>
                </DialogContext.Provider>
            )}
        </AnimatePresence>
    );
};
