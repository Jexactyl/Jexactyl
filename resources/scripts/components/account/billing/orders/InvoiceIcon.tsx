import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReceipt } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '@/elements/tooltip/Tooltip';
import useFlash from '@/plugins/useFlash';
import { downloadInvoice } from '@/api/routes/account/billing/orders';
import { Order } from '@definitions/account/billing';

export default ({ order }: { order: Order }) => {
    const [downloading, setDownloading] = useState(false);
    const { clearAndAddHttpError } = useFlash();

    const invoice = order.relationships.invoice;

    if (!invoice) {
        return (
            <Tooltip content={'Your invoice is still being generated — check back shortly.'}>
                <FontAwesomeIcon icon={faReceipt} className={'text-gray-500 cursor-default'} />
            </Tooltip>
        );
    }

    const download = () => {
        setDownloading(true);

        downloadInvoice(order.id, `${invoice.number ?? order.id}.pdf`)
            .catch(error => clearAndAddHttpError({ key: 'billing:orders', error }))
            .then(() => setDownloading(false));
    };

    return (
        <Tooltip content={'Download invoice'}>
            <button
                type={'button'}
                aria-label={'Download invoice'}
                onClick={download}
                disabled={downloading}
                className={'text-gray-400 hover:text-neutral-100 transition-colors duration-150 disabled:opacity-50'}
            >
                <FontAwesomeIcon icon={faReceipt} />
            </button>
        </Tooltip>
    );
};
