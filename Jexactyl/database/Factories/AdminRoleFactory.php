<?php

namespace Database\Factories;

use Illuminate\Support\Str;
use Everest\Models\AdminRole;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdminRoleFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = AdminRole::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'name' => Str::random(16),
            'description' => Str::random(32),
            'permissions' => ['overview.read'],
        ];
    }
}
