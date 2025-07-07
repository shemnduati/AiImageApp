import React, { useState, useEffect } from "react";
import { View, Text, Alert, TouchableOpacity, Image, Dimensions } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColors } from "@/hooks/useThemeColors";

const { width } = Dimensions.get('window');

interface ImageSelectorProps {
    selectedImage: string | null;
    setSelectedImage: (uri: string | null) => void;
    onImageSelected?: () => void;
    placeholder?: string;

}

export default function ImageSelector({
    selectedImage,
    setSelectedImage,
    onImageSelected,
    placeholder = 'Select and Image to process  with Ai' }: ImageSelectorProps) {
    const colors = useThemeColors();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const pickImage = async () => {
        if (hasPermission !== true) {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission not granted', 'We need access to your photos to process Images');
                return;
            }
            setHasPermission(true);
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            if (onImageSelected) {
                onImageSelected();
            }
        }
    };

     if (!selectedImage) {
        return (
            <TouchableOpacity
                onPress={pickImage}
                activeOpacity={0.7}
                className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center 
                bg-gray-50 dark:bg-gray-800"
            >
                <MaterialIcons name="add-photo-alternate" size={24} color={colors.primary} />
                <Text className="text-gray-600 dark:text-gray-300 text-lg font-medium mt-4">Choose Image</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm mt-2 text-center px-6">{placeholder}</Text>
            </TouchableOpacity>
        ); 
    };
    
    return (
        <>
            <View className="flex-row items-center mb-3">
                <MaterialIcons name="image" size={24} color={colors.primary} />
                <Text className="text-lg font-bold ml-2 text-gray-800 dark:text-white">Original Image</Text>
            </View>
            <View className="relative w-full rounded-xl overflow-hidden mb-6 border border-gray-200 dark:border-gray-700">
                <Image
                    source={{ uri: selectedImage }}
                    style={{ width: '100%', height: width * 0.7 }}
                    resizeMode="cover"
                />
                <TouchableOpacity
                    onPress={() => {
                        setSelectedImage(null)
                    }}
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
                >
                    <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </>
    );
}