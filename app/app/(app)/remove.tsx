import { View, Text, ScrollView, Alert, TextInput } from 'react-native';
import React, { useState } from 'react';
import Button from '@/components/core/Button';
import { useSession } from '@/context/AuthContext';
import axiosInstance from '@/config/axiosConfig';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';


import {
  ImageSelector,
  ImageComparison,
  FullScreenViewer,
  ImageActions,
  ProcessingOverlay,
  saveImageToGallery,
  requestMediaPermission
} from '@/components/images';

export default function Remove() {
  const { user, updateUser } = useSession();
  const colors = useThemeColors();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [currentFullscreenIndex, setCurrentFullscreenIndex] = useState(0);
  const [mediaPermission, setMediaPermission] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [targetObjects, setTargetObjects] = useState<string>('');

  

  const handleImageSelected = async () => {
    setGeneratedImage(null);
  };


  const handledUpload = async () => {
    if (!selectedImage) {
      Alert.alert('No Image Selected', 'Please select an image');
      return;
    }

    if (!targetObjects.trim()) {
      Alert.alert('Error', 'Please select target objects you want to remove');
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

    // Send the target object to be removed
    formData.append('prompt', targetObjects);
   
    try {
      const response = await axiosInstance.post('/api/image/remove', formData, {
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
              placeholder='Select am Image for generative fill' 
            />
            {selectedImage && (
              <View className='w-full'>
              {/* Target part input field */}
              <View className='flex-row items-center mb-3 mt-2'>
                <MaterialIcons name="edit" size={24} color={colors.primary} />
                <Text className='text-lg font-bold ml-2 text-gray-800 dark:text-white'>Specify Target Part</Text>
              </View>
              <View className='w-full mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border-gray-200 dark:border-gray-700'>
                <Text className='text-gray-700 dark:text-gray-300 mb-2'>
                  What objects do you want to remove from the image?
                </Text>
                <View className='bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 p-3'>
                    <TextInput
                      value={targetObjects}
                      onChangeText={setTargetObjects}
                      placeholder='e.g. skin, hair, person, power lines, etc.'
                      placeholderTextColor={colors.secondaryText}
                      className='text-gray-800 dark:text-white'
                  />
                </View>
                <Text className='text-gray-500 dark:text-gray-400 text-sm mt-2'>
                 AI will analyze the image and remove the specified objects while preserving the background
                </Text>
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
                        {isLoading ? 'Generating Fill' : 'Generate Fill'}
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