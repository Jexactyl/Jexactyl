<?php

namespace Jexactyl\Exceptions\Service\User;

use Jexactyl\Exceptions\DisplayException;

class TwoFactorAuthenticationTokenInvalid extends DisplayException
{
    /**
     * TwoFactorAuthenticationTokenInvalid constructor.
     */
    public function __construct()
    {
        parent::__construct('The provided two-factor authentication token was not valid.');
    }
}
