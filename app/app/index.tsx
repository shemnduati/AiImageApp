import { useTheme } from "@/context/ThemeContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import React from "react";
import { router } from "expo-router";
import {
  Text,
  Image,
  SafeAreaView,
  View,
  TouchableOpacity
} from 'react-native';
import { colors } from "@/constants/colors";
import { LinearGradient } from 'expo-linear-gradient';


type Feature = {
  icon: string;
  text: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: '🍪',
    text: 'Recolor Images',
    description: 'Choose Arbitrary Color'
  },
  {
    icon: '📷',
    text: 'Restore Photos',
    description: 'In Excellent Quality'
  },
  {
    icon: '✨',
    text: 'Generative Fill',
    description: 'Smart Expand'
  },
  {
    icon: '✂️',
    text: 'Remove Objects',
    description: 'Clean Removal'
  }
];


const WelcomeScreen = () => {
  const color = useThemeColors();
  const { currentTheme } = useTheme();
  return (
    <SafeAreaView className={`flex-1 ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="items-center px-5 pt-10">
        <Image source={require('../assets/images/landing.png')} className="w-[120px] h-[120px] mb-6" resizeMode="contain" />
        <Text className={`text-[28px] font-bold text-center mb-3 ${currentTheme ==='dark' ? 'text-white' : 'text-gray-900'}`}>Imaginary</Text>
        <Text className={`text-base text-center mb-10 leading-6 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Transform your images with powerful AI tools Recolor, restore, fill, and remove objects with just a few taps
        </Text>
        <View className="flex-row flex-wrap justify-between mb-[30px] px-[5px]">
          {features.map((feature, index) =>(
            <View key={index} className={`w-[48%] rounded-2xl p-4 mb-4 ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Text className="text-[36px] mb-3">{feature.icon}</Text>
              <View className="w-full">
                <Text className={`text-[18px] font-semibold mb-1 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{feature.text}</Text>
                <Text className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View className="p-5 w-full">
        <TouchableOpacity
          className="h-[54px] rounded-xl border-[1.5px] justify-center items-center mb-4"
          style={{ borderColor: colors.primary}}
          onPress={() => router.push('/sign-in')}
        >
          <Text className="text-base font-semibold" style={{color: colors.primary }}>
            Log In
          </Text>
        </TouchableOpacity>
        <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            start={{ x:0, y:0}}
            end={{x:1, y:1}}
            style={{
              borderRadius: 12,
              marginBottom: 16,
              height: 54
            }}
          >
            <TouchableOpacity className="h-[54px] justify-center items-center" onPress={() => router.push('/signup')}>
              <Text className="text-base font-semibold text-white"> Create Account</Text>
            </TouchableOpacity>
          </LinearGradient>
        <Text className={`text-center text-sm mt-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Start Transforming your images Today
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;