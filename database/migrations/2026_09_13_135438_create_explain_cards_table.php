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
        Schema::create('explain_cards', function (Blueprint $table) {
            $table->foreignId('card_id')->primary()->constrained()->cascadeOnDelete();
            $table->text('prompt');
            $table->text('explanation');
            $table->text('key_points')->nullable();
            $table->text('example')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('explain_cards');
    }
};
