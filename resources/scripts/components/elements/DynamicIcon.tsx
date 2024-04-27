import { FC } from 'react';
import * as HIcons from '@heroicons/react/outline';

const DynamicIcon: FC<{ className?: string; icon: string }> = props => {
    const { ...icons } = HIcons;
    // @ts-expect-error don't worry about it.
    const TheIcon: JSX.Element = icons[props.icon];

    // @ts-expect-error this is fine
    return <TheIcon className={props.className} />;
};

export default DynamicIcon;
