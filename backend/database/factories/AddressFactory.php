<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AddressFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'address_type' => fake()->randomElement(['shipping', 'billing']),
            'address_line_1' => fake()->streetAddress(),
            'address_line_2' => fake()->optional()->secondaryAddress(),
            'city' => fake()->city(),
            'state_province' => fake()->optional()->stateAbbr(),
            'postal_code' => fake()->postcode(),
            'country_code' => fake()->countryCode(),
        ];
    }
}
