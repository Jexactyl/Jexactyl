import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import Field, { FieldRow } from '@/elements/Field';
import tw from 'twin.macro';
import AdminContentBlock from '@/elements/AdminContentBlock';
import { Button } from '@/elements/button';
import FlashMessageRender from '@/elements/FlashMessageRender';
import type { ApplicationStore } from '@/state';
import AdminBox from '@/elements/AdminBox';
import { object, string, number } from 'yup';
import { faTicket } from '@fortawesome/free-solid-svg-icons';
import UserSelect from './UserSelect';
import { useStoreState } from '@/state/hooks';
import Select from '@/elements/Select';
import Label from '@/elements/Label';
import { createTicket } from '@/api/routes/admin/tickets';
import { Values } from '@/api/routes/admin/tickets/types';

const initialValues: Values = {
    title: '',
    user_id: 0,
    assigned_to: null,
    status: 'pending',
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
            .then(ticket => navigate(`/admin/tickets/${ticket.id}`))
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
                    <p
                        css={tw`hidden md:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}
                    >
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
                    assigned_to: number().nullable(),
                    status: string().nullable(),
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
                                        <div>
                                            <UserSelect />
                                            <p className={'text-xs pt-2'}>
                                                This will be the user that the ticket is made for.
                                            </p>
                                        </div>
                                        <div>
                                            <UserSelect isAdmin />
                                            <p className={'text-xs pt-2'}>
                                                Set an assigned administrator to deal with this ticket.
                                            </p>
                                        </div>
                                        <div>
                                            <Label>Select ticket status</Label>
                                            <Select id={'status'} name={'status'}>
                                                <option value={'pending'}>Pending</option>
                                                <option value={'in-progress'}>In Progress</option>
                                                <option value={'resolved'}>Resolved</option>
                                                <option value={'unresolved'}>Unresolved</option>
                                            </Select>
                                            <p className={'text-xs pt-2'}>
                                                Before the ticket is created, you can change the status.
                                            </p>
                                        </div>
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
