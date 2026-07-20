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
    public function handle(Request $request, Closure $next, string ...$requiredScopes): Response
    {
        if ($request->user()->scope === ScopeEnum::SUPERADMIN) {
            return $next($request);
        }

        $userScope = $request->user()->scope;
        $allowedScopes = array_map(fn (string $scope) => ScopeEnum::tryFrom($scope), $requiredScopes);
        $allowedScopes = array_filter($allowedScopes);

        if (in_array($userScope, $allowedScopes)) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Unauthorized access to this resource.'
        ], 403);
    }
}
