<?php

namespace App\Policies;

use App\Models\Card;
use App\Models\Deck;
use App\Models\User;

class CardPolicy
{
    public function create(User $user, Deck $deck): bool
    {
        return $deck->user_id === $user->id;
    }

    public function view(User $user, Card $card): bool
    {
        return $card->deck->user_id === $user->id;
    }

    public function update(User $user, Card $card): bool
    {
        return $this->view($user, $card);
    }

    public function delete(User $user, Card $card): bool
    {
        return $this->view($user, $card);
    }

    public function review(User $user, Card $card): bool
    {
        return $this->view($user, $card);
    }
}
