<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Reviews\RecordCardReviewAction;
use App\Enums\ReviewRating;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCardReviewRequest;
use App\Http\Resources\CardReviewResource;
use App\Models\Card;
use Carbon\CarbonImmutable;

class CardReviewController extends Controller
{
    public function store(StoreCardReviewRequest $request, Card $card, RecordCardReviewAction $action): CardReviewResource
    {
        $reviewedAt = isset($request->validated()['reviewed_at']) ? CarbonImmutable::parse($request->validated()['reviewed_at']) : CarbonImmutable::now();
        $review = $action($request->user(), $card, ReviewRating::from($request->integer('rating')), $reviewedAt, $request->validated('duration_ms'));

        return new CardReviewResource($review->load('learningRecord'));
    }
}
