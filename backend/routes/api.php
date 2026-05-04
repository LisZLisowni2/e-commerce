<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get("/geo", function(Request $request) {
    Log::info("Geo triggered");
    Log::info($request->headers->all());

    return response()->json([
        "country" => $request->header("X-Country-Code") ?? "US",
    ]);
});
