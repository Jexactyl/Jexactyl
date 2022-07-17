import tw from 'twin.macro';
import { Form, Formik } from 'formik';
import React, { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from '@/state/hooks';
import paypal from '@/api/store/gateways/paypal';
import Select from '@/components/elements/Select';
import { Dialog } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button/index';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';

export default () => {
    const { clearAndAddHttpError } = useFlash();
    const [amount, setAmount] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const currency = useStoreState((state) => state.storefront.data!.currency);

    const submit = () => {
        setSubmitting(true);

        paypal(amount)
            .then((url) => {
                setSubmitting(false);

                // @ts-expect-error this is valid
                window.location.href = url;
            })
            .catch((error) => {
                setSubmitting(false);

                clearAndAddHttpError({ key: 'store:paypal', error });
            });
    };

    return (
        <TitledGreyBox title={'通过 PayPal 购买'}>
            <p css={tw`text-sm`}>100 {currency} 等于 1 美元。</p>
            <Dialog open={submitting} hideCloseIcon onClose={() => undefined}>
                您现在将被带到 PayPal 网关以完成此交易。
            </Dialog>
            <FlashMessageRender byKey={'store:paypal'} css={tw`mb-2`} />
            <Formik
                onSubmit={submit}
                initialValues={{
                    amount: 100,
                }}
            >
                <Form>
                    <SpinnerOverlay size={'large'} visible={submitting} />
                    <Select
                        name={'amount'}
                        disabled={submitting}
                        // @ts-expect-error this is valid
                        onChange={(e) => setAmount(e.target.value)}
                    >
                        <option key={'paypal:placeholder'} hidden>
                            选择金额...
                        </option>
                        <option key={'paypal:buy:100'} value={100}>
                            购买 100 {currency}
                        </option>
                        <option key={'paypal:buy:200'} value={200}>
                            购买 200 {currency}
                        </option>
                        <option key={'paypal:buy:500'} value={500}>
                            购买 500 {currency}
                        </option>
                        <option key={'paypal:buy:1000'} value={1000}>
                            购买 1000 {currency}
                        </option>
                    </Select>
                    <div css={tw`mt-6`}>
                        <Button type={'submit'} disabled={submitting}>
                            通过 PayPal 购买
                        </Button>
                    </div>
                </Form>
            </Formik>
        </TitledGreyBox>
    );
};
