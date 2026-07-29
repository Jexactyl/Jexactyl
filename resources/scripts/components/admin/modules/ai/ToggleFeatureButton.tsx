import { Button } from '@/elements/button';
import { useStoreState } from '@/state/hooks';
import { updateSettings } from '@/api/routes/admin/ai';

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
            {!ai.enabled ? <Button>Enable JexpanelAI</Button> : <Button.Danger>Disable JexpanelAI</Button.Danger>}
        </div>
    );
};
