<?php

use App\Models\User;

test('login success', function () {
    $user = User::factory()->create([
        "password" => bcrypt('password')
    ]);

    $response = $this->post("/api/login", [
        "email" => $user->email,
        "password" => 'password',
    ]);

    $response->assertStatus(200);
});

test('login failed with bad password', function () {
    $user = User::factory()->create();

    $response = $this->post("/api/login", [
        "email" => $user->email,
        "password" => 'wrong-password',
    ]);

    $response->assertStatus(422);
});

test('login failed with bad email', function () {
    User::factory()->create([
        "password" => bcrypt('password')
    ]);

    $response = $this->post("/api/login", [
        "email" => 'test@email.com',
        "password" => 'password',
    ]);

    $response->assertStatus(422);
});

test('login failed with empty fields', function () {
    $response = $this->post("/api/login");

    $response->assertStatus(422);
});