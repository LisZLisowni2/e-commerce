<?php

use App\Models\User;
use App\ScopeEnum;

test('unauthenticated user cannot list users', function () {
    User::factory(3)->create();

    $response = $this->getJson('/api/users');

    $response->assertStatus(401);
});

test('user role cannot list users', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::USER,
    ]);

    $response = $this->actingAs($user)->getJson('/api/users');

    $response->assertStatus(403);
});

test('admin can list users', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    User::factory(3)->create();

    $response = $this->actingAs($admin)->getJson('/api/users');

    $response->assertStatus(200);
    expect(count($response->json('users')))->toBe(4);
});

test('admin can list paginated users', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    User::factory(25)->create();

    $page1 = $this->actingAs($admin)->getJson('/api/users?paginated=true&page=1');

    $page1->assertStatus(200);
    $page1->assertJsonPath('users.current_page', 1);
    $page1->assertJsonPath('users.per_page', 20);
    $page1->assertJsonPath('users.total', 26);
    expect(count($page1->json('users.data')))->toBe(20);

    $page2 = $this->actingAs($admin)->getJson('/api/users?paginated=true&page=2');

    $page2->assertStatus(200);
    $page2->assertJsonPath('users.current_page', 2);
    expect(count($page2->json('users.data')))->toBe(6);
});

test('admin can search users by email', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
        'email' => 'admin@example.com',
    ]);

    User::factory()->create(['email' => 'rtx@gaming.com']);
    User::factory()->create(['email' => 'macbook@example.com']);
    User::factory()->create(['email' => 'laptop@example.com']);

    $response = $this->actingAs($admin)->getJson('/api/users?search_query=rtx');

    $response->assertStatus(200);
    expect($response->json('users'))->toHaveCount(1);
    expect($response->json('users.0.email'))->toBe('rtx@gaming.com');
});

test('paginated users can be filtered by search query', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
        'email' => 'admin@example.com',
    ]);

    foreach (range(1, 21) as $i) {
        User::factory()->create(['email' => "macbook{$i}@example.com"]);
    }
    User::factory()->create(['email' => 'rtx@gaming.com']);

    $response = $this->actingAs($admin)->getJson('/api/users?search_query=macbook&paginated=true');

    $response->assertStatus(200);
    $response->assertJsonPath('users.total', 21);
    expect(count($response->json('users.data')))->toBe(20);
});

test('user search query is case-insensitive', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
        'email' => 'admin@example.com',
    ]);

    User::factory()->create(['email' => 'RTX@GAMING.COM']);
    User::factory()->create(['email' => 'macbook@example.com']);

    $response = $this->actingAs($admin)->getJson('/api/users?search_query=rtx');

    $response->assertStatus(200);
    expect($response->json('users'))->toHaveCount(1);
    expect($response->json('users.0.email'))->toBe('RTX@GAMING.COM');
});

test('user search query returns an empty list when nothing matches', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
        'email' => 'admin@example.com',
    ]);

    User::factory()->create(['email' => 'rtx@gaming.com']);

    $response = $this->actingAs($admin)->getJson('/api/users?search_query=nonexistent');

    $response->assertStatus(200);
    expect($response->json('users'))->toHaveCount(0);
});

test('user search query treats % and _ as literal characters', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
        'email' => 'admin@example.com',
    ]);

    User::factory()->create(['email' => '100%cash@example.com']);
    User::factory()->create(['email' => '100percentcash@example.com']);
    User::factory()->create(['email' => 'gaming_ultra@example.com']);
    User::factory()->create(['email' => 'gamingultra@example.com']);

    $response = $this->actingAs($admin)->getJson('/api/users?search_query=100%25');
    $response->assertStatus(200);
    expect($response->json('users'))->toHaveCount(1);
    expect($response->json('users.0.email'))->toBe('100%cash@example.com');

    $response = $this->actingAs($admin)->getJson('/api/users?search_query=gaming_ultra');
    $response->assertStatus(200);
    expect($response->json('users'))->toHaveCount(1);
    expect($response->json('users.0.email'))->toBe('gaming_ultra@example.com');
});

test('superadmin can list users', function () {
    $superadmin = User::factory()->create([
        'scope' => ScopeEnum::SUPERADMIN,
    ]);

    $response = $this->actingAs($superadmin)->getJson('/api/users');

    $response->assertStatus(200);
    expect(count($response->json('users')))->toBe(1);
});

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
