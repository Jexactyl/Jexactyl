import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import Field, { FieldRow } from '@elements/Field';
import tw from 'twin.macro';
import AdminContentBlock from '@elements/AdminContentBlock';
import { Button } from '@elements/button';
import FlashMessageRender from '@/components/FlashMessageRender';
import type { ApplicationStore } from '@/state';
import type { Values } from '@/api/admin/tickets/createTicket';
import AdminBox from '@elements/AdminBox';
import createTicket from '@/api/admin/tickets/createTicket';
import { object, string, number } from 'yup';
import { faTicket } from '@fortawesome/free-solid-svg-icons';
import UserSelect from './UserSelect';
import { useStoreState } from '@/state/hooks';

const initialValues: Values = {
    title: '',
    user_id: 0,
};

export default () => {
    const navigate = useNavigate();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );
    const { secondary } = useStoreState(state => state.theme.data!.colors);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('ticket:create');

        createTicket(values)
            .then(() => navigate(`/admin/tickets`))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'ticket:create', error });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <AdminContentBlock title={'New Ticket'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>New Ticket</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        Add a new ticket for users to interact with.
                    </p>
                </div>
            </div>

            <FlashMessageRender byKey={'ticket:create'} />

            <Formik
                onSubmit={submit}
                initialValues={initialValues}
                validationSchema={object().shape({
                    title: string().required().max(191).min(3),
                    user_id: number().required(),
                })}
            >
                {({ isSubmitting, isValid }) => (
                    <Form>
                        <div css={tw`flex flex-col lg:flex-row`}>
                            <div css={tw`w-full flex flex-col mr-0 lg:mr-2`}>
                                <AdminBox title={'Ticket Details'} icon={faTicket}>
                                    <FieldRow>
                                        <Field
                                            id={'title'}
                                            name={'title'}
                                            type={'text'}
                                            label={'Title'}
                                            description={'A simple title or description for this ticket.'}
                                        />
                                        <UserSelect />
                                    </FieldRow>
                                </AdminBox>
                                <div css={tw`rounded shadow-md mt-4 py-2 pr-6`} style={{ backgroundColor: secondary }}>
                                    <div css={tw`flex flex-row`}>
                                        <Button type={'submit'} css={tw`ml-auto`} disabled={isSubmitting || !isValid}>
                                            Create
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </AdminContentBlock>
    );
};
