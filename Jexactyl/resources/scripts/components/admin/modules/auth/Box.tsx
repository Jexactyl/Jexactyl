import AdminBox from '@/elements/AdminBox';
import { Button } from '@/elements/button';
import { faPuzzlePiece, faStar } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import useFlash from '@/plugins/useFlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toggleModule } from '@/api/routes/admin/auth/module';

interface Props {
    name: string;
    title: string;
    disabled?: boolean;
    description: string;
    recommended?: string;
    icon?: IconDefinition | undefined;
}

export default ({ name, title, disabled, recommended, description, icon }: Props) => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const submit = () => {
        clearFlashes('auth:modules');

        toggleModule('enable', name)
            .then(() => {
                // @ts-expect-error this is fine
                window.location = '/admin/auth';
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'auth:modules', error });
            });
    };

    if (disabled) return null;

    return (
        <AdminBox title={title} icon={icon ?? faPuzzlePiece}>
            <Button value={name} onClick={() => submit()} className={'h-8 absolute top-0 right-0 m-2'}>
                Add to Panel
            </Button>
            {description}
            {recommended && (
                <div className={'mt-2 bg-zinc-700 p-2 rounded-lg text-xs text-gray-400'}>
                    <FontAwesomeIcon icon={faStar} className={'text-yellow-500 mr-1'} />
                    {recommended}
                </div>
            )}
        </AdminBox>
    );
};
