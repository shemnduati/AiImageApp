import axiosInstance from "@/config/axiosConfig";
import { Alert } from "react-native";

interface PaymentSheetParams {
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
}

export interface PaymentResult {
    success: boolean;
    credits?: number;
    credits_added?: number;
    error?: string;
}


class PaymentService {
    private paymentIntentId: string = ' ';
    /*
    *  PaymentIntent is a unique identifier for a payment
   */
    
    async fetchPaymentSheetParams(credits:number, price:number):
        Promise<PaymentSheetParams> {
         try {
             const response = await axiosInstance.post('/api/payment/create-payment-intent', {
                 credits,
                 price,
             }, {
                 headers: {
                     'Stripe-version': '2022-11-15',
                 }
             });


             //  Store payment intent identifier
             if (response.data.paymentIntentId) {
                 this.paymentIntentId = response.data.paymentIntentId;
             } else if (response.data.paymentIntent) {
                 //  Extract ID from client secret if needed
                 const clientSecret = response.data.paymentIntent;
                 const parts = clientSecret.split('_secret_');
                 if (parts.length > 0) {
                     this.paymentIntentId = parts[0];
                 }
             }


             return {
                 paymentIntent: response.data.paymentIntent,
                 ephemeralKey: response.data.ephemeralKey,
                 customer: response.data.customer,
             }
         } catch (error) {
             console.error('Error fetching payment intent:', error);
             throw error;
         }
    }
    
    /**
     * Get the stored payment intent ID
    */
    getPaymentIntentId(): string {
        return this.paymentIntentId;
    }

    /**
     * Handle payment success by confirming with the backend 
     */
    
    async handlePaymentSuccess(): Promise<PaymentResult>{
        try {
            const response = await axiosInstance.post('/api/payment/handle-payment-success', {
                payment_intent: this.paymentIntentId
            });
            console.info(response);

            if (response.data.success) {
                return {
                    success: true,
                    credits: response.data.credits,
                    credits_added: response.data.credits_added,
                }
            } else{
                return {
                    success: false,
                    error: 'Failed to process payment'
                }
                
            }
        } catch (error) {
            console.error('Failed to process payment confirmation:', error);
            return {
                success: false,
                error: 'Payment was successful but failed to process confirmation.'
            }
        }
    }

    /**
     * Retrieve updated user data from the  backend
     */

    async fetchUserData() {
       try {
           const userResponse = await axiosInstance.get('/api/user');
           return userResponse.data;
       } catch (error) {
           console.error('Error fetching user data:', error);
           throw error;
       } 
    }

}

//  Export as single instance 
export default new PaymentService();