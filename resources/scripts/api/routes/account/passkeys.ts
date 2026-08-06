import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import { startRegistration } from '@simplewebauthn/browser';

import http, { FractalResponseList } from '@/api/http';
import { Passkey, Transformers } from '@definitions/account';
import { useUserSWRKey } from '@/plugins/useSWRKey';

const usePasskeys = (config?: SWRConfiguration<Passkey[], AxiosError>) => {
    const key = useUserSWRKey(['account', 'passkeys']);

    return useSWR(
        key,
        async () => {
            const { data } = await http.get('/api/client/account/passkeys');

            return (data as FractalResponseList).data.map((datum: any) => {
                return Transformers.toPasskey(datum);
            });
        },
        { revalidateOnMount: false, ...(config || {}) },
    );
};

/**
 * Runs a full registration ceremony: ask the Panel for options, hand them to the browser so
 * the user can satisfy their authenticator, then send the result back to be verified.
 *
 * The password is confirmed while fetching the options, so a wrong one fails before the user
 * is ever prompted for a fingerprint.
 */
const createPasskey = async (name: string, password?: string): Promise<Passkey> => {
    const { data: options } = await http.post('/api/client/account/passkeys/options', { password });
    const credential = await startRegistration({ optionsJSON: options });

    const { data } = await http.post('/api/client/account/passkeys', { name, credential });

    return Transformers.toPasskey(data);
};

const deletePasskey = async (uuid: string, password?: string): Promise<void> =>
    await http.post('/api/client/account/passkeys/remove', { uuid, password });

export { usePasskeys, createPasskey, deletePasskey };
