import useSWR from 'swr';
import http from '@/api/http';
import { ServerContext } from '@/state/server';
import { Allocation, Transformers } from '@definitions/server';

const getAllocations = () => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);

    return useSWR<Allocation[]>(
        ['server:allocations', uuid],
        async () => {
            const { data } = await http.get(`/api/client/servers/${uuid}/network/allocations`);

            return (data.data || []).map(Transformers.toAllocation);
        },
        { revalidateOnFocus: false, revalidateOnMount: false },
    );
};

const createAllocation = async (uuid: string): Promise<Allocation> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/network/allocations`);

    return Transformers.toAllocation(data);
};

const setPrimaryAllocation = async (uuid: string, id: number): Promise<Allocation> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/network/allocations/${id}/primary`);

    return Transformers.toAllocation(data);
};

const setAllocationNotes = async (uuid: string, id: number, notes: string | null): Promise<Allocation> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/network/allocations/${id}`, { notes });

    return Transformers.toAllocation(data);
};

const deleteAllocation = async (uuid: string, id: number): Promise<Allocation> =>
    await http.delete(`/api/client/servers/${uuid}/network/allocations/${id}`);

export { getAllocations, createAllocation, setPrimaryAllocation, setAllocationNotes, deleteAllocation };
