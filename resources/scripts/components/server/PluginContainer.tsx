import useSWR from 'swr';
import { object, string } from 'yup';
import * as Icon from 'react-feather';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import React, { useEffect, useState } from 'react';
import { Dialog } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import FlashMessageRender from '@/components/FlashMessageRender';
import getPlugins, { Plugin } from '@/api/server/plugins/getPlugins';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import installPlugin from '@/api/server/plugins/installPlugin';

interface Values {
    query: string;
}

export default () => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const { clearFlashes, addFlash, clearAndAddHttpError } = useFlash();
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
        console.log('正在安装插件 ID ' + id);
        installPlugin(uuid, id)
            .then(() => setOpen(false))
            .then(() =>
                addFlash({
                    key: 'server:plugins',
                    type: 'success',
                    message: '插件安装成功。',
                })
            )
            .catch((error) => clearAndAddHttpError(error));
    };

    return (
        <ServerContentBlock title={'插件'}>
            <FlashMessageRender byKey={'server:plugins'} />
            <h1 className={'j-left text-5xl'}>插件安装程序</h1>
            <h3 className={'j-left text-2xl mt-2 text-neutral-500 mb-10'}>搜索和下载 Spigot 插件。</h3>
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
                                className={'p-2 bg-neutral-900 w-full'}
                                name={'query'}
                                placeholder={'输入以搜索...'}
                            />
                        </div>
                        <Button type={'submit'}>
                            搜索 <Icon.Search size={18} className={'ml-1'} />
                        </Button>
                    </div>
                </Form>
            </Formik>
            {!data ? null : (
                <>
                    {!data.plugins ? (
                        <p className={'j-up text-gray-400 text-center'}>等待提供搜索查询...</p>
                    ) : (
                        <>
                            {data.plugins.length < 1 ? (
                                <p>未找到插件。</p>
                            ) : (
                                <div className={'j-up lg:grid lg:grid-cols-3 p-2'}>
                                    {data.plugins.map((plugin, key) => (
                                        <>
                                            <Dialog.Confirm
                                                open={open}
                                                onClose={() => setOpen(false)}
                                                title={'插件安装'}
                                                onConfirmed={() => doDownload(plugin.id)}
                                            >
                                                你确定要下载安装这个插件吗?
                                            </Dialog.Confirm>
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
                                                            <Button className={'m-1'} onClick={() => setOpen(true)}>
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
