<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePasswordRequest;
use Illuminate\Http\JsonResponse;

class CurrentUserPasswordController extends Controller
{
    public function update(UpdatePasswordRequest $request): JsonResponse
    {
        $request->user()->update(['password' => $request->validated('password')]);

        return response()->json([], 204);
    }
}
