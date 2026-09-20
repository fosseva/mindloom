<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CardController;
use App\Http\Controllers\Api\V1\CardReviewController;
use App\Http\Controllers\Api\V1\CardTypeController;
use App\Http\Controllers\Api\V1\CurrentUserController;
use App\Http\Controllers\Api\V1\CurrentUserPasswordController;
use App\Http\Controllers\Api\V1\DeckController;
use App\Http\Controllers\Api\V1\DueCardController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('login', [AuthController::class, 'store'])->middleware('guest')->name('login');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('user', [CurrentUserController::class, 'show'])->name('user.show');
        Route::patch('user', [CurrentUserController::class, 'update'])->name('user.update');
        Route::put('user/password', [CurrentUserPasswordController::class, 'update'])->name('user.password.update');
        Route::delete('logout', [AuthController::class, 'destroy'])->name('logout');
        Route::get('cards/due', DueCardController::class)->name('cards.due');
        Route::get('card-types', [CardTypeController::class, 'index'])->name('card-types.index');
        Route::apiResource('decks', DeckController::class);
        Route::apiResource('decks.cards', CardController::class)->shallow()->only(['index', 'store', 'show', 'update', 'destroy']);
        Route::post('cards/{card}/reviews', [CardReviewController::class, 'store'])->name('cards.reviews.store');
    });
});
