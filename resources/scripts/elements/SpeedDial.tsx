import { ComponentType, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/elements/button';
import { useStoreState } from '@/state/hooks';
import Tooltip from '@/elements/tooltip/Tooltip';
import { PlusIcon, ServerIcon, SparklesIcon, TicketIcon, UserAddIcon, ViewGridAddIcon } from '@heroicons/react/outline';

interface QuickActionProps {
    link: string;
    tooltip: string;
    icon: ComponentType<{ className?: string }>;
}

const QuickAction = ({ tooltip, icon: Icon, link }: QuickActionProps) => (
    <Tooltip placement={'left'} content={tooltip} arrow>
        <Link to={link}>
            <Button.Text className={'w-12 h-12 shadow-lg backdrop-blur-md'}>
                <Icon className={'w-5 h-5'} />
            </Button.Text>
        </Link>
    </Tooltip>
);

export default () => {
    const [open, setOpen] = useState<boolean>(false);
    const ai = useStoreState(s => s.everest.data!.ai.enabled);
    const enabled = useStoreState(s => s.settings.data!.speed_dial);
    const tickets = useStoreState(s => s.everest.data!.tickets.enabled);

    if (!enabled) return <></>;

    return (
        <div className="hidden md:block fixed bottom-6 right-6" style={{ zIndex: 9999 }}>
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="flex flex-col items-center mb-4 space-y-2"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={{
                            open: { transition: { staggerChildren: 0.04 } },
                            closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
                        }}
                    >
                        {[
                            ai && { icon: SparklesIcon, link: '/admin/ai', tooltip: 'Ask AI' },
                            { icon: ViewGridAddIcon, link: '/admin/nodes/new', tooltip: 'Create Node' },
                            { icon: ServerIcon, link: '/admin/servers/new', tooltip: 'Create Server' },
                            { icon: UserAddIcon, link: '/admin/users/new', tooltip: 'New User' },
                            tickets && { icon: TicketIcon, link: '/admin/tickets', tooltip: 'View Tickets' },
                        ]
                            .filter(Boolean)
                            .map((action, index) => {
                                const { icon, link, tooltip } = action as QuickActionProps;
                                return (
                                    <motion.div
                                        key={link + index}
                                        variants={{
                                            open: { opacity: 1, y: 0, scale: 1 },
                                            closed: { opacity: 0, y: 12, scale: 0.85 },
                                        }}
                                    >
                                        <QuickAction icon={icon} link={link} tooltip={tooltip} />
                                    </motion.div>
                                );
                            })}
                    </motion.div>
                )}
            </AnimatePresence>
            <Button
                className={'w-12 h-12 shadow-xl transition-transform duration-200 hover:scale-105'}
                onClick={() => setOpen(!open)}
            >
                <motion.span
                    animate={{ rotate: open ? 135 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={'flex'}
                >
                    <PlusIcon className={'w-5 h-5'} />
                </motion.span>
            </Button>
        </div>
    );
};
