<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ImageController;

Route::middleware("guest")->group(
    callback: function (): void {
        Route::post('/signup', [RegisteredUserController::class, 'store'])
            ->middleware('guest')
            ->name('signup');

        Route::post('/login', [AuthenticatedSessionController::class, 'store'])
            ->middleware('guest')
            ->name('login');
    }
);

Route::middleware(['auth:sanctum'])
     ->group(callback: function (): void {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    Route::get('/user', function (Request $request): mixed {
        return $request->user();
    });

    Route::get('/operations/credits', function () {
        return response()->json([
            'operations' => \App\Enums\OperationEnum::listOfCredits(),
        ]);
    });

    Route::post('/image/fill', [ImageController::class, 'fill']);

    Route::get('/image/latest-operations', [
        ImageController::class,
        'getLatestOperations'
    ]);

    Route::get('/image/operation/{id}',
    [ImageController::class, 'getOperation']);

    Route::delete('/image/operation/{id}', [
        ImageController::class,
        'deleteOperation'
    ]);
});