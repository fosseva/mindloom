<?php

namespace App\Policies;

use App\Models\Deck;
use App\Models\User;

class DeckPolicy
{
    public function create(User $user): bool
    {
        return true;
    }

    public function view(User $user, Deck $deck): bool
    {
        return $deck->owner_id === $user->id;
    }

    public function update(User $user, Deck $deck): bool
    {
        return $this->view($user, $deck);
    }

    public function delete(User $user, Deck $deck): bool
    {
        return $this->view($user, $deck);
    }
}
