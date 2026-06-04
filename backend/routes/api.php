<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Stevebauman\Location\Facades\Location;

Route::middleware(['auth:sanctum'])->group(function () {    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/user', [AuthController::class, 'user']);
});

Route::get("/geo/{ip}", function(Request $request, string $ip) {
    Log::debug("Geo triggered");

    return response()->json([
        "country" => Location::get($ip)->countryCode ?? "US",
    ]);
});

Route::get("/products", [ProductController::class, "index"]);

Route::get("/image/{path}", function(string $path) {
    if (!Storage::disk('minio')->exists($path)) {
        return response()->json(['message' => 'Image not found'], 404);
    }

    return Storage::disk("minio")->get("". $path);
});

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);

// Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
//     ->name('password.email');

// Route::post('/reset-password', [NewPasswordController::class, 'store'])
//     ->name('password.store');

// Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
//     ->middleware(['auth', 'signed', 'throttle:6,1'])
//     ->name('verification.verify');

// Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
//     ->middleware(['auth', 'throttle:6,1'])
//     ->name('verification.send');