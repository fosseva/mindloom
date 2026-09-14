<?php

namespace App\Providers;

use App\Enums\SchedulerVersion;
use App\SpacedRepetition\Contracts\ReviewScheduler;
use App\SpacedRepetition\Fsrs6\Fsrs6Scheduler;
use App\SpacedRepetition\ReviewPolicy;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\ServiceProvider;
use LogicException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(ReviewPolicy::class, fn (): ReviewPolicy => new ReviewPolicy(
            desiredRetention: Config::float('reviews.policy.desired_retention'),
            forgotReviewAfterMinutes: Config::integer('reviews.policy.forgot_review_after_minutes'),
        ));

        $this->app->singleton(ReviewScheduler::class, function (Application $app): ReviewScheduler {
            return match (SchedulerVersion::tryFrom(Config::string('reviews.default_algorithm'))) {
                Fsrs6Scheduler::VERSION => $app->make(Fsrs6Scheduler::class),
                default => throw new LogicException('The configured spaced-repetition algorithm is not supported.'),
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
