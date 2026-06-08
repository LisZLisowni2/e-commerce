<?php

namespace App\Http\Middleware;

use App\ScopeEnum;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ScopeMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ScopeEnum $requiredScope): Response
    {
        if ($request->user()->scope != $requiredScope) {
            return response()->json([
                'Unauthorized access to this resource.'
            ], 403);
        }
        return $next($request);
    }
}
