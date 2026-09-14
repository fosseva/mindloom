<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('remember_cards', function (Blueprint $table) {
            $table->foreignId('card_id')->primary()->constrained()->cascadeOnDelete();
            $table->text('question');
            $table->text('answer');
            $table->text('hint')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('remember_cards');
    }
};
