<?php

/**
 * Pterodactyl CHINA - Panel
 * Copyright (c) 2015 - 2017 Dane Everitt <dane@daneeveritt.com>.
 * Simplified Chinese Translation Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com>.
 *
 * This software is licensed under the terms of the MIT license.
 * https://opensource.org/licenses/MIT
 */

return [
    'sign_in' => '登入',
    'go_to_login' => '前往登录',
    'failed' => '用户名或密码错误。',

    'forgot_password' => [
        'label' => '忘记密码？',
        'label_help' => '输入您帐户的电子邮箱地址用来接收重置密码的说明。',
        'button' => '找回账户',
    ],

    'reset_password' => [
        'button' => '重置并登录',
    ],

    'two_factor' => [
        'label' => '动态口令',
        'label_help' => '此帐户需要进行动态口令认证才能继续。请输入您设备生成的验证码以完成此登录。',
        'checkpoint_failed' => '动态口令无效。',
    ],

    'throttle' => '登录尝试次数过多。请在 :seconds 秒后重试。',
    'password_requirements' => '密码长度必须至少为 8 个字符，并且对于本站来说应该是独一无二的。',
    '2fa_must_be_enabled' => '管理员要求您的帐户必须启用动态口令认证才能正常使用面板',
];
