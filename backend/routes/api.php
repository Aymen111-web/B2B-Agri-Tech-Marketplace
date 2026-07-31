<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CapabilityApplicationController;
use App\Http\Controllers\CartItemController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderFulfillmentController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PayoutController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::get('/users/me', [UserController::class, 'me']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    Route::post('/users/{id}/restore', [UserController::class, 'restore']);
    Route::get('/users/{user}/status', [UserController::class, 'status']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/with-listing-count', [CategoryController::class, 'withListingCount']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    Route::get('/listings', [ListingController::class, 'index']);
    Route::get('/listings/available', [ListingController::class, 'available']);
    Route::get('/listings/farmer/{farmerId}', [ListingController::class, 'farmerListings']);
    Route::get('/listings/{listing}', [ListingController::class, 'show']);
    Route::post('/listings', [ListingController::class, 'store']);
    Route::put('/listings/{listing}', [ListingController::class, 'update']);
    Route::delete('/listings/{listing}', [ListingController::class, 'destroy']);
    Route::get('/listings/{listing}/price-history', [ListingController::class, 'priceHistory']);

    Route::get('/cart', [CartItemController::class, 'index']);
    Route::post('/cart', [CartItemController::class, 'store']);
    Route::get('/cart/{cartItem}', [CartItemController::class, 'show']);
    Route::put('/cart/{cartItem}', [CartItemController::class, 'update']);
    Route::delete('/cart/{cartItem}', [CartItemController::class, 'destroy']);
    Route::delete('/cart', [CartItemController::class, 'clear']);
    Route::get('/cart/grouped', [CartItemController::class, 'grouped']);
    Route::get('/cart/breakdown', [CartItemController::class, 'breakdown']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/history', [OrderController::class, 'history']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::put('/orders/{order}', [OrderController::class, 'update']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::get('/orders/{order}/fulfillments', [OrderController::class, 'fulfillments']);
    Route::get('/orders/{order}/items', [OrderController::class, 'items']);
    Route::get('/orders/{order}/payment', [OrderController::class, 'payment']);

    Route::get('/fulfillments', [OrderFulfillmentController::class, 'index']);
    Route::get('/fulfillments/pending', [OrderFulfillmentController::class, 'pending']);
    Route::get('/fulfillments/summary', [OrderFulfillmentController::class, 'summary']);
    Route::get('/fulfillments/{fulfillment}', [OrderFulfillmentController::class, 'show']);
    Route::post('/fulfillments/{fulfillment}/accept', [OrderFulfillmentController::class, 'accept']);
    Route::post('/fulfillments/{fulfillment}/reject', [OrderFulfillmentController::class, 'reject']);
    Route::post('/fulfillments/{fulfillment}/complete', [OrderFulfillmentController::class, 'complete']);
    Route::get('/fulfillments/{fulfillment}/items', [OrderFulfillmentController::class, 'items']);

    Route::get('/payments/orders/{order}', [PaymentController::class, 'show']);
    Route::post('/payments/orders/{order}/initiate', [PaymentController::class, 'initiate']);
    Route::get('/payments/orders/{order}/checkout-url', [PaymentController::class, 'checkoutUrl']);
    Route::get('/payments/orders/{order}/status', [PaymentController::class, 'status']);
    Route::get('/payments/orders/{order}/webhook-events', [PaymentController::class, 'webhookEvents']);
    Route::post('/payments/orders/{order}/exceptions', [PaymentController::class, 'raiseException']);
    Route::get('/payments/orders/{order}/exceptions', [PaymentController::class, 'exceptions']);
    Route::get('/payments/exceptions', [PaymentController::class, 'allExceptions']);
    Route::put('/payments/exceptions/{exception}', [PaymentController::class, 'updateException']);

    Route::get('/payouts', [PayoutController::class, 'index']);
    Route::get('/payouts/summary', [PayoutController::class, 'summary']);
    Route::get('/payouts/pending', [PayoutController::class, 'pending']);
    Route::get('/payouts/processed', [PayoutController::class, 'processed']);
    Route::post('/payouts', [PayoutController::class, 'store']);
    Route::get('/payouts/{payout}', [PayoutController::class, 'show']);
    Route::put('/payouts/{payout}/status', [PayoutController::class, 'updateStatus']);
    Route::get('/payouts/history', [PayoutController::class, 'history']);
    Route::get('/payouts/monthly-report', [PayoutController::class, 'monthlyReport']);

    Route::get('/capability-applications', [CapabilityApplicationController::class, 'index']);
    Route::post('/capability-applications', [CapabilityApplicationController::class, 'store']);
    Route::get('/capability-applications/my', [CapabilityApplicationController::class, 'myApplications']);
    Route::get('/capability-applications/pending', [CapabilityApplicationController::class, 'pending']);
    Route::get('/capability-applications/{application}', [CapabilityApplicationController::class, 'show']);
    Route::post('/capability-applications/{application}/approve', [CapabilityApplicationController::class, 'approve']);
    Route::post('/capability-applications/{application}/reject', [CapabilityApplicationController::class, 'reject']);
});
