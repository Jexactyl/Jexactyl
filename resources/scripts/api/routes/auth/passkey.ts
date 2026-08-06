import { startAuthentication } from '@simplewebauthn/browser';

import http from '@/api/http';
import { type AuthResponse } from '@definitions/auth';

/**
 * Signs in with a passkey.
 *
 * No username is sent at any point: the options carry an empty credential list, so the browser
 * resolves the account itself from the discoverable credential it holds.
 */
const passkeyLogin = async (): Promise<AuthResponse> => {
    await http.get('/sanctum/csrf-cookie');

    const { data: options } = await http.post('/auth/passkey/options');
    const credential = await startAuthentication({ optionsJSON: options });

    const { data } = await http.post('/auth/passkey/login', { credential });

    return {
        complete: data.data.complete,
        intended: data.data.intended || undefined,
    };
};

/**
 * Whether this browser can run a WebAuthn ceremony at all. False on insecure origins and in
 * older browsers, where the sign-in button should simply not be offered.
 */
const passkeysSupported = (): boolean => typeof window.PublicKeyCredential !== 'undefined';

/**
 * Dismissing the OS prompt rejects the ceremony. That is a deliberate user action rather than
 * a failure, so it should not surface as an error.
 */
const isPasskeyCancellation = (error: unknown): boolean =>
    error instanceof Error && ['NotAllowedError', 'AbortError'].includes(error.name);

export { passkeyLogin, passkeysSupported, isPasskeyCancellation };
