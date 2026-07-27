import React from 'react';
import classNames from 'classnames';

interface AlertProps {
    type: 'success' | 'info' | 'warning' | 'danger';
    className?: string;
    children: React.ReactNode;
    small?: boolean;
}

export default ({ type, className, children, small }: AlertProps) => {
    return (
        <div
            className={classNames(
                'flex items-center border-l-4 text-gray-50 rounded-lg shadow-md backdrop-blur-sm transition-colors duration-200',
                small ? 'px-2 py-2 text-xs' : 'px-4 py-3',
                {
                    ['border-green-500 bg-green-500/10']: type === 'success',
                    ['border-blue-500 bg-blue-500/10']: type === 'info',
                    ['border-yellow-500 bg-yellow-500/10']: type === 'warning',
                    ['border-red-500 bg-red-500/10']: type === 'danger',
                },
                className,
            )}
        >
            {children}
        </div>
    );
};
