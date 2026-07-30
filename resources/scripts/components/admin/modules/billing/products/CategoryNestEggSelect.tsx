import { useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import type { Nest, Egg } from '@definitions/admin';
import { searchNests } from '@/api/routes/admin/nests';
import { searchEggs } from '@/api/routes/admin/eggs';
import type { CategoryValues } from '@/api/routes/admin/billing';
import Label from '@/elements/Label';
import Select from '@/elements/Select';

const NestSelect = () => {
    const { values, setFieldValue } = useFormikContext<CategoryValues>();
    const [nests, setNests] = useState<Nest[] | null>(null);

    useEffect(() => {
        searchNests({})
            .then(_nests => {
                setNests(_nests);

                if (!values.nestId && _nests.length > 0) {
                    setFieldValue('nestId', _nests[0]!.id);
                }
            })
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <Label>Nest</Label>
            <Select
                value={values.nestId?.toString() ?? ''}
                onChange={e => {
                    setFieldValue('nestId', Number(e.currentTarget.value));
                    setFieldValue('eggId', null);
                }}
            >
                {!nests ? (
                    <option disabled>Loading...</option>
                ) : (
                    nests.map(v => (
                        <option key={v.uuid} value={v.id.toString()}>
                            {v.name}
                        </option>
                    ))
                )}
            </Select>
            <p className={'text-xs text-gray-400 mt-1'}>
                The nest this category&apos;s products will deploy servers from.
            </p>
        </div>
    );
};

const EggSelect = () => {
    const { values, setFieldValue } = useFormikContext<CategoryValues>();
    const [eggs, setEggs] = useState<Egg[] | null>(null);

    useEffect(() => {
        if (!values.nestId) {
            setEggs([]);
            return;
        }

        searchEggs(values.nestId, {})
            .then(setEggs)
            .catch(error => console.error(error));
    }, [values.nestId]);

    return (
        <div>
            <Label>Egg</Label>
            <Select
                value={values.eggId?.toString() ?? 'none'}
                onChange={e =>
                    setFieldValue('eggId', e.currentTarget.value === 'none' ? null : Number(e.currentTarget.value))
                }
            >
                <option value={'none'}>Any egg in this nest (customer chooses)</option>
                {eggs?.map(v => (
                    <option key={v.uuid} value={v.id.toString()}>
                        {v.name}
                    </option>
                ))}
            </Select>
            <p className={'text-xs text-gray-400 mt-1'}>
                Leave unset to let customers pick which egg in this nest to deploy at checkout.
            </p>
        </div>
    );
};

export default () => (
    <div className={'space-y-4'}>
        <NestSelect />
        <EggSelect />
    </div>
);
