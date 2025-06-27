<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Customer;
use Stripe\EphemeralKey;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class PaymentController extends Controller
{
    // Create payment stripe_payment_intent_id
    public function createPaymentIntent(Request $request)
    {
        $request->validate(
            [
            'credits' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0'
            ]);
        Stripe::setApiKey(config('services.stripe.secret'));
        
        try {
            //  Convert dollar amount to cents for stripe
            $amountInCents = (int)($request->price * 100);

            // Get or create  customer
            $customer = Customer::create([
                'email' => auth()->user()->email,
                'name' => auth()->name,
            ]);

            // Create ephemeral key for the customer
            $ephemeralKey = EphemeralKey::create(
                ['customer' => $customer->id],
                ['stripe_version' => $request->header('Stripe-Version')]
            );

            // Create payment intent with actual amount
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => 'usd',
                'customer' => $customer->id,
                'automatic_payment_methods' => ['enabled' => true],
                'metadata' => [
                   ' credits_amount' => $request->credits,
                   'user_id' => auth()->id(),
                ]
            ]);

            // Create transaction record
            Transaction::create([
                'user_id' => auth()->id(),
                'stripe_payment_intent_id' => $paymentIntent->id,
                'credits_amount' => $request->credits,
                'amount_paid' => $request->price,
                'currency' => 'usd',
                'status' => 'pending'
            ]);

            return response()->json([
                'PaymentIntent' => $paymentIntent->client_secret,
                'ephemeralKey' => $ephemeralKey->secret,
                'customer' => $customer->id,
                'publishableKey' => config('service.stripe.key'),
                'paymentIntentId' => $paymentIntent->id
            ]);

        } catch (\Exception $e) {
            //throw $e
            Log::error($e);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Handle successful payment webhook
     */

     public function handlePaymentSuccess(Request $request)
     {
        try {
            $paymentIntentId = $request->input('payment_intent');

            // Update transaction status and add credits to user
            $transaction = Transaction::where('stripe_payment_intent_id', $paymentIntentId)
                ->where('status', 'pending')
                ->first();
            
            if ($transaction) {
                //  Update transaction
                $transaction->status = 'completed',
                $transaction->save();
                
                //  Add credits to user
                $user = $transaction->user;
                $user->credits += $transaction->credits_amount;
                $user->save();

                // Return the response
                return response()->json([
                    'success' => true,
                    'credits' => $user->credits,
                    'credits_added' => $transaction->credits_amount
                ]);
            }

        return response()->json(['error' => 'Transaction not found'], 404);


        } catch (\Exception $e) {
            //throw $e;
            Log::error($e);

            return response()->json(['error' => $e->getMessage()], 500);
        }
     }
}
