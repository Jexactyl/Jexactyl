import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
};

const PageTransition = ({ children }: { children: ReactNode }) => (
    <motion.div
        variants={variants}
        initial={'initial'}
        animate={'animate'}
        exit={'exit'}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className={'w-full'}
    >
        {children}
    </motion.div>
);

export default PageTransition;
