import { useStoreState } from '@/state/hooks';
import { Dispatch, SetStateAction } from 'react';
import GreyRowBox from '@/elements/GreyRowBox';
import Money from '@/elements/billing/Money';
import { CheckCircleIcon, ServerIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import { type Node } from '@definitions/account/billing';

interface Props {
    node: Node;
    selected: number | undefined;
    setSelected: Dispatch<SetStateAction<number>>;
    disabled?: boolean;
}

export default ({ node, selected, setSelected, disabled }: Props) => {
    const { colors } = useStoreState(s => s.theme.data!);

    return (
        <div
            onClick={() => !disabled && setSelected(Number(node.id))}
            className={classNames('relative', disabled && 'opacity-50 cursor-not-allowed')}
        >
            <GreyRowBox>
                {!disabled && (
                    <CheckCircleIcon
                        className={classNames(
                            'transition-colors duration-500 absolute w-5 h-5 top-2 right-2',
                            selected === Number(node.id) ? 'text-green-500' : 'text-gray-500',
                        )}
                    />
                )}
                <ServerIcon className={'mr-2 w-8 h-8'} style={{ color: colors.primary }} />
                <p className={'text-gray-200 font-semibold'}>
                    {node.name}{' '}
                    <span className={'font-medium ml-2 text-gray-400 italic text-sm'}>
                        <code>{node.fqdn}</code> - {disabled ? 'Available for paid servers only' : 'available'}
                    </span>
                    {!disabled && node.deploymentFee > 0 && (
                        <span className={'block text-xs text-yellow-400 mt-0.5'}>
                            + <Money value={node.deploymentFee} /> one-time deployment fee
                        </span>
                    )}
                </p>
            </GreyRowBox>
        </div>
    );
};
