import "../global.css";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "@env";
import { useNavigation } from "@react-navigation/native";
import { Entypo, Ionicons, FontAwesome6, AntDesign } from "@expo/vector-icons";
import { Link } from "expo-router";
import { ScrollView } from "react-native";

export default function HomeScreen() {
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        // console.log('API_BASE_URL:', API_BASE_URL);
        const response = await axios.get(`${API_BASE_URL}/api/dishes/`, {
          // const response = await axios.get(
          //   "http://192.168.4.186:8000/api/dishes/",
          // {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        // fetch categories
        const categoriesResponse = await axios.get(
          `${API_BASE_URL}/api/categories/`
          // "http://192.168.1.65:8000/api/categories/",
        );

        setFavorites(response.data.filter((dish) => dish.is_favorite));
        setCategories(categoriesResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dishes:", err);
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

  const categoryImages = {
    BREAKFAST: require("../assets/categories/breakfast.jpg"),
    LUNCH: require("../assets/categories/lunch.jpg"),
    DINNER: require("../assets/categories/dinner.jpg"),
    DESSERT: require("../assets/categories/dessert.jpg"),
    DRINK: require("../assets/categories/drink.jpg"),
  };

  // Filter and order categories as needed
  const orderedCategories = [
    categories.find((c) => c.name === "BREAKFAST"),
    categories.find((c) => c.name === "LUNCH"),
    categories.find((c) => c.name === "DINNER"),
    categories.find((c) => c.name === "DESSERT"),
    categories.find((c) => c.name === "DRINK"),
  ].filter(Boolean);

  const firstRow = orderedCategories.slice(0, 2);
  const secondRow = orderedCategories.slice(2, 4);
  const thirdRow = orderedCategories.slice(4, 5);

  const formatCategoryName = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <SafeAreaView className="flex-1">
          {/* Header with Title and + Button */}
          <View className="items-center px-4 py-2">
            <Text className="text-3xl font-bold text-gray-800">
              M&M's Cookbook
            </Text>
            <Link
              href="/createDish"
              className="absolute right-4 top-1/6 translate-y-2 w-10 h-10 rounded-full justify-center items-center"
            >
              <AntDesign name="plus" size={32} />
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
                  <Link href={`/recipe/${item.id}`} asChild>
                    <TouchableOpacity className="mr-4 w-40">
                      <View className="rounded-lg">
                        {item.image ? (
                          <Image
                            source={{
                              uri: `${API_BASE_URL}${item.image}`,
                            }}
                            className="w-full h-40 rounded-lg mb-5"
                            resizeMode="cover"
                            onError={(e) => {
                              console.log(
                                "Image failed to load:",
                                e.nativeEvent.error
                              );
                            }}
                          />
                        ) : (
                          <Image
                            source={require("../assets/placeholder.jpg")}
                            className="w-full h-40 rounded-lg mb-5"
                            resizeMode="cover"
                          />
                        )}
                        <Text className="font-bold text-left">{item.name}</Text>
                      </View>
                    </TouchableOpacity>
                  </Link>
                )}
              />
            </View>
          )}

          {/* Categories Section */}
          <View className="px-4 mb-8">
            <Text className="text-3xl font-bold mb-4">Categories</Text>

            {/* First Row (2 items) */}
            <View className="flex-row justify-between mb-4">
              {firstRow.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className="w-[48%] aspect-square"
                  onPress={() =>
                    navigation.navigate("categoryDishes", {
                      categoryId: category.id,
                    })
                  }
                >
                  <View className="relative w-full h-full rounded-lg overflow-hidden">
                    <View className="absolute inset-0 bg-black/25 z-10" />
                    <Image
                      source={
                        categoryImages[category.name] ||
                        require("../assets/placeholder.jpg")
                      }
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <View className="absolute bottom-0 left-0 right-0 p-4 z-20">
                      <Text className="text-white font-bold text-lg">
                        {formatCategoryName(category.name)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Second Row (2 items) */}
            <View className="flex-row justify-between mb-4">
              {secondRow.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className="w-[48%] aspect-square"
                  onPress={() =>
                    navigation.navigate("categoryDishes", {
                      categoryId: category.id,
                    })
                  }
                >
                  <View className="relative w-full h-full rounded-lg overflow-hidden">
                    <View className="absolute inset-0 bg-black/25 z-10" />
                    <Image
                      source={
                        categoryImages[category.name] ||
                        require("../assets/placeholder.jpg")
                      }
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <View className="absolute bottom-0 left-0 right-0 p-4 z-20">
                      <Text className="text-white font-bold text-lg">
                        {formatCategoryName(category.name)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Third Row (1 item) */}
            {thirdRow.length > 0 && (
              <View className="flex-row justify-between">
                <TouchableOpacity
                  key={thirdRow[0].id}
                  className="w-[48%] aspect-square"
                  onPress={() =>
                    navigation.navigate("categoryDishes", {
                      categoryId: thirdRow[0].id,
                    })
                  }
                >
                  <View className="relative w-full h-full rounded-lg overflow-hidden">
                    <View className="absolute inset-0 bg-black/25 z-10" />
                    <Image
                      source={
                        categoryImages[thirdRow[0].name] ||
                        require("../assets/placeholder.jpg")
                      }
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <View className="absolute bottom-0 left-0 right-0 p-4 z-20">
                      <Text className="text-white font-bold text-lg">
                        {formatCategoryName(thirdRow[0].name)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </ScrollView>

      {/* Bottom Navigation Bar with NativeWind */}
      <View className="absolute bottom-0 left-0 right-0 flex-row justify-around items-center h-24 bg-gray-50 border-t border-gray-200">
        <TouchableOpacity className="flex-1 justify-center items-center h-full">
          <Entypo name="home" size={24} color="gray" />
          <Text className="text-base text-gray-800">Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 justify-center items-center h-full"
          onPress={() => navigation.navigate("MyRecipes")}
        >
          <Ionicons name="book-outline" size={24} color="gray" />
          <Text className="text-base text-gray-800">My Recipes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 justify-center items-center h-full"
          onPress={() => navigation.navigate("Grocery")}
        >
          <FontAwesome6 name="list-check" size={24} color="gray" />
          <Text className="text-base text-gray-800">Grocery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
