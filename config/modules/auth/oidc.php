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
];
