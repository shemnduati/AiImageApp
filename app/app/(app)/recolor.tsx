import { View, Text, ScrollView, Alert, TouchableOpacity, Modal, TextInput, Dimensions } from 'react-native';
import React, { useState } from 'react';
import Button from '@/components/core/Button';
import { useSession } from '@/context/AuthContext';
import axiosInstance from '@/config/axiosConfig';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import ColorPicker from 'react-native-wheel-color-picker';


import {
  ImageSelector,
  ImageComparison,
  FullScreenViewer,
  ImageActions,
  ProcessingOverlay,
  saveImageToGallery,
  requestMediaPermission
} from '@/components/images';

const { width } = Dimensions.get('window')

export default function Recolor() {
  const { user, updateUser } = useSession();
  const colors = useThemeColors();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#FF5733');
  const [isLoading, setIsLoading] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [currentColor, setCurrentColor] = useState('#FF5733');
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [currentFullscreenIndex, setCurrentFullscreenIndex] = useState(0);
  const [mediaPermission, setMediaPermission] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [targetPart, setTargetPart] = useState('');

  // Predefined colors for quick selection  - more dimmed and less vibrant 
  const predefinedColors = [
    '#B85C44', // Dimmed Red-Orange
    '#5A9367', // Dimmed Green
    '#4A5D9E', // Dimmed Blue
    '#C4B454', // Dimmed Yellow
    '#A06A8C', // Dimmed Magenta/purple
    '#5A9E9E', // Dimmed Teal
    '#6A5A87', // Dimmed Purple
    '#B17A55', // Dimmed Orange
    '#3A3A3A', // Dark Gray
    '#E5E5E5', // Light Gray
  ];


  
  // Color selection handler
  const onColorChange = (color: string) => {
    setCurrentColor(color);
  };
  
  const confirmColorSelection = () => {
    setSelectedColor(currentColor);
    setColorPickerVisible(false);
  };

  const selectPredefinedColor = (color: string) => {
    setSelectedColor(color);
    setCurrentColor(color);
  };
 
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

    // Send the hex color without the '#' symbol
    formData.append('color', selectedColor.replace('#', ''));
    // Send the target part to be recolored
    formData.append('target_part', targetPart);
   
    try {
      const response = await axiosInstance.post('/api/image/recolor', formData, {
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
        'recolored-image.jpg',
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
            title: 'Recolor Image',
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
              placeholder='Select an Image for recoloring' 
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
                    What part of color do you want to recolor
                  </Text>
                  <View className='bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 p-3'>
                     <TextInput
                      value={targetPart}
                      onChangeText={setTargetPart}
                      placeholder='Enter target part (e.g. skin, hair, eyes)'
                      placeholderTextColor={colors.secondaryText}
                      className='text-gray-800 dark:text-white'
                    />
                  </View>
                  <Text className='text-gray-500 dark:text-gray-400 text-sm mt-2'>
                    Be specific about which part of the image you want to recolor
                  </Text>
                </View>
                {/* Select color input field */}
                <View className='flex-row items-center mb-3'>
                  <MaterialIcons name="palette" size={24} color={colors.primary} />
                  <Text className='text-lg font-bold ml-2 text-gray-800 dark:text-white'>Select Color</Text>
                </View>
                {/* Selected Color preview  */}
                <TouchableOpacity
                  onPress={() => setColorPickerVisible(true)}
                  className="flex-row items-center p-4 bg-gray-100 dark:bg-gray-800 mb-4 border-gray-200 dark:border-gray-700"
                  activeOpacity={0.7}
                >
                  <View style={{ backgroundColor: selectedColor, width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' }} />
                  <View className='ml-4 flex-1'>
                    <Text className='text-gray-800 dark:text-white font-medium'>Select Color</Text>
                    <Text className='text-gray-500 dark:text-gray-400'>{selectedColor}</Text>
                  </View>
                  <MaterialIcons name='edit' size={24} color={colors.primary} />
                </TouchableOpacity>

                {/* Predefined colors */}
                <Text className='text-gray-700 dark:text-gray-300 mb-2'>Quick Select Colors:</Text>
                <View className='flex-row flex-wrap mb-6'>
                  {predefinedColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => selectPredefinedColor(color)}
                      style={{
                        backgroundColor: color,
                        width: width / 6 - 10,
                        height: width / 6 - 10,
                        margin: 5,
                        borderRadius: 8,
                        borderWidth: selectedColor === color ? 3 : 1,
                        borderColor: selectedColor === color ? colors.primary : '#ccc',
                      }}
                      activeOpacity={0.7}
                    />
                  ))}
                </View>

                {/* Color picker modal */}
                <Modal
                  visible={colorPickerVisible}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setColorPickerVisible(false)}
                >
                  <View className='flex-1 justify-end'>
                    <View className='bg-white dark:bg-gray-900 p-4 rounded-t-3xl shadow-lg'>
                      <View className='flex-row justify-between items-center mb-4'>
                        <Text className='text-xl font-bold text-gray-800 dark:text-white'>Choose a Color</Text>
                        <TouchableOpacity
                          onPress={() => setColorPickerVisible(false)}
                        >
                          <MaterialIcons name='close' size={24} color={colors.text} />
                        </TouchableOpacity>
                      </View>

                      <View style={{ height: 300 }}>
                        <ColorPicker
                          color={selectedColor}
                          onColorChange={onColorChange}
                          thumbSize={30}
                          sliderSize={30}
                          noSnap={true}
                          row={false}
                        />
                      </View>
                      <View className='flex-row items-center justify-between mt-4 mb-2'>
                        <View style={{ backgroundColor: currentColor, width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#ccc' }}>
                          <Text className='text-gray-800 dark:text-white font-medium'>{currentColor}</Text>
                        </View>
                        <Button
                          onPress={confirmColorSelection}
                          className='mt-4'
                        >Select</Button>
                      </View>
                    </View>
                  </View>
                </Modal>
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
                      <MaterialIcons name="palette" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text className='text-white text-center font-medium'>
                        {isLoading ? 'Recoloring...' :'Recolor'}
                      </Text>
                    </View>
                  </Button>
              </View>
            )}
            
            <ProcessingOverlay
              visible={isLoading}
              message='Applying Color magic...'
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