import { Dispatch, SetStateAction, useState } from 'react';
import useFlash from '@/plugins/useFlash';
import Label from '@/elements/Label';
import Input from '@/elements/Input';
import AdminBox from '@/elements/AdminBox';
import Spinner from '@/elements/Spinner';
import updateColors from '@/api/routes/admin/theme/updateColors';
import { CheckCircleIcon } from '@heroicons/react/outline';
import { useStoreActions, useStoreState } from '@/state/hooks';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { faPaintbrush } from '@fortawesome/free-solid-svg-icons';

interface Props {
    setReload: Dispatch<SetStateAction<boolean>>;
}

export default ({ setReload }: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const colors = useStoreState(state => state.theme.data!.colors);
    const setTheme = useStoreActions(actions => actions.theme.setTheme);

    const update = async (key: string, value: string) => {
        clearFlashes();
        setReload(true);
        setLoading(true);
        setSuccess(false);

        setTheme({
            colors: {
                primary: key === 'primary' ? value : colors.primary,
                secondary: key === 'secondary' ? value : colors.secondary,

                background: key === 'background' ? value : colors.background,
                headers: key === 'headers' ? value : colors.headers,
                sidebar: key === 'sidebar' ? value : colors.sidebar,
            },
        });

        updateColors(key, value)
            .then(() => {
                setReload(false);
                setSuccess(true);
                setLoading(false);

                setTimeout(() => setSuccess(false), 2000);
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'auth:modules:discord', error });

                setLoading(false);
            });
    };

    return (
        <AdminBox title={'Color Selection'} icon={faPaintbrush}>
            <FlashMessageRender byKey={'theme:colors'} className={'my-2'} />
            {loading && <Spinner className={'absolute top-0 right-0 m-3.5'} size={'small'} />}
            {success && <CheckCircleIcon className={'w-5 h-5 absolute top-0 right-0 m-3.5 text-green-500'} />}
            <div>
                <Label>Primary Content (Accent Color)</Label>
                <Input
                    id={'primary'}
                    type={'color'}
                    name={'primary'}
                    value={colors.primary}
                    onChange={e => update('primary', e.target.value)}
                />
                <p className={'text-xs text-gray-400 mt-1'}>
                    This color is used as the main text color on the application and is also used for the buttons and
                    other components.
                </p>
            </div>
            <div className={'mt-6'}>
                <Label>Secondary Content (Components)</Label>
                <Input
                    id={'secondary'}
                    type={'color'}
                    name={'secondary'}
                    value={colors.secondary}
                    onChange={e => update('secondary', e.target.value)}
                />
                <p className={'text-xs text-gray-400 mt-1'}>
                    Secondary content is elements of pages like this box, tables and other components. This should
                    usually be a dark, muted colour which doesn&apos;t blend in with the background easily.
                </p>
            </div>
            <div className={'h-0.5 my-6 rounded-full border-b border-gray-500 border-dashed'} />
            <div className={'mt-6'}>
                <Label>Background Color</Label>
                <Input
                    id={'background'}
                    type={'color'}
                    name={'background'}
                    value={colors.background}
                    onChange={e => update('background', e.target.value)}
                />
                <p className={'text-xs text-gray-400 mt-1'}>
                    This color is used for the background of this application.
                </p>
            </div>
            <div className={'my-6'}>
                <Label>Component Headers</Label>
                <Input
                    id={'headers'}
                    type={'color'}
                    name={'headers'}
                    value={colors.headers}
                    onChange={e => update('headers', e.target.value)}
                />
                <p className={'text-xs text-gray-400 mt-1'}>
                    This color is used for headers of forms, boxes and tables. We usually advise that this colour is
                    slightly darker than &apos;Secondary Content&apos;.
                </p>
            </div>
            <div className={'my-6'}>
                <Label>Sidebar & Navigation</Label>
                <Input
                    id={'sidebar'}
                    type={'color'}
                    name={'sidebar'}
                    value={colors.sidebar}
                    onChange={e => update('sidebar', e.target.value)}
                />
                <p className={'text-xs text-gray-400 mt-1'}>
                    This is the color of the sidebar to the left-hand side of your screen.
                </p>
            </div>
        </AdminBox>
    );
};
