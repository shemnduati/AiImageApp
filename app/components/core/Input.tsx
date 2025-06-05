import { TextInput, StyleSheet } from 'react-native';
import  React, { useState } from 'react';
import { View, Text, TextInputProps } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface InputProps extends TextInputProps {
    error?: string;
}

const Input = ({
    value,
    placeholder,
    keyboardType,
    secureTextEntry,
    onChangeText,
    error = "",
}: InputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const { currentTheme } = useTheme();

    return (
        <View className='w-full mb-4'>
            <TextInput
            className={`w-full h-12 border roundede-lg px-3 mb-1  
                ${currentTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900' } 
                ${isFocused ? "border-primary" : "border-gray-300"} ${error ? "border-red-500" : ""}`}
            value={value}
            placeholder={placeholder}
            placeholderTextColor={currentTheme === 'dark' ? "gray" : "#9CA3AF"}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
        />
            {!!error && (
                <Text className='text-left justify-start text-red-500'>{error}</Text>
            )}
        </View>
    );
};

export default Input;