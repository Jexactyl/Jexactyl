import { useStoreState } from '@/state/hooks';

interface Props {
    value: number;
    suffix?: string;
    className?: string;
    accent?: boolean;
}

export default ({ value, suffix, className, accent }: Props) => {
    const settings = useStoreState(s => s.everest.data!.billing);
    const { colors } = useStoreState(state => state.theme.data!);

    return (
        <span className={className} style={accent ? { color: colors.primary } : undefined}>
            {settings.currency.symbol}
            {value.toFixed(2)}&nbsp;{settings.currency.code.toUpperCase()}
            {suffix}
        </span>
    );
};
