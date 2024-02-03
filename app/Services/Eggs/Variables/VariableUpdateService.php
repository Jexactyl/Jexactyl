<?php

namespace Everest\Services\Eggs\Variables;

use Illuminate\Support\Str;
use Everest\Models\Egg;
use Everest\Models\EggVariable;
use Everest\Exceptions\DisplayException;
use Everest\Traits\Services\ValidatesValidationRules;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Everest\Exceptions\Service\Egg\Variable\ReservedVariableNameException;

class VariableUpdateService
{
    use ValidatesValidationRules;

    /**
     * VariableUpdateService constructor.
     */
    public function __construct(private ValidationFactory $validator)
    {
    }

    /**
     * Return the validation factory instance to be used by rule validation
     * checking in the trait.
     */
    protected function getValidator(): ValidationFactory
    {
        return $this->validator;
    }

    /**
     * Update a specific egg variable.
     *
     * @throws \Everest\Exceptions\DisplayException
     * @throws \Everest\Exceptions\Service\Egg\Variable\ReservedVariableNameException
     */
    public function handle(Egg $egg, array $data): void
    {
        if (!is_null(array_get($data, 'env_variable'))) {
            if (in_array(strtoupper(array_get($data, 'env_variable')), explode(',', EggVariable::RESERVED_ENV_NAMES))) {
                throw new ReservedVariableNameException(trans('exceptions.service.variables.reserved_name', ['name' => array_get($data, 'env_variable')]));
            }

            $count = $egg->variables()
                ->where('egg_variables.env_variable', $data['env_variable'])
                ->where('egg_variables.id', '!=', $data['id'])
                ->count();

            if ($count > 0) {
                throw new DisplayException(trans('exceptions.service.variables.env_not_unique', ['name' => array_get($data, 'env_variable')]));
            }
        }

        if (!empty($data['rules'] ?? '')) {
            $this->validateRules(
                (is_string($data['rules']) && Str::contains($data['rules'], ';;'))
                    ? explode(';;', $data['rules'])
                    : $data['rules']
            );
        }

        $options = array_get($data, 'options') ?? [];

        $egg->variables()->where('egg_variables.id', $data['id'])->update([
            'name' => $data['name'] ?? '',
            'description' => $data['description'] ?? '',
            'env_variable' => $data['env_variable'] ?? '',
            'default_value' => $data['default_value'] ?? '',
            'user_viewable' => $data['user_viewable'],
            'user_editable' => $data['user_editable'],
            'rules' => $data['rules'] ?? '',
        ]);
    }
}
