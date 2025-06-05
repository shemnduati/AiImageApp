import { View, Text, Image, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react';
import Button from '../components/core/Button';
import Input from '@/components/core/Input';
import { useSession } from '@/context/AuthContext';
import { Link, router } from 'expo-router';
import axios from 'axios';
import axiosInstance from '@/config/axiosConfig';
import { useTheme } from '@/context/ThemeContext';

const Login = () => {
  const { signIn } = useSession();
  const { currentTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const handleChange = (key: string, value: string) => {
    setData({ ...data, [key]: value });
    setErrors({ ...errors, [key]: "" });
  };
  const handleLogin = async () => {
    setLoading(true);
    setErrors({ email: "", password: "" });
    try {
      const response = await axiosInstance.post('/api/login', data);
      await signIn(response.data.token, response.data.user);
      router.replace('/');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        if (responseData?.errors) {
            setErrors(responseData.errors);
        } else if (responseData?.message) {
          Alert.alert('Error', responseData.message);
        } else {
          Alert.alert('Error', 'An error occurred while logging in.');
        }
      } else {
        console.error("Error:", error);
        Alert.alert("Error", "Unable to connect to the server");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <View className={`flex-1 justify-center items-center p-5 ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <View className='items-center mb-8'>
        <Image
          source={require('../assets/images/landing.png')}
          className='w-32 h-32'
          resizeMode='contain'
        /> 
        <Text className={`text-2xl font-bold mt-4 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Imaginary</Text>
      </View>
      <Text className={`text-3xl font-semibold mb-5 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Login</Text>
        <Input
          placeholder='Email'
          keyboardType='email-address'
          value={data.email}
          onChangeText={(value) => handleChange("email", value)}
          error={errors.email}
        />
        <Input
          placeholder='Password'
          secureTextEntry
          value={data.password}
          onChangeText={(value) => handleChange("password", value)}
          error={errors.password}
        />
        <Button
          className='w-full bg-primary mb-4'
          onPress={handleLogin}
          disabled={loading}
          loading={loading}
        >
          <View className='flex-row items-center justify-center'>
            <Text className='text-white text-center'>Login</Text>
          </View>
        </Button>
        <Text className={`text-lg ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-5`}>
          Don't have an account?
          <Link href="/signup">
           <Text className='text-primary'>Sign up</Text>
          </Link>
        </Text>
    </View>
  )
}

export default Login;