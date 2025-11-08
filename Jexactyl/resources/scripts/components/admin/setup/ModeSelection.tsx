import PersonalModeSvg from '@/assets/images/themed/PersonalModeSvg';
import StandardMoveSvg from '@/assets/images/themed/StandardMoveSvg';
import { useStoreActions, useStoreState } from '@/state/hooks';
import { Button } from '@/elements/button';
import { PanelMode } from '@/state/settings';
import { updateModeSettings } from '@/api/routes/admin/settings';

export default () => {
    const { mode } = useStoreState(state => state.settings.data!);
    const { primary } = useStoreState(state => state.theme.data!.colors);

    const updateSettings = useStoreActions(actions => actions.settings.updateSettings);

    const updateMode = (mode: PanelMode) => {
        updateModeSettings(mode)
            .then(() => updateSettings({ mode: mode }))
            .catch(e => console.error(e));
    };

    return (
        <div>
            <div className={'w-full flex flex-row items-center mb-8'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>Mode Selection</h2>
                    <p
                        className={
                            'hidden lg:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'
                        }
                    >
                        Select how you want to run Jexactyl.
                    </p>
                </div>
            </div>
            <div className={'grid lg:grid-cols-2 gap-8'}>
                <div className={'bg-black/25 rounded-xl w-full p-8 relative'}>
                    <PersonalModeSvg color={primary} />
                    <p className={'text-2xl lg:text-4xl font-bold mb-2'}>Personal Mode</p>
                    <p className={'text-gray-400'}>
                        Personal Mode allows you to run Jexactyl in standard settings, with basic features enable by
                        default. It gives you all the great typical features of a game hosting panel without any
                        business-oriented features making it a cluttered experience.
                    </p>
                    <div className={'absolute top-0 right-0 p-3'}>
                        <Button.Text disabled={mode === 'personal'} onClick={() => updateMode('personal')}>
                            Select{mode === 'personal' && 'ed'}
                        </Button.Text>
                    </div>
                </div>
                <div className={'bg-black/25 rounded-xl w-full p-8 relative'}>
                    <StandardMoveSvg color={primary} />
                    <p className={'text-2xl lg:text-4xl font-bold mb-2'}>Standard Mode</p>
                    <p className={'text-gray-400'}>
                        Standard Mode allows all of the Jexactyl features by default, such as billing, tickets, webhooks
                        and more. It&apos;s ideal for businesses or large groups who need more control over their users.
                    </p>
                    <div className={'absolute top-0 right-0 p-3'}>
                        <Button.Text disabled={mode === 'standard'} onClick={() => updateMode('standard')}>
                            Select{mode === 'standard' && 'ed'}
                        </Button.Text>
                    </div>
                </div>
            </div>
        </div>
    );
};
