import AdminBox from '@/components/admin/AdminBox';
import { Button } from '@/components/elements/button';
import { PlusCircleIcon } from '@heroicons/react/solid';
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import enableModule from '@/api/admin/auth/enableModule';
import useFlash from '@/plugins/useFlash';

interface Props {
    name: string;
    title: string;
    disabled?: boolean;
    description: string;
    icon?: IconDefinition | undefined;
}

export default ({ name, title, disabled, description, icon }: Props) => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const submit = () => {
        clearFlashes('auth:modules');

        enableModule(name)
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
            <Button value={name} onClick={() => submit()} className={'h-8 absolute top-0 right-0 m-2 text-green-500'}>
                <PlusCircleIcon className={'w-5 h-5 mr-1'} />
                Add to Panel
            </Button>
            {description}
        </AdminBox>
    );
};
