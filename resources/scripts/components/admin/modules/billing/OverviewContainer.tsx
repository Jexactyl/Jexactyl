import AdminBox from '@elements/AdminBox';
import Stepper from '@/components/elements/Stepper';
import CollapsedIcon from '@/assets/images/logo.png';
import ToggleFeatureButton from '@admin/modules/billing/ToggleFeatureButton';
import { faArrowRight, faCheck, faEllipsis } from '@fortawesome/free-solid-svg-icons';

export default () => (
    <div className={'grid lg:grid-cols-5 gap-4'}>
        <ol className="space-y-4 my-auto w-full">
            <Stepper className={'text-green-500'} icon={faCheck} content={'1. Enable billing module'} />
            <Stepper
                className={'text-blue-500'}
                icon={faArrowRight}
                content={'2. Add your first product'}
                link={'/admin/billing/categories'}
            />
            <Stepper className={'text-gray-500'} icon={faEllipsis} content={'3. Secure your first sale'} />
        </ol>

        <div className={'flex flex-col items-center rounded-lg shadow md:flex-row col-span-2'}>
            <img
                src={CollapsedIcon}
                className={'object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg'}
            />
            <div className="flex flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Your store is live!
                </h5>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    Jexactyl is currently serving your users with your chosen products which can be purchased by a
                    third-party payment gateway.
                </p>
            </div>
        </div>
        <AdminBox title={'Disable Billing Module'} className={'col-span-2'}>
            Clicking the button below will disable all modules of the billing system - such as subscriptions, server
            purchasing and more. Make sure that this will not impact your users before disabling.
            <div className={'text-right mt-2'}>
                <ToggleFeatureButton />
            </div>
        </AdminBox>
    </div>
);
