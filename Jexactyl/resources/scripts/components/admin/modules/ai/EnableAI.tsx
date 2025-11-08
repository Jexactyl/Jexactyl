import { useStoreState } from '@/state/hooks';
import AISvg from '@/assets/images/themed/AISvg';
import FeatureContainer from '@/elements/FeatureContainer';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import ToggleFeatureButton from '@admin/modules/ai/ToggleFeatureButton';

export default () => {
    const primary = useStoreState(state => state.theme.data!.colors.primary);

    return (
        <FeatureContainer image={<AISvg color={primary} />} icon={faWandMagicSparkles} title={'Jexactyl AI'}>
            Use Jexactyl&apos;s Artificial Intelligence suite to give users better insights into errors, provide instant
            support and help administrators take better control over their Panel. Jexactyl uses Gemini AI in order to
            serve intelligence requests.
            <p className={'text-right mt-2'}>
                <ToggleFeatureButton />
            </p>
        </FeatureContainer>
    );
};
