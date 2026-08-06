<?php

use Everest\Http\Controllers\Base;
use Illuminate\Support\Facades\Route;
use Everest\Http\Middleware\RequireTwoFactorAuthentication;

Route::get('/', [Base\IndexController::class, 'index'])->name('index')->fallback();
Route::get('/account', [Base\IndexController::class, 'index'])
    ->withoutMiddleware(RequireTwoFactorAuthentication::class)
    ->name('account');

// Two-factor enrolment lives under the security tab, so this is where the middleware sends a
// user who has not enabled it yet — it has to stay reachable without it.
Route::get('/account/security/{path?}', [Base\IndexController::class, 'index'])
    ->where('path', '.*')
    ->withoutMiddleware(RequireTwoFactorAuthentication::class)
    ->name('account.security');

Route::get('/{react}', [Base\IndexController::class, 'index'])
    ->where('react', '^(?!(\/)?(api|auth|admin|daemon)).+');
