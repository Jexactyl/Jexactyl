import { useStoreState } from '@/state/hooks';
import { Dispatch, SetStateAction } from 'react';
import GreyRowBox from '@/elements/GreyRowBox';
import { CheckCircleIcon, CubeIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import { type Egg } from '@definitions/account/billing';

interface Props {
    egg: Egg;
    selected: number | undefined;
    setSelected: Dispatch<SetStateAction<number | undefined>>;
}

export default ({ egg, selected, setSelected }: Props) => {
    const { colors } = useStoreState(s => s.theme.data!);

    return (
        <div onClick={() => setSelected(egg.id)} className={'relative'}>
            <GreyRowBox>
                <CheckCircleIcon
                    className={classNames(
                        'transition-colors duration-500 absolute w-5 h-5 top-2 right-2',
                        selected === egg.id ? 'text-green-500' : 'text-gray-500',
                    )}
                />
                <CubeIcon className={'mr-2 w-8 h-8'} style={{ color: colors.primary }} />
                <p className={'text-gray-200 font-semibold'}>{egg.name}</p>
            </GreyRowBox>
        </div>
    );
};
