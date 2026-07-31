<?php

use App\Models\User;
use App\ScopeEnum;

test('unauthenticated user cannot create a user', function () {
    $response = $this->postJson('/api/users', [
        'email' => 'new@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(401);
});

test('user role cannot create a user', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::USER,
    ]);

    $response = $this->actingAs($user)->postJson('/api/users', [
        'email' => 'new@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(403);
});

test('vendor role cannot create a user', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $response = $this->actingAs($user)->postJson('/api/users', [
        'email' => 'new@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(403);
});

test('support role cannot create a user', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::SUPPORT,
    ]);

    $response = $this->actingAs($user)->postJson('/api/users', [
        'email' => 'new@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(403);
});

test('admin can create a user', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $response = $this->actingAs($admin)->postJson('/api/users', [
        'email' => 'new@example.com',
        'password' => 'password123',
        'scope' => 'vendor',
        'status' => 'active',
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'phone' => '+1234567890',
        'date_of_birth' => '1990-01-01',
        'gender' => 'woman',
    ]);

    $response->assertStatus(201);
    expect($response->json('user.email'))->toBe('new@example.com');
    expect($response->json('user.scope'))->toBe('vendor');
    expect($response->json('user.first_name'))->toBe('Jane');
    expect(User::count())->toBe(2);
});

test('superadmin can create a user', function () {
    $superadmin = User::factory()->create([
        'scope' => ScopeEnum::SUPERADMIN,
    ]);

    $response = $this->actingAs($superadmin)->postJson('/api/users', [
        'email' => 'new@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(201);
    expect($response->json('user.email'))->toBe('new@example.com');
});

test('admin can create a user with default scope and status', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $response = $this->actingAs($admin)->postJson('/api/users', [
        'email' => 'new@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(201);

    $created = User::where('email', 'new@example.com')->first();
    expect($created->scope)->toBe(ScopeEnum::USER);
    expect($created->status)->toBe('active');
});

test('admin can create a superadmin user', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $response = $this->actingAs($admin)->postJson('/api/users', [
        'email' => 'new@example.com',
        'password' => 'password123',
        'scope' => 'superadmin',
    ]);

    $response->assertStatus(201);
    expect($response->json('user.scope'))->toBe('superadmin');
});

test('create user requires a valid email', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $response = $this->actingAs($admin)->postJson('/api/users', [
        'email' => 'not-an-email',
        'password' => 'password123',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['email']);
});

test('create user requires a unique email', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $existing = User::factory()->create();

    $response = $this->actingAs($admin)->postJson('/api/users', [
        'email' => $existing->email,
        'password' => 'password123',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['email']);
});

test('create user requires a password of at least 8 characters', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $response = $this->actingAs($admin)->postJson('/api/users', [
        'email' => 'new@example.com',
        'password' => 'short',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['password']);
});

test('create user requires required fields', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $response = $this->actingAs($admin)->postJson('/api/users', []);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['email', 'password']);
});

test('create user rejects an invalid scope', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $response = $this->actingAs($admin)->postJson('/api/users', [
        'email' => 'new@example.com',
        'password' => 'password123',
        'scope' => 'root',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['scope']);
});

test('create user password is hashed', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $this->actingAs($admin)->postJson('/api/users', [
        'email' => 'new@example.com',
        'password' => 'password123',
    ])->assertStatus(201);

    $created = User::where('email', 'new@example.com')->first();
    expect($created->password)->not->toBe('password123');
    expect(\Illuminate\Support\Facades\Hash::check('password123', $created->password))->toBeTrue();
});
