<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Reviews\RecordCardReviewAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCardReviewRequest;
use App\Http\Resources\CardReviewResource;
use App\Models\Card;
use App\Models\Rating;
use Carbon\CarbonImmutable;

class CardReviewController extends Controller
{
    public function store(StoreCardReviewRequest $request, Card $card, RecordCardReviewAction $action): CardReviewResource
    {
        $reviewedAt = isset($request->validated()['reviewed_at']) ? CarbonImmutable::parse($request->validated()['reviewed_at']) : CarbonImmutable::now();
        $rating = Rating::findOrFail($request->integer('rating_id'));
        $review = $action($request->user(), $card, $rating, $reviewedAt, $request->validated('duration_ms'));

        return new CardReviewResource($review->load(['learningRecord', 'rating']));
    }
}
