<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Product;
use App\Models\User;
use App\ScopeEnum;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory(30)->create([
            "scope" => ScopeEnum::USER->value,
        ]);

        $vendors = User::factory(10)->create([
            "scope" => ScopeEnum::VENDOR->value,
        ]);

        Product::factory(30)->create([
            "vendor_id" => fn () => $vendors->random()->id,
        ]);

        $allUsers = User::all();
        Address::factory(40)->create([
            'user_id' => fn () => $allUsers->random()->id,
        ]);
    }
}
