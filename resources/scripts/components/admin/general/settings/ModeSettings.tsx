import useFlash from '@/plugins/useFlash';
import { PanelMode } from '@/state/settings';
import { Button } from '@/components/elements/button';
import { updateModeSettings } from '@/api/admin/settings';
import FeatureContainer from '@elements/FeatureContainer';
import { useStoreActions, useStoreState } from '@/state/hooks';
import PersonalModeSvg from '@/assets/images/themed/PersonalModeSvg';
import StandardModeSvg from '@/assets/images/themed/StandardMoveSvg';
import { faDesktop, faMoon } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const { addFlash, clearFlashes, clearAndAddHttpError } = useFlash();

    const mode = useStoreState(state => state.settings.data!.mode);
    const primary = useStoreState(state => state.theme.data!.colors.primary);
    const updateSettings = useStoreActions(actions => actions.settings.updateSettings);

    const updateMode = (mode: PanelMode) => {
        clearFlashes();

        updateModeSettings(mode)
            .then(() => {
                updateSettings({ mode: mode });

                addFlash({
                    key: 'settings:mode',
                    type: 'success',
                    message: 'Panel mode has been updated.',
                });
            })
            .catch(error => clearAndAddHttpError({ key: 'settings:mode', error }));
    };

    return (
        <>
            <FeatureContainer
                noHeight
                icon={faDesktop}
                title={'Standard Mode'}
                image={<StandardModeSvg color={primary} />}
            >
                Standard mode enables all the typical features of Jexactyl, including our billing system, tickets, user
                registration and so much more.
                <p className={'text-right mt-2'}>
                    <Button disabled={mode === 'standard'} onClick={() => updateMode('standard')}>
                        {mode === 'standard' ? 'Currently Active' : 'Enable Now'}
                    </Button>
                </p>
            </FeatureContainer>
            <div className={'h-px bg-gray-700 rounded-full my-4'} />
            <FeatureContainer
                noHeight
                icon={faMoon}
                title={'Personal Mode'}
                image={<PersonalModeSvg color={primary} />}
            >
                With Personal mode, the Panel automatically removes features mostly used by larger organisations and
                hosting providers in order to make hosting and controlling servers much easier for a smaller audience.
                <p className={'text-right mt-2'}>
                    <Button disabled={mode === 'personal'} onClick={() => updateMode('personal')}>
                        {mode === 'personal' ? 'Currently Active' : 'Enable Now'}
                    </Button>
                </p>
            </FeatureContainer>
        </>
    );
};
