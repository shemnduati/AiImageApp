import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useSession } from "@/context/AuthContext";
import paymentService from '../services/PaymentService';

export const useCredits = () => {
    const { user, UpdateUser } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<null | { credits: number, price: number }>(null);
    const {initPaymentSheet, presentPaymentSheet } = useStripe();

    // Initialize payment sheet
    const initializePaymentSheet = useCallback(async (credits: number, price: number) => {
        try {
            const { paymentIntent, ephemeralKey, customer } = await paymentService.fetchPaymentSheetParams(credits, price);
            const { error } = await initPaymentSheet({
                merchantDisplayName: 'Image Processing App',
                customerId: customer,
                customerEphemeralKeySecret: ephemeralKey,
                paymentIntentClientSecret: paymentIntent,
                allowsDelayedPaymentMethods: false,
                style: "automatic",
                returnURL: 'image-processor://stripe-redirect',
            });
            
            if (error) {
                console.error('Error initializing payment sheet:', error);
                Alert.alert('Error', error.message);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Payment setup error:', error);
            Alert.alert('Error', 'Failed to set up payment. Please try again.');
            return false;
        }
    }, [initPaymentSheet]);

    // Handle the purchase process
    const handlePurchase = useCallback(async (credits: number, price: number) => { 
        if (isLoading) return;
        
        try {
            setIsLoading(true);
            setSelectedPackage({ credits, price });

            const initialized = await initializePaymentSheet(credits, price);
            
            if (!initialized) {
                setIsLoading(false)
                return;
            }
            // Present payment sheet
            const { error } = await presentPaymentSheet();

            if (error) {
                if (error.code == 'Canceled') {
                    console.log('User canceled the payment');
                } else {
                    Alert.alert('Error', error.message);
                }
                setSelectedPackage(null);
                return;
            }

            // payment successful - process with backend 
            const result = await paymentService.handlePaymentSuccess();


            if (result.success) {
                try {
                    if (user) {
                        // Create a new user object with updated credits
                        const updatedUser = {
                            ...user,
                            credits: result.credits
                        }

                        // Update the user in context
                        await UpdateUser(updatedUser);
                        // Show success message
                        Alert.alert('Success', `Successfully added ${result.credits_added} credits to your account!`);
                    } else {
                        // if user is null, fetch the latest user data
                        const userData = await paymentService.fetchUserData();
                        if (userData) {
                            await UpdateUser(userData);
                            Alert.alert('Success', `Successfully added ${result.credits_added} credits to your account!`);
                        }
                    }
                } catch (updateError) {
                    console.error('Error updating user:', updateError);
                    throw new Error('Failed to update user credits');
                }
            } else {
                Alert.alert('Error', result.error || 'Failed to process payment');
            }
        } catch (error) {
            console.error('Payment error:', error);
            Alert.alert('Error', 'Failed to complete payment. Please try again.');
        } finally {
            setIsLoading(false);
            setSelectedPackage(null);
        }
    }, [isLoading, initializePaymentSheet, presentPaymentSheet, user, UpdateUser]);


    return {
        user,
        isLoading,
        selectedPackage,
        handlePurchase
    }
};