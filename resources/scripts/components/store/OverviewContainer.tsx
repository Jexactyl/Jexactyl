import React from 'react';
import { useStoreState } from 'easy-peasy';
import useWindowDimensions from '@/plugins/useWindowDimensions';
import ResourceBar from '@/components/elements/store/ResourceBar';
import StoreBanner from '@/components/elements/store/StoreBanner';
import PageContentBlock from '@/components/elements/PageContentBlock';

export default () => {
    return (
        <PageContentBlock title={'Storefront Overview'}>
            {/* Modern Header */}
            <div className={'mt-10 mb-8'}>
                <div className={'flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6'}>
                    <div>
                        <h1
                            className={
                                'text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent'
                            }
                        >
                            Welcome to the Store! 🛒
                        </h1>
                        <p className={'text-lg mt-2 text-neutral-400'}>
                            Manage your resources, create servers, and purchase credits
                        </p>
                    </div>
                </div>
            </div>

            {/* Resources Grid */}
            <div className={'mb-10'}>
                <h2 className={'text-2xl font-semibold text-white mb-4 flex items-center gap-2'}>
                    <span className={'text-blue-400'}>💎</span> Your Resources
                </h2>
                <ResourceBar />
            </div>

            {/* Action Cards */}
            <div className={'mb-10'}>
                <h2 className={'text-2xl font-semibold text-white mb-4'}>Quick Actions</h2>
                <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
                    <StoreBanner
                        title={'Want to create a server?'}
                        className={'bg-storeone'}
                        action={'Create Server'}
                        link={'create'}
                    />
                    <StoreBanner
                        title={'Need more resources?'}
                        className={'bg-storetwo'}
                        action={'Buy Resources'}
                        link={'resources'}
                    />
                    <StoreBanner
                        title={'Run out of credits?'}
                        className={'bg-storethree'}
                        action={'Buy Credits'}
                        link={'credits'}
                    />
                </div>
            </div>
        </PageContentBlock>
    );
};
