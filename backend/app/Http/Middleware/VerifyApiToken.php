<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Responsavel;

class VerifyApiToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Try user first
        $user = User::where('api_token', $token)->first();
        if ($user) {
            auth()->setUser($user);
            $request->merge(['auth_user' => $user, 'auth_type' => 'user']);
            return $next($request);
        }

        // Try responsavel
        $responsavel = Responsavel::where('api_token', $token)->first();
        if ($responsavel) {
            $request->merge(['auth_user' => $responsavel, 'auth_type' => 'responsavel']);
            return $next($request);
        }

        return response()->json(['message' => 'Unauthorized'], 401);
    }
}
