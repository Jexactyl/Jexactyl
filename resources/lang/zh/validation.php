<?php

/**
 * Pterodactyl CHINA - Panel
 * Simplified Chinese Translation Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com>.
 *
 * This software is licensed under the terms of the MIT license.
 * https://opensource.org/licenses/MIT
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => '必须接受 :attribute 。',
    'active_url' => ':attribute 不是有效的 URL。',
    'after' => ':attribute 的日期必须在 :date 之后。',
    'after_or_equal' => ':attribute 的日期必须是晚于或等于 :date。',
    'alpha' => ':attribute 只能包含字母。',
    'alpha_dash' => ':attribute 只能包含字母、数字和破折号。',
    'alpha_num' => ':attribute 只能包含字母和数字。',
    'array' => ':attribute 必须是一个数组。',
    'before' => ':attribute 的日期必须在 :date 之前。',
    'before_or_equal' => ':attribute 的日期必须是早于或等于 :date。',
    'between' => [
        'numeric' => ':attribute 必须介于 :min - :max 之间。',
        'file' => ':attribute 必须介于 :min - :max KB 之间。',
        'string' => ':attribute 必须介于 :min - :max 字符之间。',
        'array' => ':attribute 必须介于 :min - :max 个数字之间。',
    ],
    'boolean' => ':attribute 字段必须是 true 或 false。',
    'confirmed' => ':attribute 确认不匹配。',
    'date' => ':attribute 不是有效日期。',
    'date_format' => ':attribute 与 :format 格式不匹配。',
    'different' => ':attribute 和 :other 两者不能一样。',
    'digits' => ':attribute 必须是 :digits 数字。',
    'digits_between' => ':attribute 必须介于 :min - :max 数字之间。',
    'dimensions' => ':attribute 的图片尺寸无效。',
    'distinct' => ':attribute 字段具有重复值。',
    'email' => ':attribute 必须是有效的电子邮件地址。',
    'exists' => '所选的 :attribute 无效。',
    'file' => ':attribute 必须是一个文件。',
    'filled' => ':attribute 字段是必填字段。',
    'image' => ':attribute 必须是图片。',
    'in' => '所选的 :attribute 无效。',
    'in_array' => ':other 中不存在 :attribute 字段。',
    'integer' => ':attribute 必须是一个整数。',
    'ip' => ':attribute 必须是有效的 IP 地址。',
    'json' => ':attribute 必须是有效的 JSON 字符串。',
    'max' => [
        'numeric' => ':attribute 不能大于 :max。',
        'file' => ':attribute 不能大于 :max KB。',
        'string' => ':attribute 不能大于 :max 个字符。',
        'array' => ':attribute 不能超过 :max 个数字。',
    ],
    'mimes' => ':attribute 必须是类型为: :values 的文件。',
    'mimetypes' => ':attribute 必须是类型为: :values 的文件。',
    'min' => [
        'numeric' => ':attribute 必须至少为 :min。',
        'file' => ':attribute 必须至少为 :min KB。',
        'string' => ':attribute 必须至少为 :min 个字符。',
        'array' => ':attribute 必须至少有 :min 个数字。',
    ],
    'not_in' => '所选的 :attribute 无效。',
    'numeric' => ':attribute 必须是一个数字。',
    'present' => ':attribute 字段必须存在。',
    'regex' => ':attribute 格式无效。',
    'required' => ':attribute 字段是必填字段。',
    'required_if' => '当 :other 是 :value 时是必需要 :attribute 字段的。',
    'required_unless' => '除非 :other 在 :values 中，否则必需要有 :attribute 字段。',
    'required_with' => '当 :values 存在时是需要 :attribute 字段的。',
    'required_with_all' => '当 :values 存在时是需要 :attribute 字段的。',
    'required_without' => '当 :values 不存在时是需要 :attribute 字段的。',
    'required_without_all' => '当不存在 :values 时是需要 :attribute 字段的。',
    'same' => ':attribute 和 :other 必须相匹配。',
    'size' => [
        'numeric' => ':attribute 必须是 :size。',
        'file' => ':attribute 必须是 :size KB。',
        'string' => ':attribute 必须是 :size 字符。',
        'array' => ':attribute 必须包含 :size 个数字。',
    ],
    'string' => ':attribute 必须是字符串。',
    'timezone' => ':attribute 必须是一个有效的区域。',
    'unique' => ':attribute 已被占用。',
    'uploaded' => ':attribute 上传失败。',
    'url' => ':attribute 格式无效。',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap attribute place-holders
    | with something more reader friendly such as E-Mail Address instead
    | of "email". This simply helps us make messages a little cleaner.
    |
    */

    'attributes' => [],

    // Internal validation logic for Pterodactyl
    'internal' => [
        'variable_value' => ':env 变量',
        'invalid_password' => '提供的密码对此帐户无效。',
    ],
];
