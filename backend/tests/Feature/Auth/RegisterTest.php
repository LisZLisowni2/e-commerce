<?php

use App\Models\User;

test('register success', function () {
    $response = $this->post("/api/register", [
        "name" => "test",
        "email" => "test@gmail.com",
        "password" => "myPassword",
        "password_confirmation" => "myPassword",
    ]);

    $response->assertStatus(201);
});

test('register failed with existed email', function () {
    $user = User::factory()->create();

    $response = $this->post("/api/register", [
        "name" => "test",
        "email" => $user->email,
        "password" => "myPassword",
        "password_confirmation" => "myPassword",
    ]);

    $response->assertStatus(422);
});

test('register failed with empty fields', function () {
    $response = $this->post("/api/register");

    $response->assertStatus(422);
});