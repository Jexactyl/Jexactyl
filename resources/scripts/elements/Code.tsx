import * as React from 'react';
import classNames from 'classnames';

interface CodeProps {
    dark?: boolean | undefined;
    className?: string;
    children: React.ReactChild | React.ReactFragment | React.ReactPortal;
}

export default ({ dark, className, children }: CodeProps) => (
    <code
        className={classNames(
            'inline-block rounded-md px-2 py-1 font-mono text-sm shadow-inner ring-1 ring-black/10',
            className,
            {
                'bg-neutral-700/80': !dark,
                'bg-neutral-900/90 text-slate-100': dark,
            },
        )}
    >
        {children}
    </code>
);
