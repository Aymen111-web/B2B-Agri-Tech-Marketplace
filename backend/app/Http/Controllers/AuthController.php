<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new user and issue a Sanctum token.
     */
    public function register(Request $request): Response
    {
        $validated = $request->validate([
            'first_name'  => 'required|string|max:255',
            'second_name' => 'required|string|max:255',
            'phone'       => 'required|string|unique:users,phone',
            'email'       => 'nullable|email|unique:users,email',
            'password'    => 'required|string|min:8',
        ]);

        $user = User::create([
            'first_name'     => $validated['first_name'],
            'second_name'    => $validated['second_name'],
            'phone'          => $validated['phone'],
            'email'          => $validated['email'] ?? null,
            'password'       => Hash::make($validated['password']),
            'is_admin'       => false,
            'account_status' => 'active',
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response([
            'message' => 'Registration successful.',
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Authenticate a user and issue a Sanctum token.
     */
    public function login(Request $request): Response
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('phone', $validated['phone'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response([
                'error' => 'Invalid credentials.',
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response([
            'message' => 'Login successful.',
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Revoke the current access token.
     */
    public function logout(Request $request): Response
    {
        $request->user()->currentAccessToken()->delete();

        return response([
            'message' => 'Logged out successfully.',
        ]);
    }
}
