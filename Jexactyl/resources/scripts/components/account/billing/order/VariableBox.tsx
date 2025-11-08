import { memo } from 'react';
import { EggVariable } from '@definitions/server';
import TitledGreyBox from '@/elements/TitledGreyBox';
import Input from '@/elements/Input';
import Switch from '@/elements/Switch';
import FlashMessageRender from '@/elements/FlashMessageRender';
import Select from '@/elements/Select';
import isEqual from 'react-fast-compare';

interface Props {
    variable: EggVariable;
    vars: Map<string, string>;
}

const VariableBox = ({ variable, vars }: Props) => {
    const FLASH_KEY = `billing:variable:${variable.envVariable}`;

    const useSwitch = variable.rules.some(
        v => v === 'boolean' || v === 'in:0,1' || v === 'in:1,0' || v === 'in:true,false' || v === 'in:false,true',
    );
    const isStringSwitch = variable.rules.some(v => v === 'string');
    const selectValues = variable.rules.find(v => v.startsWith('in:'))?.split(',') || [];

    if (!variable.isEditable) return null;

    return (
        <TitledGreyBox title={<p className="text-sm font-semibold">{variable.name}</p>}>
            <FlashMessageRender byKey={FLASH_KEY} className="mb-2 md:mb-4" />
            {useSwitch ? (
                <>
                    <Switch
                        name={variable.envVariable}
                        defaultChecked={isStringSwitch ? variable.serverValue === 'true' : variable.serverValue === '1'}
                        onChange={() => {
                            if (isStringSwitch) {
                                vars.set(variable.envVariable, variable.serverValue === 'true' ? 'false' : 'true');
                            } else {
                                vars.set(variable.envVariable, variable.serverValue === '1' ? '0' : '1');
                            }
                        }}
                    />
                </>
            ) : (
                <>
                    {selectValues.length > 0 ? (
                        <>
                            <Select
                                onChange={e => {
                                    vars.set(variable.envVariable, e.target.value);
                                }}
                                name={variable.envVariable}
                                defaultValue={variable.serverValue ?? variable.defaultValue}
                            >
                                {selectValues.map(selectValue => (
                                    <option key={selectValue.replace('in:', '')} value={selectValue.replace('in:', '')}>
                                        {selectValue.replace('in:', '')}
                                    </option>
                                ))}
                            </Select>
                        </>
                    ) : (
                        <>
                            <Input
                                onKeyUp={e => {
                                    vars.set(variable.envVariable, e.currentTarget.value);
                                }}
                                name={variable.envVariable}
                                defaultValue={variable.serverValue ?? ''}
                                placeholder={variable.defaultValue}
                            />
                        </>
                    )}
                </>
            )}

            <p className="mt-1 text-xs text-neutral-300">{variable.description}</p>
        </TitledGreyBox>
    );
};

export default memo(VariableBox, isEqual);
