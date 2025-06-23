import { View, Text, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/core/Button';
import * as ImagePicker from 'expo-image-picker';
import { useSession } from '@/context/AuthContext';
import axiosInstance from '@/config/axiosConfig';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import PagerView from 'react-native-pager-view';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
import AspectRatioSelector, { AspectRatio } from '@/components/app/AspectRatioSelector';


const { width } = Dimensions.get('window');

export default function GenerativeFill() {
  const { user, updateUser } = useSession();
  const colors = useThemeColors();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [currentFullscreenIndex, setCurrentFullscreenIndex] = useState(0);
  const [mediaPermission, setMediaPermission] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<string>('1:1');

  const pageRef = useRef<PagerView | null>(null);
  const fullscreenPagerRef = useRef<PagerView | null>(null);

  const ASPECT_RATIOS: AspectRatio[] = [
    { value: '1:1', width: 40, height:40 },
    { value: '4:3', width: 40, height:30 },
    { value: '16:9', width: 48, height:27 },
  ];

  useEffect(() => {
    (async () => {
      const { status: imageStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasPermission(imageStatus === 'granted');
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      setMediaPermission(mediaStatus === 'granted'); 
    })()
  }, []);

  const pickImage = async () => {
    if (hasPermission !== true) {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photos to proceed.');
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
      setGeneratedImage(null);
    };
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

  // Save image to device storage
  const saveImage = async (imageUri: string) => {
    if (!mediaPermission) {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library permission to save image');
        return;
      }
      setMediaPermission(true);
    }

    try {
      setSavingImage(true);

      // Download the image from the provided URL
      const fileUri = FileSystem.documentDirectory + 'generative-fill-image.jpg';
      const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);

      if (downloadResult.status === 200) {
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync('AI Generated Images', asset, false);
        Alert.alert('Image Saved', 'Image saved to device gallery');
      } else {
        Alert.alert('Error', 'Failed to download image');
      }
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
            {!selectedImage ? (
              <TouchableOpacity
                onPress={pickImage}
                className='w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-800'
                activeOpacity={0.7}
              >
                <MaterialIcons name='add-photo-alternate' size={64} color={colors.primary} />
                <Text className='text-gray-500 dark:text-gray-300 text-lg font-medium mt-4'>Choose Image</Text>
                <Text className='text-gray-500 dark:text-gray-400 text-sm mt-2 text-center px-6'> Select an Image for generative fill </Text>
              </TouchableOpacity>
            ) : (
                <View className='w-full'>
                  <View className='flex-row items-center mb-3'>
                    <MaterialIcons name='image' size={24} color={colors.primary} />
                    <Text className='text-lg font-bold ml-2 text-gray-800 dark:text-white'>Original Image</Text>
                  </View>
                  <View className='relative w-full rounded-xl overflow-hidden mb-6 border border-gray-200 dark:border-gray-700'>
                    <Image
                      source={{ uri: selectedImage }}
                      style={{ width: '100%', height: width * 0.7 }}
                      resizeMode='cover'
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedImage(null);
                        setGeneratedImage(null);
                      }}
                      className='absolute top-2 right-2 bg-black/50 rounded-full p-1'
                    >
                      <MaterialIcons name='close' size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  {/* Aspect Ratio Selection */}
                  <View className='flex-row items-center mb-3 mt-2'>
                    <MaterialIcons name='aspect-ratio' size={24} color={colors.primary} />
                    <Text className='text-lg font-bold ml-2 text-gray-800 dark:text-white'>Select Aspect Ratio</Text>
                  </View>
                  <View className='w-full mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700'>
                    <AspectRatioSelector
                      ratios={ASPECT_RATIOS}
                      selectedRatio={selectedRatio}
                      onSelectRatio={setSelectedRatio}
                    />
                    <Text className='text-gray-500 dark:text-gray-400 text-xs mt-2'>Select the aspect ration from generated image.</Text>
                  </View>
                  {generatedImage && (
                    <>
                      <View className='flex-row items-center mb-3'>
                        <MaterialIcons name='compare' size={24} color={colors.primary} />
                        <Text className='text-lg font-bold ml-2 text-gray-800 dark:text-white'>Compare Images</Text>
                      </View>
                      
                      {/* Image Comparison with swipe */}
                      <View className='relative w-full rounded-xl overflow-hidden mb-4 border border-gray-200 dark:border-gray-700'>
                        <PagerView
                          style={{ width: '100%', height: width * 0.7 }}
                          initialPage={0}
                          ref={pageRef}
                        >
                          <View key="original">
                            <TouchableOpacity
                              activeOpacity={0.9}
                              onPress={() => {
                                setCurrentFullscreenIndex(0);
                                setFullscreenVisible(true);
                              }}
                              style={{ width: '100%', height: width * 0.7  }}
                            >
                              <Image
                                source={{ uri: selectedImage! }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode='cover'
                              />
                              <View className='absolute top-2 left-2 bg-black/50 rounded-full px-2 py-1 flex-row items-center'>
                               <Text className='text-white text-sm font-medium'>Original</Text>
                              </View>
                              <View key="generated">
                                <TouchableOpacity
                                  activeOpacity={0.9}
                                  onPress={() => {
                                    setCurrentFullscreenIndex(1);
                                    setFullscreenVisible(true);
                                  }}
                                  style={{ width: '100%', height: '100%' }}
                                >
                                  <Image
                                    source={{ uri: generatedImage }}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode='cover'
                                  />
                                  <View className='absolute top-2 left-2 bg-primary rounded-full px-2 py-1 flex-row items-center'>
                                    <MaterialIcons name='auto-fix-high' size={16} color="#fff" />
                                    <Text className='text-white text-sm ml-1 font-medium'>Ai Generated</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                            </TouchableOpacity>
                          </View>
                        </PagerView>

                        {/* Swipe Indicator */}
                        <View className='absolute bottom-4 left-0 right-0 flex-row justify-center'>
                          <Text className='flex-row text-white bg-black/50 rounded-full px-3 py-1,5 items-center'>Swipe to compare</Text>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View className='flex-row justify-between mb-6'>
                        <TouchableOpacity className='flex-1 mr-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-xl flex-row justify-center items-center'
                          onPress={() => saveImage(generatedImage)}
                          disabled={savingImage}
                        >
                          {savingImage ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                          ) : (
                            <>
                              <MaterialIcons name="save-alt" size={20} color={colors.primary} />
                              <Text className='ml-2 text-gray-800 dark:text-white'>Save</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </>
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
            {isLoading && (
              <View className='absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl'>
                <View className='bg-white dark:bg-gray-800 p-4 rounded-xl flex-row items-center'>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text className='ml-3 text-gray-700 dark:text-gray-300'>Applying AI magic..</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* FullScreen image viewer  */}
        <Modal
          visible={fullscreenVisible}
          transparent={true}
          animationType='fade'
          onRequestClose={() => setFullscreenVisible(false)}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <View className='flex-1 bg-black'>
            <StatusBar style='light' />
            <TouchableOpacity
              className='absolute top-10 right-4 z-10 bg-black/50 rounded-full p-2'
              onPress={() => setFullscreenVisible(false)}
            >
              <MaterialIcons name='close' size={20} color="#fff" />
            </TouchableOpacity>
            <PagerView
              style={{ flex: 1 }}
              initialPage={currentFullscreenIndex}
              ref={fullscreenPagerRef}
              onPageSelected={(e) => setCurrentFullscreenIndex(e.nativeEvent.position)}
            >
              {selectedImage && (
                <View
                  key="original"
                  className='flex-1 justify-center'
                >
                  <Image
                    source={{ uri: selectedImage }}
                    style={{ width: '100%', height: width * 1.2 }}
                    resizeMode="contain"
                  />
                  <View className='absolute bottom-20 self-center bg-black/50 rounded-full px-3 py-1.5'>
                    <Text className='text-white'>Original</Text>
                  </View>
                </View>
              )}

              {generatedImage && (
                <View key="generated" className='flex-1 justify-center'>
                  <Image
                    source={{ uri: generatedImage }}
                    style={{ width: '100%', height: width * 1.2 }}
                    resizeMode="contain"
                  />
                  <View className='absolute bottom-20 self-center bg-black/50 rounded-full px-3 py-1.5 flex-row item-center'>
                    <MaterialIcons name='auto-fix-high' size={16} color="#fff" />
                    <Text className='text-white ml-1'>AI Generated</Text>
                  </View>
                </View>
              )}
            </PagerView>

            {/* Pagination indicator */}
            <View className='absolute bottom-10 left-0 right-0 flex-row justify-center'>
              <View className='flex-row'>
                <View className={`w-2 h-2 rounded-full mx-1 ${currentFullscreenIndex === 0 ? 'bg-white' : 'bg-gray-500'}`} />
                <View className={`w-2 h-2 rounded-full mx-1 ${currentFullscreenIndex === 1 ? 'bg-white' : 'bg-gray-500'}`} />
              </View>
              </View>
            </View>
          </GestureHandlerRootView>
        </Modal>
      </>
    );
  
}