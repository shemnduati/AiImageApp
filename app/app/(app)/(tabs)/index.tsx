import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '@/context/AuthContext';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/config/axiosConfig';
import FeatureCard from '@/components/app/FeatureCard';
import { useThemeColors } from '@/hooks/useThemeColors';
import SplitImageCard from '@/components/app/SplitImageCard'; 
import operations from './operations';

interface Operation {
  id: number;
  user_id: number;
  original_image: string;
  generated_image: string;
  operation_type: string;
  operation_metadata: any;
  created_at: string;
  updated_at: string;
}

export default function Index() {
  const { user } = useSession();
  const colors = useThemeColors();
  const [operationCredits, setOperationCredits] = useState<Record<string, number>>({});
  const [latestOperations, setLatestOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const handleOperationPress = useCallback((operationId: number) => {
    console.log('operationId: ', operationId);
    router.push({ pathname: '/operation/[id]', params: { id: operationId } });
  }, []);

  useEffect(() => {
    const fetchOperationsCredits = async () => {
      try {
        const response = await axiosInstance.get('/api/operations/credits');
        setOperationCredits(response.data.operations);
      } catch (error) {
        console.error('Failed to fetch operations credits:', error);
      }
    };

    const fetchLatestOperations = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/image/latest-operations',
          {
            params: { page: 1, per_page: 3 }// fetch 3 latest operations
          }
        );
        setLatestOperations(response.data.operations);
      } catch (error) {
        console.error('Failed to fetch latest operations:', error);
      } finally {
        setLoading(false);
      }
    };


    fetchOperationsCredits();
    fetchLatestOperations();
  }, []);


 

  const cards = [
    {
      title: 'Generative Fill',
      description: 'Expand your images with AI-generated content',
      icon: 'auto-fix-high',
      route: '/generative-fill',
      operationType: 'generative_fill',
    },
    {
      title: 'Restore Images',
      description: 'Enhance and restore old or damaged photos',
      icon: 'restore',
      route: '/restore',
      operationType: 'restore'
    },
    {
      title: 'Recolor Images',
      description: 'Transform images color using AI',
      icon: 'palette',
      route: '/recolor',
      operationType: 'recolor'
    },
    {
      title: 'Remove Objects',
      description: 'Remove unwanted objects from images',
      icon: 'content-cut',
      route: '/remove',
      operationType: 'remove_object'
    },
  ];
  return (
    <View className='flex-1 bg-white dark:bg-gray-900'>
      <ScrollView className='flex-1'>
        <View className='p-4'>
          <View className='flex flex-row justify-between items-center mb-6'>
            <Text className='text-2xl font-bold text-gray-800 dark:text-white'>Welcome, {user?.name}</Text>
            <TouchableOpacity
              onPress={() => router.push('/credits')}
              className='flex-row items-center'
            >
              <MaterialIcons
                name="stars"
                size={24}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text className='text-2xl font-bold text-gray-800 dark:text-white'>
                {user?.credits || 0} credits
              </Text>
            </TouchableOpacity> 
          </View>
          <View className='flex-row flex-wrap justify-between mb-6'>
            {cards.map((card) => (
              <FeatureCard
                key={card.title}
                title={card.title}
                description={card.description}
                icon={card.icon as keyof typeof MaterialIcons.glyphMap}
                gradient={[colors.card, colors.surface] as readonly [string, string, ...string[]]}
                credits={operationCredits[card.operationType]}
                onPress={() => router.push(card.route as any)}
              />
            ))}
          </View>

          <View className='mb-4'>
            <Text className='text-2xl font-bold text-gray-600 dark:text-white mb-4'>
              Latest Operations
            </Text> 
            {loading ? (
              <View>
                 <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : latestOperations.length > 0 ?(
                <View className='items-center'>
                  {latestOperations.map((operation) => (
                    <TouchableOpacity
                      key={operation.id}
                      onPress={() => handleOperationPress(operation.id)}
                      activeOpacity={0.9}
                    >
                      <SplitImageCard
                        originalImage={operation.original_image}
                        generatedImage={operation.generated_image}
                        operationType={operation.operation_type}
                        createdAt={operation.created_at}
                      />
                    </TouchableOpacity>
                  ))}
              </View>
            ): (
                <View className='items-center justify-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg'>
                    <MaterialIcons name="image-not-supported" size={48} color={colors.secondaryText} />
                    <Text className='text-gray-500 dark:text-gray-400 mt-2 text-center'>
                      You haven't created any operations yet.
                    </Text>
               </View>     
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );

}