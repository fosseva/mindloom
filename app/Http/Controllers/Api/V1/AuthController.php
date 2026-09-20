<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use Illuminate\Auth\RequestGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function store(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->safe()->only(['email', 'password']), $request->boolean('remember'))) {
            throw ValidationException::withMessages(['email' => ['The provided credentials are incorrect.']]);
        }
        $request->session()->regenerate();

        return response()->json(['data' => $request->user()->only(['id', 'name', 'email'])]);
    }

    public function destroy(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $sanctumGuard = Auth::guard('sanctum');

        if ($sanctumGuard instanceof RequestGuard) {
            $sanctumGuard->forgetUser();
        }

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([], 204);
    }
}
