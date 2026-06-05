<?php

use App\Models\User;

test('register success', function () {
    $response = $this->post("/api/register", [
        "name" => "testing123",
        "email" => "testing@testing.com",
        "password" => "myPassword",
        "password_confirmation" => "myPassword",
    ]);

    $response->assertStatus(201);
});

test('register failed with existed email', function () {
    $user = User::factory()->create();

    $response = $this->post("/api/register", [
        "name" => "testing123",
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