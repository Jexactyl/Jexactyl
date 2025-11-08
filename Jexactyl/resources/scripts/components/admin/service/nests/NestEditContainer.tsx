import type { Action, Actions } from 'easy-peasy';
import { action, createContextStore, useStoreActions } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { object, string } from 'yup';

import ImportEggButton from '@admin/service/nests/ImportEggButton';
import AdminContentBlock from '@/elements/AdminContentBlock';
import Spinner from '@/elements/Spinner';
import FlashMessageRender from '@/elements/FlashMessageRender';
import type { Nest } from '@/api/routes/admin/nests/getNests';
import getNest from '@/api/routes/admin/nests/getNest';
import updateNest from '@/api/routes/admin/nests/updateNest';
import { Button } from '@/elements/button';
import { Size } from '@/elements/button/types';
import Field from '@/elements/Field';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import AdminBox from '@/elements/AdminBox';
import CopyOnClick from '@/elements/CopyOnClick';
import Input from '@/elements/Input';
import Label from '@/elements/Label';
import NestDeleteButton from '@admin/service/nests/NestDeleteButton';
import NestEggTable from '@admin/service/nests/NestEggTable';
import type { ApplicationStore } from '@/state';

interface ctx {
    nest: Nest | undefined;
    setNest: Action<ctx, Nest | undefined>;

    selectedEggs: number[];

    setSelectedEggs: Action<ctx, number[]>;
    appendSelectedEggs: Action<ctx, number>;
    removeSelectedEggs: Action<ctx, number>;
}

export const Context = createContextStore<ctx>({
    nest: undefined,

    setNest: action((state, payload) => {
        state.nest = payload;
    }),

    selectedEggs: [],

    setSelectedEggs: action((state, payload) => {
        state.selectedEggs = payload;
    }),

    appendSelectedEggs: action((state, payload) => {
        state.selectedEggs = state.selectedEggs.filter(id => id !== payload).concat(payload);
    }),

    removeSelectedEggs: action((state, payload) => {
        state.selectedEggs = state.selectedEggs.filter(id => id !== payload);
    }),
});

interface Values {
    name: string;
    description: string;
}

const EditInformationContainer = () => {
    const navigate = useNavigate();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    const nest = Context.useStoreState(state => state.nest);
    const setNest = Context.useStoreActions(actions => actions.setNest);

    if (nest === undefined) {
        return <></>;
    }

    const submit = ({ name, description }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('nest');

        updateNest(nest.id, name, description)
            .then(() => setNest({ ...nest, name, description }))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'nest', error });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                name: nest.name,
                description: nest.description || '',
            }}
            validationSchema={object().shape({
                name: string().required().min(1),
                description: string().max(255, ''),
            })}
        >
            {({ isSubmitting, isValid }) => (
                <>
                    <AdminBox title={'Edit Nest'} css={tw`flex-1 self-start w-full relative mb-8 lg:mb-0 mr-0 lg:mr-4`}>
                        <SpinnerOverlay visible={isSubmitting} />

                        <Form>
                            <Field id={'name'} name={'name'} label={'Name'} type={'text'} css={tw`mb-6`} />

                            <Field id={'description'} name={'description'} label={'Description'} type={'text'} />

                            <div css={tw`w-full flex flex-row items-center mt-6`}>
                                <div css={tw`flex`}>
                                    <NestDeleteButton nestId={nest.id} onDeleted={() => navigate('/admin/nests')} />
                                </div>

                                <div css={tw`flex ml-auto`}>
                                    <Button type="submit" disabled={isSubmitting || !isValid}>
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </AdminBox>
                </>
            )}
        </Formik>
    );
};

const ViewDetailsContainer = () => {
    const nest = Context.useStoreState(state => state.nest);

    if (nest === undefined) {
        return <></>;
    }

    return (
        <AdminBox title={'Nest Details'} css={tw`flex-1 w-full relative ml-0 lg:ml-4`}>
            <div>
                <div>
                    <div>
                        <Label>ID</Label>
                        <CopyOnClick text={nest.id.toString()}>
                            <Input type={'text'} value={nest.id} readOnly />
                        </CopyOnClick>
                    </div>

                    <div css={tw`mt-6`}>
                        <Label>UUID</Label>
                        <CopyOnClick text={nest.uuid}>
                            <Input type={'text'} value={nest.uuid} readOnly />
                        </CopyOnClick>
                    </div>

                    <div css={tw`mt-6 mb-2`}>
                        <Label>Author</Label>
                        <CopyOnClick text={nest.author}>
                            <Input type={'text'} value={nest.author} readOnly />
                        </CopyOnClick>
                    </div>
                </div>
            </div>
        </AdminBox>
    );
};

const NestEditContainer = () => {
    const params = useParams<'nestId'>();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );
    const [loading, setLoading] = useState(true);

    const nest = Context.useStoreState(state => state.nest);
    const setNest = Context.useStoreActions(actions => actions.setNest);

    useEffect(() => {
        clearFlashes('nest');

        getNest(Number(params.nestId), ['eggs'])
            .then(nest => setNest(nest))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'nest', error });
            })
            .then(() => setLoading(false));
    }, []);

    if (loading || nest === undefined) {
        return (
            <AdminContentBlock>
                <FlashMessageRender byKey={'nest'} css={tw`mb-4`} />

                <div css={tw`w-full flex flex-col items-center justify-center`} style={{ height: '24rem' }}>
                    <Spinner size={'base'} />
                </div>
            </AdminContentBlock>
        );
    }

    return (
        <AdminContentBlock title={'Nests - ' + nest.name}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>{nest.name}</h2>
                    {(nest.description || '').length < 1 ? (
                        <p css={tw`text-base text-neutral-400`}>
                            <span css={tw`italic`}>No description</span>
                        </p>
                    ) : (
                        <p
                            css={tw`hidden md:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}
                        >
                            {nest.description}
                        </p>
                    )}
                </div>

                <div css={tw`flex flex-row ml-auto pl-4`}>
                    <ImportEggButton css={tw`mr-4`} />

                    <NavLink to={`/admin/nests/${params.nestId}/new`}>
                        <Button type={'button'} size={Size.Large} css={tw`h-10 px-4 py-0 whitespace-nowrap`}>
                            New Egg
                        </Button>
                    </NavLink>
                </div>
            </div>

            <FlashMessageRender byKey={'nest'} css={tw`mb-4`} />

            <div css={tw`flex flex-col lg:flex-row mb-8`}>
                <EditInformationContainer />
                <ViewDetailsContainer />
            </div>

            <NestEggTable />
        </AdminContentBlock>
    );
};

export default () => {
    return (
        <Context.Provider>
            <NestEditContainer />
        </Context.Provider>
    );
};
