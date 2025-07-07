import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

export const requestMediaPermission = async (): Promise<boolean> => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
};

export const saveImageToGallery = async (
    imageUri: string,
    filename: string,
    albumName: string,
): Promise<boolean> => {
    try {
        // Download the image from the provided URI
        const fileUri = FileSystem.documentDirectory + filename;
        const downloadResult = await FileSystem.downloadAsync(
            imageUri,
            fileUri,
        );

        if (downloadResult.status === 200) {
            const asset = await MediaLibrary.createAssetAsync(fileUri);
            await MediaLibrary.createAlbumAsync(albumName, asset, false);
            Alert.alert('Success', 'Image saved to your gallery');
            return true;

        } else {
            Alert.alert('Error', 'Failed to save image to gallery');
            return false;
        }
    } catch (error) {
        console.error('Error saving image to gallery:', error);
        Alert.alert('Error', 'Failed to save image to gallery');
        return false;
    }
};
