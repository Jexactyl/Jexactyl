<?php

return [
    /*
     * Enable or disable OIDC SSO
     */
    'enabled' => env('OIDC_ENABLED', false),

    /*
     * OIDC Issuer URL (e.g. https://accounts.google.com or https://keycloak.example.com/realms/myrealm)
     * The panel will fetch /.well-known/openid-configuration from this URL automatically.
     */
    'issuer_url' => env('OIDC_ISSUER_URL', ''),

    /*
     * OIDC Client ID
     */
    'client_id' => env('OIDC_CLIENT_ID', ''),

    /*
     * OIDC Client Secret
     */
    'client_secret' => env('OIDC_CLIENT_SECRET', ''),

    /*
     * Display name shown on the login button (defaults to "SSO")
     */
    'display_name' => env('OIDC_DISPLAY_NAME', 'SSO'),

    /*
     * Space-separated list of scopes to request (openid, email, and profile are always included)
     */
    'scopes' => env('OIDC_SCOPES', ''),

    /*
     * When enabled, the regular username/password login form will be hidden on the
     * login page. Users will only be able to authenticate via this OIDC SSO module.
     * Has no effect if OIDC SSO is not enabled.
     */
    'disable_local_login' => env('OIDC_DISABLE_LOCAL_LOGIN', false),

    /*
     * When enabled (the default), the panel will reject any OIDC login whose
     * id_token / userinfo does not assert email_verified === true. Turn this
     * off ONLY if your provider is known to not emit the claim *and* you fully
     * trust it not to issue tokens with email addresses the user does not own —
     * disabling it re-opens the account-takeover path where an attacker with an
     * OIDC account at your IdP can claim an existing panel user's email.
     */
    'require_verified_email' => env('OIDC_REQUIRE_VERIFIED_EMAIL', true),

    /*
     * When enabled (the default), the panel verifies the TLS certificate on
     * every outbound call to the OIDC provider (discovery, token endpoint,
     * userinfo, JWKS). Turn this off ONLY for trusted internal IdPs that
     * present a self-signed or otherwise non-trusted certificate — disabling
     * it removes the only protection against an attacker who can MITM the
     * panel → IdP connection (e.g. via a compromised intermediate proxy).
     */
    'verify_ssl' => env('OIDC_VERIFY_SSL', true),
];
