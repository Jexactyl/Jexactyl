import { useStoreState } from '@/state/hooks';
import CancelSvg from '@/assets/images/themed/CancelSvg';
import PageContentBlock from '@elements/PageContentBlock';

export default () => {
    const { colors } = useStoreState(s => s.theme.data!);

    return (
        <PageContentBlock>
            <div className={'flex justify-center'}>
                <div
                    className={'w-full sm:w-3/4 md:w-1/2 p-12 md:p-20 rounded-lg shadow-lg text-center relative'}
                    style={{ backgroundColor: colors.secondary }}
                >
                    <CancelSvg color={colors.primary} />
                    <h2 className={'mt-10 text-white font-bold text-4xl'}>Order Cancelled</h2>
                    <p className={'text-sm text-neutral-400 mt-2'}>
                        Your order was cancelled due to payment not being submitted to Stripe. You have not been
                        charged. If you&apos;d like to retry this order, please click &apos;Order&apos; above.
                    </p>
                </div>
            </div>
        </PageContentBlock>
    );
};
