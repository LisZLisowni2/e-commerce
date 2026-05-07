<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
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
