<?php

namespace App\Http\Includes;

use App\Models\Card;
use App\Models\LearningRecord;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\Includes\IncludeInterface;

/** @implements IncludeInterface<Card> */
class ViewerLearningRecordInclude implements IncludeInterface
{
    public function __construct(private readonly int $userId) {}

    public function __invoke(Builder $query, string $include): void
    {
        $query->afterQuery(function (Collection $cards): void {
            if ($cards->isEmpty()) {
                return;
            }

            $learningRecords = LearningRecord::query()
                ->where('user_id', $this->userId)
                ->whereIn('card_id', $cards->modelKeys())
                ->get()
                ->keyBy('card_id');

            foreach ($cards as $card) {
                $card->setRelation('viewerLearningRecord', $learningRecords->get($card->getKey()));
            }
        });
    }
}
