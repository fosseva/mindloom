<?php

use App\Http\Controllers\Api\V1\CardController;
use App\Http\Controllers\Api\V1\CardReviewController;
use App\Http\Controllers\Api\V1\DeckController;
use App\Http\Controllers\Api\V1\DueCardController;
use App\Http\Controllers\Api\V1\SessionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('session', [SessionController::class, 'store'])->middleware('guest')->name('session.store');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('session', [SessionController::class, 'show'])->name('session.show');
        Route::delete('session', [SessionController::class, 'destroy'])->name('session.destroy');
        Route::get('cards/due', DueCardController::class)->name('cards.due');
        Route::apiResource('decks', DeckController::class);
        Route::apiResource('decks.cards', CardController::class)->shallow()->only(['index', 'store', 'show', 'update', 'destroy']);
        Route::post('cards/{card}/reviews', [CardReviewController::class, 'store'])->name('cards.reviews.store');
    });
});
