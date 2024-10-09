import { Button } from '@elements/button';
import { useStoreState } from '@/state/hooks';
import { updateSettings } from '@/api/admin/ai/settings';

export default () => {
    const ai = useStoreState(state => state.everest.data!.ai);

    const submit = () => {
        updateSettings({ ...ai, enabled: !ai.enabled }).then(() => {
            // @ts-expect-error this is fine
            window.location = '/admin/ai';
        });
    };

    return (
        <div className={'mr-4'} onClick={submit}>
            {!ai.enabled ? <Button>Enable Jexactyl AI</Button> : <Button.Danger>Disable Jexactyl AI</Button.Danger>}
        </div>
    );
};
