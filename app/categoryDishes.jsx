import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "@env";
import { Link } from "expo-router";
import { AntDesign, Ionicons } from "@expo/vector-icons";

// Import your category images
const categoryImages = {
  BREAKFAST: require("../assets/categories/breakfast.jpg"),
  LUNCH: require("../assets/categories/lunch.jpg"),
  DINNER: require("../assets/categories/dinner.jpg"),
  DESSERT: require("../assets/categories/dessert.jpg"),
  DRINK: require("../assets/categories/drink.jpg"),
};

export default function CategoryDishes() {
  const { categoryId } = useLocalSearchParams();
  const [dishes, setDishes] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch category details
      const categoryResponse = await axios.get(
        `${API_BASE_URL}/api/categories/${categoryId}/`
      );
      setCategory(categoryResponse.data);

      // Fetch dishes for this category
      const dishesResponse = await axios.get(
        `${API_BASE_URL}/api/dishes/?category=${categoryId}`
      );
      setDishes(dishesResponse.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [categoryId]);

  if (loading && !refreshing) {
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
        <TouchableOpacity
          className="mt-4 bg-green-500 px-4 py-2 rounded-lg"
          onPress={fetchData}
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatCategoryName = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header with Back Button and Recipes Label */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={32} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-center">Recipes</Text>
        <View className="w-8" />
      </View>

      {/* Header Image with Category Name Overlay */}
      <View className="h-64 w-full relative">
        <Image
          source={
            category?.name
              ? categoryImages[category.name] ||
                require("../assets/placeholder.jpg")
              : require("../assets/placeholder.jpg")
          }
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/30" />
        <View className="absolute bottom-0 left-0 p-6">
          <Text className="text-4xl font-bold text-white">
            {category ? formatCategoryName(category.name) : "Category"}
          </Text>
        </View>
      </View>

      {/* Content - Using FlatList alone instead of nested in ScrollView */}
      <FlatList
        data={dishes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName={
          dishes.length === 0 ? "flex-grow justify-center items-center" : "p-4"
        }
        ListHeaderComponent={
          <View className="pb-4">
            {/* This empty view creates space between header image and list */}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-500">
              No dishes found in this category
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row mb-4 bg-gray-50 rounded-lg overflow-hidden shadow-sm"
            onPress={() => router.push(`/recipe/${item.id}`)}
          >
            {/* Dish Info */}
            <View className="flex-1 p-3 justify-center">
              <Text className="text-lg font-semibold">{item.name}</Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-gray-500">{item.total_time} mins •</Text>
                {item.favorite && (
                  <Ionicons
                    name="heart"
                    size={16}
                    color="#ef4444"
                    style={{ marginLeft: 4 }}
                  />
                )}
              </View>
            </View>

            {/* Dish Image */}
            {item.image ? (
              <Image
                source={{ uri: `${API_BASE_URL}${item.image}` }}
                className="w-24 h-24 rounded-lg"
                resizeMode="cover"
                onError={() => console.log("Image failed to load")}
              />
            ) : (
              <Image
                source={require("../assets/placeholder.jpg")}
                className="w-24 h-24 rounded-lg"
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
