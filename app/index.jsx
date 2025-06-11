import "../global.css";
import { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { Entypo, Ionicons, FontAwesome6, AntDesign } from "@expo/vector-icons";
import { Link } from 'expo-router';

export default function HomeScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/dishes/`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        setFavorites(response.data.filter(dish => dish.is_favorite));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dishes:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" className="text-green-500" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-lg text-red-500 mb-2">Error loading dishes</Text>
        <Text className="text-gray-600 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        {/* Header with Title and + Button */}
        <View className="items-center px-4 py-2">
          <Text className="text-3xl font-bold text-gray-800">
            M&M's Cookbook
          </Text>
          <Link href="/createDish" className="absolute right-4 top-1/6 translate-y-2 w-10 h-10 rounded-full justify-center items-center">
            <AntDesign name="plus" size={32}/>
          </Link>
        </View>

        {/* Search Bar */}
        <View className="mx-4 mt-8 mb-8 px-4 py-4 bg-gray-100 rounded-lg">
          <Text className="text-gray-500">Search by name or ingredients</Text>
        </View>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <View className="mb-8">
            <Text className="text-3xl font-bold px-4 mb-12">Favorites</Text>
            <FlatList
              horizontal
              data={favorites}
              keyExtractor={(item) => item.id.toString()}
              contentContainerClassName="px-4"
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  className="mr-4 w-40"
                  onPress={() => navigation.navigate('Dish', { dishId: item.id })}
                >
                  <View className="rounded-lg">
                    {item.image ? (
                      <Image 
                        source={{ uri: `${process.env.API_BASE_URL || 'http://localhost:8000'}${item.image}` }} 
                        className="w-full h-40 rounded-lg mb-5"
                        resizeMode="cover"
                        onError={(e) => {
                          console.log('Image failed to load:', e.nativeEvent.error);
                        }}
                      />
                    ) : (
                      <Image
                        source={require('../assets/placeholder.jpg')}
                        className="w-full h-40 rounded-lg mb-5"
                        resizeMode="cover"
                      />
                    )}
                    <Text className="font-bold text-left">{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </SafeAreaView>

      {/* Bottom Navigation Bar with NativeWind */}
      <View className="flex-row justify-around items-center h-24 bg-gray-50 border-t border-gray-200">
        <TouchableOpacity 
          className="flex-1 justify-center items-center h-full"
        >
          <Entypo name="home" size={24} color="gray" />
          <Text className="text-base text-gray-800">Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 justify-center items-center h-full"
          onPress={() => navigation.navigate('MyRecipes')}
        >
          <Ionicons name="book-outline" size={24} color="gray" />
          <Text className="text-base text-gray-800">My Recipes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 justify-center items-center h-full"
          onPress={() => navigation.navigate('Grocery')}
        >
          <FontAwesome6 name="list-check" size={24} color="gray" />
          <Text className="text-base text-gray-800">Grocery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}