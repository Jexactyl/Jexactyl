import { DiscountCode, DiscountCodeType } from '@/api/definitions/admin';
import { createDiscountCode, updateDiscountCode } from '@/api/routes/admin/billing';
import { DiscountCodeValues } from '@/api/routes/admin/billing';
import { Button } from '@/elements/button';
import { Dialog } from '@/elements/dialog';
import Input from '@/elements/Input';
import Label from '@/elements/Label';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import Switch from '@/elements/Switch';
import { useTypedForm } from '@/plugins/useTypedForm';
import { useStoreState } from '@/state/hooks';
import {
    faClock,
    faDollar,
    faFileText,
    faMoneyBill1Wave,
    faPercent,
    faTeletype,
    faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { useState } from 'react';

export default ({ discountCode }: { discountCode?: DiscountCode }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [type, setType] = useState<DiscountCodeType>('percentage');

    const edit = !!discountCode;
    const currency = useStoreState(s => s.everest.data!.billing.currency.symbol);

    const { form, update } = useTypedForm<DiscountCodeValues>({
        code: discountCode?.code ?? 'SAVE25',
        description: discountCode?.description ?? 'Get 25% off our products.',

        type: discountCode?.type ?? type,
        value: discountCode?.value ?? 25,
        uses: discountCode?.uses ?? 100,

        active: discountCode?.active ?? true,
        expires_at: discountCode?.expires_at ?? undefined,
    });

    const formatDate = (date: Date | undefined) => {
        if (!date) return '';
        return new Date(date).toISOString().slice(0, 16);
    };

    const submit = () => {
        setLoading(true);

        if (discountCode) {
            updateDiscountCode(discountCode.id, form)
                .then(() => setOpen(false))
                .catch(e => console.log(e))
                .finally(() => setLoading(false));
        } else {
            createDiscountCode(form)
                .then(() => setOpen(false))
                .catch(e => console.log(e))
                .finally(() => setLoading(false));
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                title={`${edit ? 'Edit existing' : 'Create new'} discount code`}
            >
                <SpinnerOverlay visible={loading} />
                <div className="space-y-4">
                    <div className={'grid lg:grid-cols-2 gap-4'}>
                        <div>
                            <Label>
                                <FontAwesomeIcon icon={faTeletype} /> Discount Code
                            </Label>
                            <Input
                                name={'code'}
                                value={form.code}
                                onChange={e => update('code', e.target.value)}
                                placeholder={'SAVE25'}
                            />
                            <p className={'text-xs text-gray-400'}>
                                Enter a discount code that clients will use. Alternatively, you can generate a random
                                one.
                            </p>
                        </div>
                        <div>
                            <Label>
                                <FontAwesomeIcon icon={faClock} /> Expiration Date
                            </Label>
                            <Input
                                type="date"
                                value={form.expires_at ? formatDate(form.expires_at).split('T')[0] : ''}
                                onChange={e => {
                                    console.log('RAW VALUE:', e.target.value);

                                    update('expires_at', e.target.value ? new Date(e.target.value) : undefined);
                                }}
                            />
                            <p className={'text-xs text-gray-400'}>
                                If you wish, you can set a date at which the discount code will become inactive.
                            </p>
                        </div>
                    </div>
                    <div>
                        <Label>
                            <FontAwesomeIcon icon={faFileText} /> Code Description
                        </Label>
                        <Input
                            name={'description'}
                            value={form.description}
                            onChange={e => update('description', e.target.value)}
                            placeholder={'Get 25% off our services!'}
                        />
                        <p className={'text-xs text-gray-400'}>
                            Provide a description which gives an overview of the discount being provided.
                        </p>
                    </div>
                </div>
                <div className={'h-px rounded-full bg-black/50 my-8'} />
                <div className={'space-y-4'}>
                    <div>
                        <Label>
                            <FontAwesomeIcon icon={faMoneyBill1Wave} /> Discount Type
                        </Label>
                        <button
                            type="button"
                            onClick={() => {
                                setType('percentage');
                                update('type', 'percentage');
                            }}
                            className={classNames(
                                type === 'percentage' ? 'bg-black/50 text-green-300' : 'bg-black/25',
                                'rounded-l py-3 px-6 font-bold text-white w-1/2',
                            )}
                        >
                            Percentage Reduction (%)
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setType('numeric');
                                update('type', 'numeric');
                            }}
                            className={classNames(
                                type === 'numeric' ? 'bg-black/50 text-green-300' : 'bg-black/25',
                                'rounded-r py-3 px-6 font-bold text-white w-1/2',
                            )}
                        >
                            Numeric Value ({currency})
                        </button>
                        <p className={'text-xs text-gray-400'}>
                            Choose whether the discount should be a percentage discount off the original cost or a flat
                            amount off the cost. It is recommended to use Percentage Reduction as that is the typical
                            retailer discount method.
                        </p>
                    </div>
                    <div className={'grid lg:grid-cols-2 gap-4'}>
                        <div>
                            <Label>
                                <FontAwesomeIcon icon={type === 'percentage' ? faPercent : faDollar} /> Discount Value
                            </Label>
                            <Input
                                name={'value'}
                                value={form.value}
                                onChange={e => update('value', Number(e.target.value))}
                            />
                            <p className={'text-xs text-gray-400'}>
                                Decide how much discount this code should give to clients when used, measured in{' '}
                                {type === 'percentage' ? '%' : currency}.
                            </p>
                        </div>
                        <div>
                            <Label>
                                <FontAwesomeIcon icon={faUserPlus} /> Total Uses
                            </Label>
                            <Input
                                name={'uses'}
                                value={form.uses}
                                onChange={e => update('uses', Number(e.target.value))}
                            />
                            <p className={'text-xs text-gray-400'}>
                                Choose how many people can use this discount code before it expires.
                            </p>
                        </div>
                    </div>
                </div>
                <div className={'h-px rounded-full bg-black/50 my-8'} />
                <div className={'bg-black/50 rounded-lg p-4'}>
                    <div className={'inline-flex'}>
                        <Label className={'mr-2'}>Make discount code active now?</Label>
                        <Switch
                            name={'active'}
                            defaultChecked={form.active}
                            onChange={() => update('active', !form.active)}
                        />
                    </div>
                    <p className={'text-xs text-gray-400'}>
                        Choose whether this discount code will be active immediately.
                    </p>
                </div>
                <div className={'text-right mt-8'}>
                    <Button onClick={submit} type={'submit'}>
                        {edit ? 'Update' : 'Create'}
                    </Button>
                </div>
            </Dialog>
            <Button size={edit ? Button.Sizes.Small : Button.Sizes.Default} onClick={() => setOpen(true)}>
                {edit ? 'Edit' : 'Create New'}
            </Button>
        </>
    );
};
