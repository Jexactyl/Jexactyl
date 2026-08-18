import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import FlashMessageRender from '@/elements/FlashMessageRender';
import PageContentBlock from '@/elements/PageContentBlock';
import Spinner from '@/elements/Spinner';
import { processCheckoutSession } from '@/api/routes/account/billing/orders/process';
import { useStoreState } from '@/state/hooks';

export default () => {
    const navigate = useNavigate();
    const { colors } = useStoreState(state => state.theme.data!);

    const params = new URLSearchParams(window.location.search);
    const session = params.get('session');

    useEffect(() => {
        if (session) {
            processCheckoutSession(session)
                .then(server => navigate(`/server/${server.id}`))
                .catch((error) => {
                    console.error('processCheckoutSession failed:', error);
                    navigate('/account/billing/cancel');
                });
        } else {
            navigate('/account/billing/cancel');
        }
    }, []);

    return (
        <PageContentBlock>
            <div className={'flex justify-center'}>
                <div
                    className={'w-full sm:w-3/4 md:w-1/2 p-12 rounded-lg shadow-lg text-center relative'}
                    style={{ backgroundColor: colors.secondary }}
                >
                    <FlashMessageRender byKey={'billing:process'} className={'mb-6'} />
                    <h2 className={'text-white font-bold text-4xl'}>
                        Processing Order <Spinner centered />
                    </h2>
                    <p className={'text-sm text-neutral-200 mt-2'}>
                        Our systems are currently working on deploying your server to our systems. Sit tight while your
                        new server is deployed!
                    </p>
                </div>
            </div>
        </PageContentBlock>
    );
};
