import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";


interface ProcessingOverlayProps {
    visible: boolean;
    message?: string;
}

export default function ProcessingOverlay({ 
    visible,
    message = 'Processing...',
}: ProcessingOverlayProps) {
    const colors = useThemeColors();
    if (!visible) return null;
    
    return (
        <View className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl">
            <ActivityIndicator size="small" color={colors.primary} />
            <Text className="ml-3 text-gray-700 dark:text-gray-300">{message}</Text>
        </View>
    );
 }
