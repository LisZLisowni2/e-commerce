<?php

use Stevebauman\Location\Facades\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get("/geo", function(Request $request) {
    $position = Location::get($request->ip());

    return response()->json([
        "country" => $position?->countryCode ?? "US",
    ]);
});
