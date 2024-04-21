import { Form, Formik } from 'formik';
import tw from 'twin.macro';

import AdminBox from '@elements/AdminBox';
import { Button } from '@elements/button';
import Field, { FieldRow } from '@elements/Field';
import Label from '@elements/Label';
import Select from '@elements/Select';
import { useStoreState } from '@/state/hooks';

export default () => {
    const { secondary } = useStoreState(state => state.theme.data!.colors);

    const submit = () => {
        //
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                smtpHost: 'smtp.example.com',
                smtpPort: 587,
                smtpEncryption: 'tls',
                username: '',
                password: '',
                mailFrom: 'no-reply@example.com',
                mailFromName: 'Pterodactyl Panel',
            }}
        >
            {({ isSubmitting, isValid }) => (
                <Form>
                    <AdminBox title="Mail">
                        <FieldRow css={tw`lg:grid-cols-3`}>
                            <Field
                                id={'smtpHost'}
                                name={'smtpHost'}
                                type={'text'}
                                label={'SMTP Host'}
                                description={''}
                            />
                            <Field
                                id={'smtpPort'}
                                name={'smtpPort'}
                                type={'number'}
                                label={'SMTP Port'}
                                description={''}
                            />
                            <div>
                                <Label>Encryption</Label>
                                <Select id={'smtpEncryption'} name={'smtpEncryption'} defaultValue={'tls'}>
                                    <option value="">None</option>
                                    <option value="ssl">Secure Sockets Layer (SSL)</option>
                                    <option value="tls">Transport Layer Security (TLS)</option>
                                </Select>
                            </div>
                        </FieldRow>

                        <FieldRow>
                            <Field
                                id={'username'}
                                name={'username'}
                                type={'text'}
                                label={'Username'}
                                description={''}
                            />
                            <Field
                                id={'password'}
                                name={'password'}
                                type={'password'}
                                label={'Password'}
                                description={''}
                            />
                        </FieldRow>

                        <FieldRow>
                            <Field
                                id={'mailFrom'}
                                name={'mailFrom'}
                                type={'text'}
                                label={'Mail From'}
                                description={''}
                            />
                            <Field
                                id={'mailFromName'}
                                name={'mailFromName'}
                                type={'text'}
                                label={'Mail From Name'}
                                description={''}
                            />
                        </FieldRow>
                    </AdminBox>

                    <div css={tw`rounded shadow-md px-4 xl:px-5 py-4 mt-6`} style={{ backgroundColor: secondary }}>
                        <div css={tw`flex flex-row`}>
                            <Button type="submit" css={tw`ml-auto`} disabled={isSubmitting || !isValid}>
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
};
