import { useField } from 'formik';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';

import type { WithRelationships } from '@/api/routes/admin';
import type { Egg } from '@/api/routes/admin/egg';
import { searchEggs } from '@/api/routes/admin/egg';
import Label from '@/elements/Label';
import Select from '@/elements/Select';

interface Props {
    nestId?: number;
    selectedEggId?: number;
    onEggSelect: (egg: WithRelationships<Egg, 'variables'> | undefined) => void;
}

export default ({ nestId, selectedEggId, onEggSelect }: Props) => {
    const [, , { setValue: setEnvValue, setTouched: setEnvTouched }] =
        useField<Record<string, string | undefined>>('environment');
    const [, , { setValue: setEggIdValue, setTouched: setEggIdTouched }] = useField<number>('eggId');
    const [eggs, setEggs] = useState<WithRelationships<Egg, 'variables'>[] | undefined>(undefined);

    const selectEgg = (egg: WithRelationships<Egg, 'variables'> | undefined) => {
        if (egg === undefined) {
            onEggSelect(undefined);
            return;
        }

        // Clear values
        setEnvValue({});
        setEnvTouched(true);

        // Set eggId in form
        setEggIdValue(egg.id);
        setEggIdTouched(true);

        onEggSelect(egg);

        const values: Record<string, any> = {};
        egg.relationships.variables?.forEach(v => {
            values[v.environmentVariable] = v.defaultValue;
        });
        setEnvValue(values);
        setEnvTouched(true);
    };

    useEffect(() => {
        if (!nestId) {
            setEggs(undefined);
            return;
        }

        searchEggs(nestId, {})
            .then(_eggs => {
                setEggs(_eggs);

                // If the currently selected egg is in the selected nest, use it instead of picking the first egg on the nest.
                const egg = _eggs.find(egg => egg.id === selectedEggId) ?? _eggs[0];
                selectEgg(egg);
            })
            .catch(error => console.error(error));
    }, [nestId]);

    const onSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        selectEgg(eggs?.find(egg => egg.id.toString() === event.currentTarget.value) ?? undefined);
    };

    return (
        <>
            <Label>Egg</Label>
            <Select id={'eggId'} name={'eggId'} value={selectedEggId} onChange={onSelectChange}>
                {!eggs ? (
                    <option disabled>Loading...</option>
                ) : (
                    eggs.map(v => (
                        <option key={v.id} value={v.id.toString()}>
                            {v.name}
                        </option>
                    ))
                )}
            </Select>
        </>
    );
};
