import { Text, View, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '@/context/AuthContext';
import Button from '@/components/core/Button';
import { useThemeColors } from '@/hooks/useThemeColors';


export default function Profile() {
  const { user, signOut } = useSession();
  const colors = useThemeColors();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // For web browsers
      if (window.confirm('Are you sure you want to logout?')) {
        signOut();
      }
    } else {
      // For mobile devices
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ],
        { cancelable: true }
      );
    }
  };
  return (
    <SafeAreaView className='flex-1 bg-white dark:bg-gray-900'>
      <View className='flex-1 p-4'>
        <View className='bg-gray-100 dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-4'>
          <Text className='text-2xl font-bold mb-4 text-gray-800 dark:text-white'>Profile</Text>
          <View className='space-y-2'>
            {/* Name */}
            <View className='bg-gray-200/80 dark:bg-gray-700/50 p-4 rounded-2xl' style={{backgroundColor: colors.surface}}> 
              <Text className='text-sm mb-1' style={{color: colors.secondaryText}}>Name</Text>
              <Text className='text-lg' style={{color: colors.text}}>{user?.name}</Text>
            </View>
            {/* Email */}
            <View className='p-4 rounded-2xl' style={{ backgroundColor: colors.surface }}>
              <Text className='text-sm mb-1' style={{ color: colors.secondaryText }}>Email</Text>
              <Text className='text-lg' style={{ color: colors.text }}>{user?.email}</Text>
            </View>
          </View>
        </View>
        {/* Logout Button */}
        <Button
          onPress={handleLogout}
          variant='danger'
          className='rounded-2xl shadow-lg'
        >
          <Text className='text-white text-center font font-semibold'>Logout</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}