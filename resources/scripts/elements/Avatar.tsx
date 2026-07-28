import BoringAvatar, { AvatarProps } from 'boring-avatars';
import { useStoreState } from '@/state/hooks';

const palette = ['#FFAD08', '#EDD75A', '#73B06F', '#0C8F8F', '#587291'];

type Props = Omit<AvatarProps, 'colors'> & { src?: string | null };

const _Avatar = ({ variant = 'beam', src, size, ...props }: Props) => {
    if (src) {
        return (
            <img
                src={src}
                alt={props.name}
                style={{ width: size, height: size, borderRadius: '9999px', objectFit: 'cover' }}
            />
        );
    }

    return <BoringAvatar colors={palette} variant={variant} size={size} {...props} />;
};

const _UserAvatar = ({ variant = 'beam', ...props }: Omit<Props, 'name' | 'src'>) => {
    const uuid = useStoreState(state => state.user.data?.uuid);
    const avatarURL = useStoreState(state => state.user.data?.avatarURL);

    return <_Avatar name={uuid || 'system'} src={avatarURL} variant={variant} {...props} />;
};

_Avatar.displayName = 'Avatar';
_UserAvatar.displayName = 'Avatar.User';

const Avatar = Object.assign(_Avatar, {
    User: _UserAvatar,
});

export default Avatar;
