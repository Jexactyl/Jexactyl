import { useStoreState } from 'easy-peasy';
import { Fragment } from 'react';

import MessageBox from '@/components/MessageBox';
import classNames from 'classnames';

type Props = Readonly<{
    byKey?: string;
    className?: string;
}>;

function FlashMessageRender({ byKey, className }: Props) {
    const flashes = useStoreState(state => state.flashes.items.filter(flash => (byKey ? flash.key === byKey : true)));

    return flashes.length ? (
        <div className={classNames(className, 'fixed bottom-2 right-2 z-50 m-4')}>
            {flashes.map((flash, index) => (
                <Fragment key={flash.id || flash.type + flash.message}>
                    {index > 0 && <div className="mt-2" />}
                    <MessageBox type={flash.type} title={flash.title}>
                        {flash.message}
                    </MessageBox>
                </Fragment>
            ))}
        </div>
    ) : null;
}

export default FlashMessageRender;
