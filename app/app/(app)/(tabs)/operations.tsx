import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '@/context/AuthContext';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '@/config/axiosConfig';
import SplitImageCard from '@/components/app/SplitImageCard';
import { useThemeColors } from '@/hooks/useThemeColors';


interface Operation {
  id: number;
  user_id: number;
  original_image: string;
  generated_image: string;
  operation_type: string;
  operation_metadata: any;
  created_at: string;
  updated_at: string;
  credits_used?: number;
}


interface paginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  has_more_pages: boolean;
}

export default function Operations() { 
  const { user } = useSession();;
  const colors = useThemeColors();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [pagination, setPagination] = useState<paginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);


  const fetchOperations = useCallback(async (page = 1, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await axiosInstance.get('/api/image/latest-operations', {
        params: {
          page, per_page: 3
        }
      });

      const newOperations = response.data.operations;

      if (page === 1 || refresh) {
        setOperations(newOperations);
      } else {
        setOperations((prev) => [...prev, ...newOperations]);
      }

      setPagination(response.data.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch operations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
    
  }, []); 

  const handleRefresh = useCallback(() => {
    fetchOperations(1, true);
  }, [fetchOperations]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && pagination?.has_more_pages) {
      fetchOperations(currentPage + 1);
    }
  }, [loadingMore, pagination, currentPage, fetchOperations]);

  const handleOperationPress = useCallback((operationId: number) => {
    router.push({ pathname: '/operation/[id]', params: { id: operationId } });
  }, []);

  useEffect(() => {
    fetchOperations(1);
  }, [fetchOperations]);

  const renderItem = useCallback(({ item }: { item: Operation }) => (
    <TouchableOpacity onPress={() => handleOperationPress(item.id)} activeOpacity={0.9}>
      <SplitImageCard
        originalImage={item.original_image}
        generatedImage={item.generated_image}
        operationType={item.operation_type}
        createdAt={item.created_at}
        creditsUsed={item.credits_used}
      />
    </TouchableOpacity>
  ), [handleOperationPress]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View className='py-4'>
        <ActivityIndicator size='small' color={colors.primary} />
      </View>
    );
  }, [loadingMore, colors.primary]);
  

  const renderEmpty = useCallback(() => (
    <View className='items-center justify-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg my-4'>
      <MaterialIcons name='image-not-supported' size={48} color={colors.secondaryText} />
      <Text className='text-gray-500 dark:text-gray-400 mt-2 text-center'>
        You Haven't created any operations yet.
      </Text>
    </View>
  ), [colors.secondaryText]);

  return (
    <SafeAreaView className='flex-1 bg-white dark:bg-gray-900'>
      <View className='flex-1 p-4'>
        <View className='flex-row justify-between items-center mb-6'>
          <Text className='text-2xl font-bold text-gray-800 dark:text-white'>Operations</Text>
          <TouchableOpacity onPress={() => router.push('/credits')} className='flex-row items-center'>
            <MaterialIcons name='stars' size={24} color={colors.primary} style={{ marginRight: 8 }} />
            <Text className='text-lg font-bold text-gray-800 dark:text-white'>{user?.credits || 0 } Credits</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={operations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={!loading ? renderEmpty : null}
          initialNumToRender={5}
        />
        {loading && (
          <View className='absolute inset-0 items-center justify-center bg-black/10 dark:bg-black/30'>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>
    </SafeAreaView>
  )



}
