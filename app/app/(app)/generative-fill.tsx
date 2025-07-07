import { View, Text, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import Button from '@/components/core/Button';
import { useSession } from '@/context/AuthContext';
import axiosInstance from '@/config/axiosConfig';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import AspectRatioSelector, { AspectRatio } from '@/components/app/AspectRatioSelector';

import {
  ImageSelector,
  ImageComparison,
  FullScreenViewer,
  ImageActions,
  ProcessingOverlay,
  saveImageToGallery,
  requestMediaPermission
} from '@/components/images';

export default function GenerativeFill() {
  const { user, updateUser } = useSession();
  const colors = useThemeColors();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [currentFullscreenIndex, setCurrentFullscreenIndex] = useState(0);
  const [mediaPermission, setMediaPermission] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<string>('1:1');

  
  const ASPECT_RATIOS: AspectRatio[] = [
    { value: '1:1', width: 40, height:40 },
    { value: '4:3', width: 40, height:30 },
    { value: '16:9', width: 48, height:27 },
  ];

  const handleImageSelected = async () => {
    setGeneratedImage(null);
  };


  const handledUpload = async () => {
    if (!selectedImage) {
      Alert.alert('No Image Selected', 'Please select an image');
      return;
    }

    setIsLoading(true);

    // create form data with proper typing for react native
    const formData = new FormData();
    // @ts-ignore - React Native's FormData implementation accepts this object structure
    formData.append('image', {
      uri: selectedImage,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    // Add aspect ratio to form data
    formData.append('aspectRatio', selectedRatio);

    try {
      const response = await axiosInstance.post('/api/image/fill', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

       if(response.status === 200){
         Alert.alert('Success', 'Image transformed successfully');
         setGeneratedImage(response.data.transformed_url);

         // update user credits if available in the response
         if (user && response.data.credits) {
           const updatedUser = {
             ...user,
             credits: response.data.credits,
           };
           await updateUser(updatedUser);
         }
        }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to generate image');
      } else {
        console.error('Error', error);
        Alert.alert('Error', 'Failed to generate fill');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save image to device
  const handleSaveImage = async () => {
    if (!generatedImage) return;

    try {
      setSavingImage(true);

      // Check for permission
      if (!mediaPermission) {
        const hasPermission = await requestMediaPermission();
        if (!hasPermission) return;
        setMediaPermission(true);
      }

      // Save the  image to the device
      await saveImageToGallery(
        generatedImage,
        'generative-fill-image.jpg',
        'AI Generated Images'
      )
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image');
    } finally {
      setSavingImage(false);
    }
  };

    return (
      <>
        <Stack.Screen
          options={{
            title: 'Generative Fill',
            headerTintColor: colors.text,
            headerStyle: { backgroundColor: colors.background },
          }}
        />
        <ScrollView className='flex-1 bg-white dark:bg-gray-900'>
          <View className='flex-1 items-center justify-center p-4'>
            <ImageSelector
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              onImageSelected={handleImageSelected}
              placeholder='Select an Image for generative fill' 
            />
            {selectedImage && (
              <View className='w-full'>
                {/* Aspect Ratio Selection */}
                <View className='flex-row items-center mb-3 mt-2'>
                  <MaterialIcons name='aspect-ratio' size={24} color={colors.primary} />
                  <Text className='text-lg font-bold ml-2 text-gray-800 dark:text-white'>Select Aspect Ratio</Text>
                </View>
                <View className='w-full mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border-gray-200 dark:border-gray-700'>
                  <AspectRatioSelector
                    ratios={ASPECT_RATIOS}
                    selectedRatio={selectedRatio}
                    onSelectRatio={setSelectedRatio}
                  />
                  <Text className='text-gray-500 dark:text-gray-400 text-xs mt-2'>Select the aspect ratio for your generated image.</Text>
                </View>
                {generatedImage && (
                  <ImageComparison
                    originalImage={selectedImage}
                    processedImage={generatedImage}
                    onFullScreenRequest={(index) => {
                      setCurrentFullscreenIndex(index);
                      setFullscreenVisible(true);
                    }}
                  />
                )}
                  <Button
                    onPress={handledUpload}
                    className='w-full mt-2'
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    <View className='flex-row items-center justify-center'>
                      <MaterialIcons name="auto-fix-high" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text className='text-white text-center font-medium'>
                        {isLoading ? 'Generating Fill...' : 'Generate Fill'}
                      </Text>
                    </View>
                  </Button>
              </View>
            )}
            
            <ProcessingOverlay
              visible={isLoading}
              message='Applying AI magic...'
            />
          </View>
        </ScrollView>

        {/* FullScreen image viewer  */}
         <FullScreenViewer
            visible={fullscreenVisible}
            onClose={() => setFullscreenVisible(false)}
            originalImage={selectedImage}
            processedImage={generatedImage}
            initialPage={currentFullscreenIndex}
            processedLabel="AI Generated"
            onSave={handleSaveImage}
            savingImage={savingImage}
        />
      </>
    );
  
}