import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "@env";
import { useRouter } from "expo-router";

const RecipeDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [checkedItems, setCheckedItems] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/dishes/${id}/`);
      router.back();
    } catch (err) {
      console.error("Error deleting recipe:", err);
      alert("Failed to delete recipe");
    } finally {
      setIsDeleting(false);
    }
  };

  const requiredText = `Delete ${dish?.name || "this recipe"}`;

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/dishes/${id}/`, {
          timeout: 10000, // 10 seconds timeout
        });
        setDish(response.data);
        console.log("API Response:", response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dish:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (id) {
      fetchDish();
    }
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-lg text-red-500 mb-2">Error loading recipe</Text>
        <Text className="text-sm text-gray-600 text-center">{error}</Text>
      </View>
    );
  }

  if (!dish) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-red-500">Recipe not found</Text>
      </View>
    );
  }

  const toggleCheck = (index) => {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const formatQuantity = (quantity) => {
    // Convert string to number
    const num = parseFloat(quantity);
    // Check if it's a whole number
    return num % 1 === 0 ? num.toString() : quantity;
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerClassName="flex-grow" // This makes the content container expand
        className="flex-1"
      >
        <View className="px-4 pt-2 pb-3">
          {/* Back Button */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 -ml-2"
            >
              <Ionicons name="arrow-back" size={32} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/edit-recipe/${id}`)} // Add your edit route here
            >
              <Text className="text-green-600 text-2xl font-semibold mr-2">
                Edit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text
          className="text-3xl font-bold text-gray-800 flex-1 text-center px-4 mb-8"
          numberOfLines={1}
        >
          {dish.name}
        </Text>

        {/* Header Image */}
        <View className="h-80 w-full mb-6">
          {dish.image ? (
            <Image
              source={{ uri: `${API_BASE_URL}${dish.image}` }}
              className="h-full w-full"
              resizeMode="cover"
              loadingIndicatorSource={require("../../assets/placeholder.jpg")}
            />
          ) : (
            <Image
              source={require("../../assets/placeholder.jpg")}
              className="h-full w-full"
              resizeMode="cover"
            />
          )}
        </View>

        {/* Title and Basic Info */}
        <View className="px-4">
          <View className="mb-4">
            {/* Description */}
            {dish.description && (
              <View className="mb-6">
                <Text className="text-2xl leading-6 text-gray-700">
                  {dish.description}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text className="ml-1 text-gray-600">
                  Prep: {dish.prep_time} min
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#666" />
                <Text className="ml-1 text-gray-600">
                  Cook: {dish.cook_time} min
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="restaurant-outline" size={20} color="#666" />
                <Text className="ml-1 text-gray-600">
                  Total: {dish.prep_time + dish.cook_time} min
                </Text>
              </View>
            </View>
          </View>

          {/* Ingredients */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-800 mb-3 pb-1">
              Ingredients
            </Text>
            {dish.dishingredient_set.map((ingredient, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <TouchableOpacity
                  onPress={() => toggleCheck(index)}
                  className={`w-6 h-6 border-2 rounded-md mr-3 justify-center items-center
              ${
                checkedItems[index]
                  ? "bg-green-500 border-green-500"
                  : "border-gray-400"
              }`}
                >
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={checkedItems[index] ? "white" : "transparent"}
                  />
                </TouchableOpacity>
                <Text className="text-2xl font-light text-gray-700 flex-1">
                  {formatQuantity(ingredient.quantity)}{" "}
                  {ingredient.unit_detail?.name || ""}{" "}
                  {ingredient.ingredient_detail?.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View>
            <Text className="text-3xl font-bold text-gray-800 mb-6 pb-1">
              Instructions
            </Text>
            {dish.steps.map((step, index) => (
              <View key={index} className="flex-row mb-8">
                {/*Image Column*/}
                <View className="mr-4">
                  {step.image && (
                    <Image
                      source={{ uri: step.image }} // Full URL already comes from API
                      className="w-24 h-24 rounded-lg mt-2"
                      resizeMode="cover"
                      loadingIndicatorSource={require("../../assets/placeholder.jpg")}
                    />
                  )}
                </View>

                {/* Step Number and Instruction Text (Right) */}
                <View className="flex-1">
                  <Text className="text-xl font-semibold text-gray-800 mb-1">
                    Step {step.step_number}
                  </Text>
                  <Text className="text-xl leading-7 text-gray-800">
                    {step.instruction || "No instructions provided"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Spacer */}
        <View className="flex-grow min-h-[100]"></View>

        {/* Delete Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-white py-4">
          <TouchableOpacity
            className="bg-red-500 py-3 px-6 rounded-full mx-auto flex-row items-center"
            onPress={() => setShowDeleteModal(true)}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color="white"
              className="mr-2"
            />
            <Text className="text-white font-bold text-center">
              Delete Recipe
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
        >
          <View className="flex-1 bg-black/50 justify-center items-center p-4">
            <View className="bg-white rounded-lg p-6 w-full max-w-md">
              <Text className="text-xl font-bold mb-4 text-center">
                Confirm Deletion
              </Text>

              <Text className="text-gray-700 mb-4 text-center">
                Are you sure you want to delete this recipe?
              </Text>

              <Text className="text-gray-700 mb-2">
                To confirm, type "{requiredText}" below:
              </Text>

              <TextInput
                className="border border-gray-300 rounded p-3 mb-4"
                placeholder={requiredText}
                value={confirmationText}
                onChangeText={setConfirmationText}
                autoFocus={true}
              />

              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="px-4 py-2 rounded border border-gray-300"
                  onPress={() => {
                    setShowDeleteModal(false);
                    setConfirmationText("");
                  }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`px-4 py-2 rounded ${
                    confirmationText === requiredText
                      ? "bg-red-500"
                      : "bg-gray-400"
                  }`}
                  disabled={confirmationText !== requiredText || isDeleting}
                  onPress={handleDelete}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold">
                      Delete Permanently
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default RecipeDetailScreen;
