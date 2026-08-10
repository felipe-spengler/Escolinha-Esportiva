<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Responsavel;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $email = $request->email;
        $password = $request->password;

        // Try User first (Admin / Professor)
        $user = User::where('email', $email)->first();
        if ($user && Hash::check($password, $user->password)) {
            $token = Str::random(60);
            $user->update(['api_token' => $token]);
            return response()->json([
                'token' => $token,
                'role' => $user->role,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]
            ]);
        }

        // Try Responsavel next (Parent)
        $responsavel = Responsavel::where('email', $email)->first();
        if ($responsavel && Hash::check($password, $responsavel->password)) {
            $token = Str::random(60);
            $responsavel->update(['api_token' => $token]);
            return response()->json([
                'token' => $token,
                'role' => 'responsavel',
                'user' => [
                    'id' => $responsavel->id,
                    'name' => $responsavel->name,
                    'email' => $responsavel->email,
                ]
            ]);
        }

        return response()->json(['message' => 'Credenciais inválidas'], 401);
    }

    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        if ($token) {
            User::where('api_token', $token)->update(['api_token' => null]);
            Responsavel::where('api_token', $token)->update(['api_token' => null]);
        }
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        $auth_user = $request->get('auth_user');
        $auth_type = $request->get('auth_type');

        return response()->json([
            'role' => $auth_type === 'user' ? $auth_user->role : 'responsavel',
            'user' => [
                'id' => $auth_user->id,
                'name' => $auth_user->name,
                'email' => $auth_user->email,
            ]
        ]);
    }
}
