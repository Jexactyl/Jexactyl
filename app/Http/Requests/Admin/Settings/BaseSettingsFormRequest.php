<?php

namespace Pterodactyl\Http\Requests\Admin\Settings;

use Illuminate\Validation\Rule;
use Pterodactyl\Traits\Helpers\AvailableLanguages;
use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class BaseSettingsFormRequest extends AdminFormRequest
{
    use AvailableLanguages;

    /**
     * @return array
     */
    public function rules()
    {
        return [
            'app:name' => 'required|string|max:191',
            'pterodactyl:auth:2fa_required' => 'required|integer|in:0,1,2',
            'app:locale' => ['required', 'string', Rule::in(array_keys($this->getAvailableLanguages()))],
            'app:logo' => 'required|string|max:191',
        ];
    }

    /**
     * @return array
     */
    public function attributes()
    {
        return [
            'app:name' => '公司名称',
            'pterodactyl:auth:2fa_required' => '需要动态口令认证',
            'app:locale' => '默认语言',
            'app:logo' => '面板 Logo',
        ];
    }
}
