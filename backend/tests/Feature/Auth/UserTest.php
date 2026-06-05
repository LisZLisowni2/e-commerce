<?php

use App\Models\User;

test('get user details', function () {
    $user = User::factory()->create();

    $token = $user->createToken("test-token")->plainTextToken;

    $response = $this->withToken($token)->getJson("/api/user");

    $response->assertStatus(200);
});

test('unauthorized access to details', function () {
    $response = $this->getJson("/api/user");

    $response->assertStatus(401);
});

test('logout user', function () {
    $user = User::factory()->create();

    $token = $user->createToken("test-token")->plainTextToken;

    $response = $this->withToken($token)->postJson("/api/logout");

    $response->assertStatus(200)
        ->assertJson(['message' => 'Logged out successfully']); 
});

test('unauthorized logout user', function () {
    $response = $this->postJson("/api/logout");

    $response->assertStatus(401);
});