import { LanguageDescription } from '@codemirror/language';
import { json } from '@codemirror/lang-json';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import tw from 'twin.macro';

import getEggs from '@/api/routes/admin/nests/getEggs';
import importEgg from '@/api/routes/admin/nests/importEgg';
import useFlash from '@/plugins/useFlash';
import { Button } from '@/elements/button';
import { Size, Variant } from '@/elements/button/types';
import { Editor } from '@/elements/editor';
import Modal from '@/elements/Modal';
import FlashMessageRender from '@/elements/FlashMessageRender';

export default ({ className }: { className?: string }) => {
    const [visible, setVisible] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const { clearFlashes } = useFlash();

    const params = useParams<'nestId'>();
    const { mutate } = getEggs(Number(params.nestId));

    let fetchFileContent: (() => Promise<string>) | null = null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const submit = async () => {
        clearFlashes('egg:import');

        if (!fetchFileContent && !file) {
            return;
        }

        if (file) {
            const reader = new FileReader();

            reader.onload = async e => {
                console.log('reader loaded');
                try {
                    const jsonData = JSON.parse(e.target?.result as string);
                    const egg = await importEgg(Number(params.nestId), jsonData);
                    await mutate(data => ({ ...data!, items: [...data!.items!, egg] }));
                    setVisible(false);
                } catch (error) {
                    console.error('Failed to parse or import egg:', error);
                }
            };

            reader.onerror = () => {
                console.error('File could not be read:', reader.error);
            };

            reader.readAsText(file);
        } else if (fetchFileContent) {
            try {
                const jsonContent = await fetchFileContent();
                const jsonData = JSON.parse(jsonContent);
                const egg = await importEgg(Number(params.nestId), jsonData);
                await mutate(data => ({ ...data!, items: [...data!.items!, egg] }));
                setVisible(false);
            } catch (error) {
                console.error('Failed to import from editor content:', error);
            }
        }
    };

    return (
        <>
            <Modal visible={visible} onDismissed={() => setVisible(false)}>
                <FlashMessageRender byKey={'egg:import'} css={tw`mb-6`} />

                <h2 css={tw`mb-6 text-2xl text-neutral-100`}>Import Egg</h2>

                <Editor
                    childClassName={tw`h-64 rounded`}
                    initialContent={''}
                    fetchContent={value => {
                        fetchFileContent = value;
                    }}
                    language={LanguageDescription.of({ name: 'json', support: json() })}
                />

                <div css={tw`flex flex-wrap justify-end mt-4 sm:mt-6`}>
                    <Button.Text
                        type="button"
                        variant={Variant.Secondary}
                        css={tw`w-full sm:w-auto sm:mr-2`}
                        onClick={() => setVisible(false)}
                    >
                        Cancel
                    </Button.Text>

                    <input type="file" accept=".json" onChange={handleFileChange} className={'mt-4'} />

                    <Button css={tw`w-full sm:w-auto mt-4 sm:mt-0`} onClick={submit}>
                        Import Egg
                    </Button>
                </div>
            </Modal>

            <Button
                type="button"
                size={Size.Large}
                variant={Variant.Secondary}
                css={tw`h-10 px-4 py-0 whitespace-nowrap`}
                className={className}
                onClick={() => setVisible(true)}
            >
                Import
            </Button>
        </>
    );
};
