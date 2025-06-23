import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export interface AspectRatio {
    width: number;
    height: number;
    value: string;
}

interface AspectRatioSelectorProps {
    ratios: AspectRatio[];
    selectedRatio: string;
    onSelectRatio: (ratio: string) => void;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
    ratios,
    selectedRatio,
    onSelectRatio
}) => {
    return (
        <View className='flex-row justify-between items-center mb-4'>
            {ratios.map((ratio) => (
                <TouchableOpacity
                    key={ratio.value}
                    onPress={() => onSelectRatio(ratio.value)}
                    className={`items-center ${selectedRatio === ratio.value ? 'opacity-100' : 'opacity-50'}`}
                >
                    <View
                        className={`mb-2 border-2 ${selectedRatio === ratio.value ? 'border-primary' : 'border-gray-400'}`}
                        style={{
                            width: ratio.width,
                            height: ratio.height,
                        }}
                    >
                        <Text className={`text-sm ${selectedRatio === ratio.value ? 'text-primary' : 'text-gray-400'}`}>
                            {ratio.value}
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    )
}

export default AspectRatioSelector;