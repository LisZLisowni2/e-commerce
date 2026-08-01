<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/', function () {
    return response()->json(['Laravel' => App::version()]);
});

Route::get('/image/{path}', function ($path) {
    if (! Storage::exists($path)) {
        abort(404);
    }

    return Storage::response($path);
});

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'show']);
    Route::put('/user/email', [AuthController::class, 'updateEmail']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    Route::put('/user/personal', [AuthController::class, 'updatePersonal']);

    Route::apiResource('addresses', AddressController::class);

    Route::middleware('scope:admin,superadmin')->group(function () {
        Route::post("/categories", [CategoryController::class, 'store']);
        Route::put("/categories/{category}", [CategoryController::class, 'update']);
        Route::delete("/categories/{category}", [CategoryController::class, 'destroy']);
    });

    Route::middleware('scope:admin,vendor,superadmin')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    });

    Route::middleware('scope:admin,superadmin')->group(function () {
        Route::apiResource('users', UserController::class);
    });
});
