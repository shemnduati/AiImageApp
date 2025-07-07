<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\PaymentController;

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
    Route::post('/image/restore', [ImageController::class, 'restore']);
    Route::post('/image/recolor', [ImageController::class, 'recolor']);
    Route::post('/image/remove', [ImageController::class, 'remove']);

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

    // Payment routes
    Route::post('payment/create-payment-intent', [PaymentController::class, 'createPaymentIntent']);
        Route::post('payment/handel-payment-success', [PaymentController::class, 'handlePaymentSuccess']);
});