import { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import { Button } from '@/elements/button';
import { Dialog } from '@/elements/dialog';
import Preview from '@admin/modules/theme/Preview';
import AdminContentBlock from '@/elements/AdminContentBlock';
import ColorSelect from '@admin/modules/theme/ColorSelect';
import resetTheme from '@/api/routes/admin/theme/resetTheme';

export default () => {
    const [reload, setReload] = useState<boolean>(false);
    const [visible, setVisible] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const submit = () => {
        clearFlashes('theme:colors');

        resetTheme()
            .then(() => {
                // @ts-expect-error this is fine
                window.location = '/admin/theme';
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'theme:colors', error });
            });
    };

    return (
        <AdminContentBlock showFlashKey={'theme:colors'}>
            <Dialog.Confirm
                title={'Are you sure?'}
                open={visible}
                onClose={() => setVisible(false)}
                onConfirmed={submit}
            >
                Performing this action will immediately wipe all of your custom theming settings. Only do this if you
                wish to return to the stock appearance of Jexactyl. This action cannot be reversed.
            </Dialog.Confirm>
            <div className={'w-full flex flex-row items-center mb-8'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>System Theme</h2>
                    <p
                        className={
                            'hidden lg:block text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'
                        }
                    >
                        View and update the theme of this interface.
                    </p>
                </div>
                <div className={'flex ml-auto pl-4'}>
                    <Button
                        type={'button'}
                        size={Button.Sizes.Large}
                        onClick={() => setVisible(true)}
                        className={'h-10 px-4 py-0 whitespace-nowrap'}
                    >
                        Reset to Defaults
                    </Button>
                </div>
            </div>
            <div className={'grid md:grid-cols-2 xl:grid-cols-3 gap-4'}>
                <ColorSelect setReload={setReload} />
                <Preview reload={reload} />
            </div>
        </AdminContentBlock>
    );
};
