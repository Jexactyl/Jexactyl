import { useFormikContext } from 'formik';
import { useState } from 'react';

import type { Node } from '@/api/routes/admin/node';
import { searchNodes } from '@/api/routes/admin/node';
import SearchableSelect, { Option } from '@/elements/SearchableSelect';

export default ({ node, setNode }: { node: Node | null; setNode: (_: Node | null) => void }) => {
    const { setFieldValue } = useFormikContext();

    const [nodes, setNodes] = useState<Node[] | null>(null);

    const onSearch = async (query: string) => {
        const [byName, byFqdn] = await Promise.all([
            searchNodes({ filters: { name: query } }),
            searchNodes({ filters: { fqdn: query } }),
        ]);

        const combined = [...new Map([...byName, ...byFqdn].map(n => [n.id, n])).values()];
        setNodes(combined);
    };

    const onSelect = (node: Node | null) => {
        setNode(node);
        setFieldValue('nodeId', node?.id || null);
    };

    const getSelectedText = (node: Node | null): string => node?.name || '';

    return (
        <SearchableSelect
            id={'nodeId'}
            name={'nodeId'}
            label={'Node'}
            placeholder={'Select a node...'}
            items={nodes}
            selected={node}
            setSelected={setNode}
            setItems={setNodes}
            onSearch={onSearch}
            onSelect={onSelect}
            getSelectedText={getSelectedText}
            nullable
        >
            {nodes?.map(d => (
                <Option key={d.id} selectId={'nodeId'} id={d.id} item={d} active={d.id === node?.id}>
                    {d.name} ({d.fqdn})
                </Option>
            ))}
        </SearchableSelect>
    );
};
