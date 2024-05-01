import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ReactNode } from 'react';
import tw from 'twin.macro';
import SpinnerOverlay from '@elements/SpinnerOverlay';
import { useStoreState } from '@/state/hooks';
import Spinner from '@elements/Spinner';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/outline';
import FlashMessageRender from '@/components/FlashMessageRender';
import { Status } from '@/plugins/useStatus';
import classNames from 'classnames';

interface Props {
    icon?: IconProp;
    isLoading?: boolean;
    title: string | ReactNode;
    className?: string;
    noPadding?: boolean;
    byKey?: string;
    children: ReactNode;
    button?: ReactNode;

    status?: Status;
    canDelete?: boolean;
}

const AdminBox = ({
    icon,
    title,
    className,
    isLoading,
    children,
    button,
    noPadding,
    byKey,
    status,
    canDelete,
}: Props) => {
    const theme = useStoreState(state => state.theme.data!);

    let position = 'right-0';
    if (canDelete) position = 'right-8';

    return (
        <div
            className={className}
            css={tw`relative rounded shadow-md transition duration-300`}
            style={{ backgroundColor: theme.colors.secondary }}
        >
            <SpinnerOverlay visible={isLoading || false} />
            {status === 'loading' && (
                <Spinner className={classNames(position, 'absolute top-0 m-3.5')} size={'small'} />
            )}
            {status === 'success' && (
                <CheckCircleIcon className={classNames(position, 'w-5 h-5 absolute top-0 m-3.5 text-green-500')} />
            )}
            {status === 'error' && (
                <ExclamationCircleIcon
                    className={classNames(position, 'w-5 h-5 absolute top-0 right-8 m-3.5 text-red-500')}
                />
            )}
            <div
                style={{ backgroundColor: theme.colors.headers }}
                css={tw`flex flex-row rounded-t px-4 xl:px-5 py-3 border-b border-black transition duration-300`}
            >
                {typeof title === 'string' ? (
                    <p css={tw`font-semibold`}>
                        {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2 text-neutral-300`} />}
                        {title}
                    </p>
                ) : (
                    title
                )}
                {button}
            </div>
            <div css={[!noPadding && tw`px-4 xl:px-5 py-5`]}>
                <FlashMessageRender byKey={byKey ?? 'null'} className={'mb-3'} />
                {children}
            </div>
        </div>
    );
};

export default AdminBox;
