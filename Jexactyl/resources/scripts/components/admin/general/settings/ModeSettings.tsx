import useFlash from '@/plugins/useFlash';
import { PanelMode } from '@/state/settings';
import { Button } from '@/elements/button';
import FeatureContainer from '@/elements/FeatureContainer';
import { useStoreActions, useStoreState } from '@/state/hooks';
import PersonalModeSvg from '@/assets/images/themed/PersonalModeSvg';
import StandardModeSvg from '@/assets/images/themed/StandardMoveSvg';
import { faDesktop, faMoon, faTerminal } from '@fortawesome/free-solid-svg-icons';
import ServerSvg from '@/assets/images/themed/ServerSvg';
import { Dialog } from '@/elements/dialog';
import { useState } from 'react';
import { updateModeSettings } from '@/api/routes/admin/settings';

export default () => {
    const [warning, setWarning] = useState<boolean>(false);
    const { addFlash, clearFlashes, clearAndAddHttpError } = useFlash();

    const settings = useStoreState(state => state.settings.data!);
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
            <Dialog open={warning} onClose={() => setWarning(false)} title={'How to activate Debug mode'}>
                To set your application into debug mode:
                <ul className={'my-4 text-gray-300'}>
                    <li>&bull; SSH into your Webserver console</li>
                    <li className={'my-1'}>
                        &bull; Navigate to <code className={'bg-black/50 p-1 rounded-lg'}>/var/www/jexactyl</code>
                    </li>
                    <li className={'my-1'}>
                        &bull; Open the environment file (<code className={'bg-black/50 p-1 rounded-lg'}>.env</code>)
                    </li>
                    <li className={'my-1'}>&bull; Set APP_ENV to local, and APP_DEBUG to true</li>
                    <li className={'my-1'}>&bull; Set APP_ENV to production, and APP_DEBUG to false to deactivate</li>
                </ul>
            </Dialog>
            <FeatureContainer
                noHeight
                icon={faDesktop}
                title={'Standard Mode'}
                image={<StandardModeSvg color={primary} />}
            >
                Standard mode enables all the typical features of Jexactyl, including our billing system, tickets, user
                registration and so much more.
                <p className={'text-right mt-2'}>
                    <Button disabled={settings.mode === 'standard'} onClick={() => updateMode('standard')}>
                        {settings.mode === 'standard' ? 'Currently Active' : 'Enable Now'}
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
                    <Button disabled={settings.mode === 'personal'} onClick={() => updateMode('personal')}>
                        {settings.mode === 'personal' ? 'Currently Active' : 'Enable Now'}
                    </Button>
                </p>
            </FeatureContainer>
            <div className={'h-px bg-gray-700 rounded-full my-4'} />
            <FeatureContainer noHeight icon={faTerminal} title={'Debug Mode'} image={<ServerSvg color={primary} />}>
                When Jexactyl is in Debug mode, all HTTP request data is exposed and errors are reported including
                sensitive details. Use this mode with caution, and especially{' '}
                <strong>do not use this mode in production.</strong>
                <p className={'text-right mt-2'}>
                    <Button onClick={() => setWarning(true)} disabled={settings.debug}>
                        {settings.debug ? 'Currently Active' : 'Enable Now'}
                    </Button>
                </p>
            </FeatureContainer>
        </>
    );
};
