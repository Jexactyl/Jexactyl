import { useStoreState } from '@/state/hooks';
import { ReactElement, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface Props {
    image: ReactElement;
    icon: IconDefinition;
    title: string;
    children: ReactNode;
}

export default ({ image, icon, title, children }: Props) => {
    const primary = useStoreState(state => state.theme.data!.colors.primary);

    return (
        <div className={'h-[80vh] grid lg:grid-cols-2 gap-4 lg:gap-12 my-auto max-w-7xl'}>
            {image}
            <div className={'my-auto'}>
                <p className={'text-5xl font-bold text-white mb-2'}>
                    <FontAwesomeIcon icon={icon} style={{ color: primary }} className={'mr-4'} />
                    {title}
                </p>
                <p className={'text-gray-400'}>{children}</p>
            </div>
        </div>
    );
};
