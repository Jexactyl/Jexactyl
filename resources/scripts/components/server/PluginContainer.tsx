import useSWR from 'swr';
import { object, string } from 'yup';
import * as Icon from 'react-feather';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import React, { useEffect, useState } from 'react';
import { Dialog } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import installPlugin from '@/api/server/plugins/installPlugin';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import getPlugins, { Plugin } from '@/api/server/plugins/getPlugins';
import ServerContentBlock from '@/components/elements/ServerContentBlock';

interface Values {
    query: string;
}

export default () => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const { clearFlashes, addFlash, clearAndAddHttpError } = useFlash();
    const [pluginId, setPluginId] = useState<number>(0);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    const { data, error } = useSWR<Plugin>([uuid, query, '/plugins'], (uuid, query) => getPlugins(uuid, query));

    console.log(data);

    useEffect(() => {
        if (!error) {
            clearFlashes('server:plugins');
        } else {
            clearAndAddHttpError({ key: 'server:plugins', error });
        }
    }, [error]);

    const submit = ({ query }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        setQuery(query);
        setSubmitting(false);
    };

    const doDownload = (id: number) => {
        console.log('Installing plugin with ID ' + id);
        installPlugin(uuid, id)
            .then(() => setOpen(false))
            .then(() =>
                addFlash({
                    key: 'server:plugins',
                    type: 'success',
                    message: 'Plugin installed successfully.',
                })
            )
            .catch((error) => clearAndAddHttpError(error));
    };

    return (
        <ServerContentBlock
            title={'Plugins'}
            description={'Search and download Spigot plugins.'}
            showFlashKey={'server:plugins'}
        >
            <Formik
                onSubmit={submit}
                initialValues={{ query: '' }}
                validationSchema={object().shape({
                    query: string().required(),
                })}
            >
                <Form className={'j-up'}>
                    <div className={'grid grid-cols-12 mb-10'}>
                        <div className={'col-span-11 mr-4'}>
                            <Field
                                name={'query'}
                                placeholder={'Type to search...'}
                                className={'p-3 text-sm w-full bg-gray-800 rounded'}
                            />
                        </div>
                        <Button type={'submit'}>
                            Search <Icon.Search size={18} className={'ml-1'} />
                        </Button>
                    </div>
                </Form>
            </Formik>
            <Dialog.Confirm
                open={open}
                onClose={() => setOpen(false)}
                title={'Plugin Installation'}
                onConfirmed={() => doDownload(pluginId)}
            >
                Are you sure you wish to download this plugin?
            </Dialog.Confirm>
            {!data ? null : (
                <>
                    {!data.plugins ? (
                        <p className={'text-gray-400 text-center'}>Waiting for a search query to be provided...</p>
                    ) : (
                        <>
                            {data.plugins.length < 1 ? (
                                <p>Couldn&apos;t find any plugins.</p>
                            ) : (
                                <div className={'lg:grid lg:grid-cols-3 p-2'}>
                                    {data.plugins.map((plugin, key) => (
                                        <>
                                            <TitledGreyBox title={plugin.name} key={key} className={'m-2'}>
                                                <div className={'lg:grid lg:grid-cols-5'}>
                                                    <div className={'lg:col-span-4'}>
                                                        <p className={'text-sm line-clamp-1'}>{plugin.tag}</p>
                                                        <p className={'text-xs text-gray-400'}>
                                                            {`https://api.spiget.org/v2/resources/${plugin.id}/go`}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        {plugin.premium ? (
                                                            <Button.Text className={'m-1'} disabled>
                                                                <Icon.DownloadCloud size={18} />
                                                            </Button.Text>
                                                        ) : (
                                                            <Button
                                                                className={'m-1'}
                                                                onClick={() => {
                                                                    setPluginId(plugin.id);
                                                                    setOpen(true);
                                                                }}
                                                            >
                                                                <Icon.DownloadCloud size={18} />
                                                            </Button>
                                                        )}
                                                        <a href={`https://api.spiget.org/v2/resources/${plugin.id}/go`}>
                                                            <Button className={'m-1'}>
                                                                <Icon.ExternalLink size={18} />
                                                            </Button>
                                                        </a>
                                                    </div>
                                                </div>
                                            </TitledGreyBox>
                                        </>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </ServerContentBlock>
    );
};
