import { ReactNode, useState } from 'react';
import { Dialog } from '@/elements/dialog';
import { Button } from '@/elements/button';
import Pill, { PillStatus } from '@/elements/Pill';
import CopyOnClick from '@/elements/CopyOnClick';
import Money from '@/elements/billing/Money';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faReceipt } from '@fortawesome/free-solid-svg-icons';
import { Order } from '@definitions/account/billing';

interface Props {
    order: Order;
    type: (state: string) => PillStatus;
}

const Row = ({ label, value }: { label: string; value: ReactNode }) => (
    <div className={'flex items-center justify-between py-2 border-b border-gray-700/60 last:border-0'}>
        <span className={'text-gray-400 text-sm'}>{label}</span>
        <span className={'text-neutral-100 text-sm font-medium'}>{value}</span>
    </div>
);

export default ({ order, type }: Props) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type={'button'}
                aria-label={'View invoice'}
                className={'text-gray-400 hover:text-neutral-100 transition-colors duration-150'}
                onClick={() => setOpen(true)}
            >
                <FontAwesomeIcon icon={faReceipt} />
            </button>
            <Dialog open={open} onClose={() => setOpen(false)} title={'Invoice'}>
                <div id={'billing-invoice-printable'}>
                    <div className={'flex items-center justify-between mb-4'}>
                        <div>
                            <p className={'text-lg font-bold text-neutral-100'}>Invoice</p>
                            <CopyOnClick text={order.id}>
                                <code className={'font-mono text-xs bg-neutral-900 rounded py-1 px-2 cursor-pointer'}>
                                    #{order.id}
                                </code>
                            </CopyOnClick>
                        </div>
                        <Pill type={type(order.status)}>{order.status}</Pill>
                    </div>
                    <Row label={'Description'} value={order.description} />
                    <Row label={'Order Type'} value={order.type.toUpperCase()} />
                    {order.relationships.server && (
                        <Row label={'Linked Server'} value={order.relationships.server.name} />
                    )}
                    <Row label={'Issued'} value={new Date(order.created_at).toLocaleDateString()} />
                    {!!order.metadata?.deployment_fee && (
                        <Row label={'Deployment Fee'} value={<Money value={order.metadata.deployment_fee} />} />
                    )}
                    <Row label={'Total'} value={<Money value={order.total} suffix={'/mo'} accent />} />
                </div>
                <div className={'text-right mt-6 print:hidden'}>
                    <Button.Text onClick={() => setOpen(false)} className={'mr-2'}>
                        Close
                    </Button.Text>
                    <Button onClick={() => window.print()}>
                        <FontAwesomeIcon icon={faPrint} className={'mr-2'} />
                        Print
                    </Button>
                </div>
            </Dialog>
        </>
    );
};
