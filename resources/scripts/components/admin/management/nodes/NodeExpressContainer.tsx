import { faServer } from '@fortawesome/free-solid-svg-icons';
import { Field as FormikField, useFormikContext } from 'formik';
import tw from 'twin.macro';

import AdminBox from '@/elements/AdminBox';
import Label from '@/elements/Label';
import Field from '@/elements/Field';
import SpinnerOverlay from '@/elements/SpinnerOverlay';

export default () => {
    const { isSubmitting } = useFormikContext();

    return (
        <AdminBox icon={faServer} title={'Node Details'} css={tw`w-full relative`}>
            <SpinnerOverlay visible={isSubmitting} />

            <div css={tw`mb-6`}>
                <Field id={'name'} name={'name'} label={'Name'} type={'text'} />
            </div>

            <div css={tw`mb-6`}>
                <Field id={'fqdn'} name={'fqdn'} label={'FQDN'} type={'text'} />
            </div>

            <div css={tw`mb-6`}>
                <Label htmlFor={'scheme'}>SSL</Label>

                <div>
                    <label css={tw`inline-flex items-center mr-2`}>
                        <FormikField name={'scheme'} type={'radio'} value={'https'} />
                        <span css={tw`text-neutral-300 ml-2`}>Enabled</span>
                    </label>

                    <label css={tw`inline-flex items-center ml-2`}>
                        <FormikField name={'scheme'} type={'radio'} value={'http'} />
                        <span css={tw`text-neutral-300 ml-2`}>Disabled</span>
                    </label>
                </div>
            </div>

            <div css={tw`md:w-full md:flex md:flex-row`}>
                <div css={tw`mb-6 md:w-full md:flex md:flex-col md:mr-4 md:mb-0`}>
                    <Field id={'memory'} name={'memory'} label={'Memory Limit'} type={'number'} />
                </div>

                <div css={tw`mb-6 md:w-full md:flex md:flex-col md:ml-4 md:mb-0`}>
                    <Field id={'disk'} name={'disk'} label={'Disk Limit'} type={'number'} />
                </div>
            </div>
        </AdminBox>
    );
};
