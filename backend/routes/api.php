<?php

use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Stevebauman\Location\Facades\Location;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
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
