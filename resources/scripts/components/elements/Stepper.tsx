import classNames from 'classnames';
import { useStoreState } from '@/state/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Link } from 'react-router-dom';

interface Props {
    link?: string;
    content: string;
    className?: string;
    icon: IconDefinition;
}

export default ({ className, icon, content, link }: Props) => {
    const { colors } = useStoreState(state => state.theme.data!);

    return (
        <li>
            <div
                style={{ backgroundColor: colors.secondary }}
                className={classNames(className, 'w-full p-4 rounded-lg')}
            >
                <div className={'flex items-center justify-between font-semibold'}>
                    <Link to={link ?? ''}>{content}</Link>
                    <FontAwesomeIcon icon={icon} />
                </div>
            </div>
        </li>
    );
};
