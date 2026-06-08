<?php

use Illuminate\Foundation\Inspiring;
use App\Models\User;
use App\ScopeEnum;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('make:root', function () {
    $this->info('====================================');
    $this->info('   Creating Super-Admin Account     ');
    $this->info('====================================');

    $name = $this->ask('Enter Admin Name', 'root');
    $email = $this->ask('Enter Admin Email');
    
    if (User::where('email', $email)->exists()) {
        $this->error("Error: A user with the email {$email} already exists!");
        return;
    }

    $password = $this->ask('Enter Admin Password. Leave blank to auto-generate');
    if (empty($password)) {
        $password = Str::random(12);
        $this->info("Auto-generated password {$password}");
    }

    if (!$this->confirm("Do you want to create the admin account for {$email}?", true)) {
        $this->comment('Command aborted.');
        return;
    }

    $admin = User::create([
        'name' => $name,
        'email' => $email,
        'password' => Hash::make($password),
        'scope' => ScopeEnum::ADMIN,
    ]);

    $this->info("Success! Super-Admin account created successfully with ID: {$admin->id}");
})->purpose('Create a super-user account');