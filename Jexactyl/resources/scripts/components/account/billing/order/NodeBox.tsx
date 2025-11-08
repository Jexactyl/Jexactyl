import { useStoreState } from '@/state/hooks';
import { Dispatch, SetStateAction } from 'react';
import GreyRowBox from '@/elements/GreyRowBox';
import { CheckCircleIcon, ServerIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import { type Node } from '@definitions/account/billing';

interface Props {
    node: Node;
    selected: number | undefined;
    setSelected: Dispatch<SetStateAction<number>>;
}

export default ({ node, selected, setSelected }: Props) => {
    const { colors } = useStoreState(s => s.theme.data!);

    return (
        <div onClick={() => setSelected(Number(node.id))} className={'relative'}>
            <GreyRowBox>
                <CheckCircleIcon
                    className={classNames(
                        'transition-colors duration-500 absolute w-5 h-5 top-2 right-2',
                        selected === Number(node.id) ? 'text-green-500' : 'text-gray-500',
                    )}
                />
                <ServerIcon className={'mr-2 w-8 h-8'} style={{ color: colors.primary }} />
                <p className={'text-gray-200 font-semibold'}>{node.name}</p>
            </GreyRowBox>
        </div>
    );
};
