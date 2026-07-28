<?php

use App\Models\Address;
use App\Models\User;

test('unauthenticated user cannot list addresses', function () {
    $response = $this->getJson('/api/addresses');

    $response->assertStatus(401);
});

test('authenticated user can list own addresses', function () {
    $user = User::factory()->create();
    Address::factory()->count(3)->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->getJson('/api/addresses');

    $response->assertStatus(200);
    expect(count($response->json('addresses')))->toBe(3);
});

test('user only sees own addresses', function () {
    $user = User::factory()->create();
    Address::factory()->count(2)->create(['user_id' => $user->id]);

    $otherUser = User::factory()->create();
    Address::factory()->count(4)->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user)->getJson('/api/addresses');

    $response->assertStatus(200);
    expect(count($response->json('addresses')))->toBe(2);
});

test('unauthenticated user cannot view address', function () {
    $address = Address::factory()->create();

    $response = $this->getJson("/api/addresses/{$address->id}");

    $response->assertStatus(401);
});

test('user can view own address', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->getJson("/api/addresses/{$address->id}");

    $response->assertStatus(200);
    expect($response->json('address.id'))->toBe($address->id);
});

test('user cannot view other users address', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user)->getJson("/api/addresses/{$address->id}");

    $response->assertStatus(403);
});

test('unauthenticated user cannot create address', function () {
    $response = $this->postJson('/api/addresses', [
        'address_type' => 'shipping',
        'address_line_1' => '123 Main St',
        'city' => 'New York',
        'postal_code' => '10001',
        'country' => 'USA',
    ]);

    $response->assertStatus(401);
});

test('authenticated user can create address', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/addresses', [
        'address_type' => 'shipping',
        'address_line_1' => '123 Main St',
        'address_line_2' => 'Apt 4B',
        'city' => 'New York',
        'state_province' => 'NY',
        'postal_code' => '10001',
        'country' => 'USA',
    ]);

    $response->assertStatus(201);
    expect($response->json('address.address_line_1'))->toBe('123 Main St');
    expect($response->json('address.user_id'))->toBe($user->id);
    expect(Address::count())->toBe(1);
});

test('create address validation errors', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/addresses', []);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors([
        'address_type',
        'address_line_1',
        'city',
        'postal_code',
        'country',
    ]);
});

test('create address invalid address_type', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/addresses', [
        'address_type' => 'invalid',
        'address_line_1' => '123 Main St',
        'city' => 'New York',
        'postal_code' => '10001',
        'country' => 'USA',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['address_type']);
});

test('unauthenticated user cannot update address', function () {
    $address = Address::factory()->create();

    $response = $this->putJson("/api/addresses/{$address->id}", [
        'city' => 'Los Angeles',
    ]);

    $response->assertStatus(401);
});

test('user can update own address', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->putJson("/api/addresses/{$address->id}", [
        'city' => 'Los Angeles',
    ]);

    $response->assertStatus(200);
    expect($response->json('address.city'))->toBe('Los Angeles');
});

test('user cannot update other users address', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user)->putJson("/api/addresses/{$address->id}", [
        'city' => 'Los Angeles',
    ]);

    $response->assertStatus(403);
});

test('update address partial update', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create([
        'user_id' => $user->id,
        'city' => 'New York',
        'postal_code' => '10001',
    ]);

    $response = $this->actingAs($user)->putJson("/api/addresses/{$address->id}", [
        'city' => 'Los Angeles',
    ]);

    $response->assertStatus(200);
    expect($response->json('address.city'))->toBe('Los Angeles');
    expect($response->json('address.postal_code'))->toBe('10001');
});

test('unauthenticated user cannot delete address', function () {
    $address = Address::factory()->create();

    $response = $this->deleteJson("/api/addresses/{$address->id}");

    $response->assertStatus(401);
});

test('user can delete own address', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->deleteJson("/api/addresses/{$address->id}");

    $response->assertStatus(204);
    expect(Address::count())->toBe(0);
});

test('user cannot delete other users address', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user)->deleteJson("/api/addresses/{$address->id}");

    $response->assertStatus(403);
    expect(Address::count())->toBe(1);
});

test('create billing address', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/addresses', [
        'address_type' => 'billing',
        'address_line_1' => '456 Oak Ave',
        'city' => 'Chicago',
        'postal_code' => '60601',
        'country' => 'USA',
    ]);

    $response->assertStatus(201);
    expect($response->json('address.address_type'))->toBe('billing');
});

test('list addresses returns empty array for user with no addresses', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/addresses');

    $response->assertStatus(200);
    expect($response->json('addresses'))->toBe([]);
});
