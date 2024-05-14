import { useStoreState } from '@/state/hooks';
import PageContentBlock from '@elements/PageContentBlock';
import SuccessSvg from '@/assets/images/themed/SuccessSvg';

export default () => {
    const { colors } = useStoreState(s => s.theme.data!);

    return (
        <PageContentBlock>
            <div className={'flex justify-center'}>
                <div
                    className={'w-full sm:w-3/4 md:w-1/2 p-12 md:p-20 rounded-lg shadow-lg text-center relative'}
                    style={{ backgroundColor: colors.secondary }}
                >
                    <SuccessSvg color={colors.primary} />
                    <h2 className={'mt-10 text-white font-bold text-4xl'}>Order Processed</h2>
                    <p className={'text-sm text-neutral-400 mt-2'}>
                        Thank you for your payment - your server has now been created. Navigate to the
                        &apos;Servers&apos; tab at the top of your screen to view your new server.
                    </p>
                </div>
            </div>
        </PageContentBlock>
    );
};
