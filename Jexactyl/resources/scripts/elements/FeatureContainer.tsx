import { useStoreState } from '@/state/hooks';
import { ReactElement, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';

interface Props {
    image: ReactElement;
    icon: IconDefinition;
    title: string;
    children: ReactNode;
    noHeight?: boolean;
}

export default ({ image, icon, title, children, noHeight }: Props) => {
    const primary = useStoreState(state => state.theme.data!.colors.primary);

    return (
        <div className={classNames(!noHeight && 'h-[80vh]', 'grid lg:grid-cols-2 gap-4 lg:gap-12 my-auto max-w-7xl')}>
            <span className={'hidden lg:flex'}>{image}</span>
            <div className={'my-auto'}>
                <p className={'text-2xl lg:text-5xl font-bold text-white mb-2'}>
                    <FontAwesomeIcon icon={icon} style={{ color: primary }} className={'mr-4'} size={'sm'} />
                    {title}
                </p>
                <p className={'text-gray-400 my-2'}>{children}</p>
            </div>
        </div>
    );
};
