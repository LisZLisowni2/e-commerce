<?php

use App\Models\User;

test('get user details', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->get("/api/user");

    $response->assertStatus(200);
});

test('unauthorized access to details', function () {
    $response = $this->get("/api/user");

    $response->assertStatus(401);
});

test('logout user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->post("/api/logout");

    $response->assertStatus(200);
});

test('unauthorized logout user', function () {
    $response = $this->post("/api/logout");

    $response->assertStatus(401);
});