import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE_URL } from "@env";
import { useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { Link } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { FlatList } from "react-native";

export default function EditDishScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [image, setImage] = useState(null);
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "" },
  ]);
  const [steps, setSteps] = useState([
    { number: 1, instruction: "", image: null },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [allIngredients, setAllIngredients] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [activeIngredientField, setActiveIngredientField] = useState(null);
  const [activeUnitField, setActiveUnitField] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const scrollViewRef = useRef();

  // Fetch existing dish data
  useEffect(() => {
    console.log("API_BASE_URL from EditDishScreen:", API_BASE_URL);
    const fetchDishData = async () => {
      try {
        const [dishRes, ingredientsRes, unitsRes, categoriesRes] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/api/dishes/${id}/`),
            axios.get(`${API_BASE_URL}/api/ingredients/`),
            axios.get(`${API_BASE_URL}/api/units/`),
            axios.get(`${API_BASE_URL}/api/categories/`),
            // axios.get(`http://192.168.1.65:8000/api/dishes/${id}/`),
            // axios.get(`http://192.168.1.65:8000/api/ingredients/`),
            // axios.get(`http://192.168.1.65:8000/api/units/`),
            // axios.get(`http://192.168.1.65:8000/api/categories/`),
          ]);

        const dish = dishRes.data;

        // Set basic dish info
        setName(dish.name);
        setDescription(dish.description || "");
        setPrepTime(dish.prep_time?.toString() || "");
        setCookTime(dish.cook_time?.toString() || "");
        setImage(dish.image ? `${API_BASE_URL}${dish.image}` : null);
        setIsFavorite(dish.is_favorite);

        // Set category
        if (dish.category) {
          const category = categoriesRes.data.find(
            (c) => c.id === dish.category
          );
          setSelectedCategory(category);
        }

        // Set ingredients
        const formattedIngredients = dish.dishingredient_set.map((ing) => ({
          id: ing.ingredient_detail?.id,
          name: ing.ingredient_detail?.name || "",
          quantity: ing.quantity || "",
          unitId: ing.unit_detail?.id,
          unit: ing.unit_detail?.name || "",
        }));
        setIngredients(
          formattedIngredients.length
            ? formattedIngredients
            : [{ name: "", quantity: "", unit: "" }]
        );

        // Set steps
        const formattedSteps = dish.steps
          .map((step) => ({
            id: step.id,
            number: step.step_number,
            instruction: step.instruction || "",
            image: step.image || null, // This will be the full URL from API
          }))
          .sort((a, b) => a.number - b.number); // Ensure steps are in order

        setSteps(
          formattedSteps.length
            ? formattedSteps
            : [{ number: 1, instruction: "", image: null }]
        );

        // Set dropdown options
        setAllIngredients(ingredientsRes.data);
        setAllUnits(unitsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load dish data");
      } finally {
        setLoading(false);
      }
    };

    fetchDishData();
  }, [id]);

  const pickImage = async (stepIndex = null) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (stepIndex !== null) {
        // for step image
        const updatedSteps = [...steps];
        updatedSteps[stepIndex].image = result.assets[0].uri;
        setSteps(updatedSteps);
      } else {
        // for main dish image
        setImage(result.assets[0].uri);
      }
    }
  };

  const filteredIngredients = allIngredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  const filteredUnits = allUnits.filter((unit) =>
    unit.name.toLowerCase().includes(unitSearch.toLowerCase())
  );

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      const updatedIngredients = [...ingredients];
      updatedIngredients.splice(index, 1);
      setIngredients(updatedIngredients);
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][field] = value;
    setIngredients(updatedIngredients);
  };

  const addStep = () => {
    setSteps([
      ...steps,
      { number: steps.length + 1, instruction: "", image: null },
    ]);
    setTimeout(() => {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }, 100);
  };

  const removeStep = (index) => {
    if (steps.length > 1) {
      const updatedSteps = [...steps];
      updatedSteps.splice(index, 1);
      // Renumber steps
      updatedSteps.forEach((step, i) => {
        step.number = i + 1;
      });
      setSteps(updatedSteps);
    }
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a dish name");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build the payload object
      const payload = {
        name: name,
        prep_time: prepTime || "0",
        cook_time: cookTime || "0",
        description: description || "",
        is_favorite: isFavorite,
        category_id: selectedCategory ? selectedCategory.id.toString() : null,
        dishingredient_set: ingredients.map((ing) => ({
          quantity: ing.quantity ? ing.quantity.toString() : "0",
          ingredient_id: ing.id?.toString(),
          ingredient_name: ing.id ? undefined : ing.name,
          unit_id: ing.unitId?.toString(),
          unit_name: ing.unitId ? undefined : ing.unit,
        })),
        steps: steps.map((step, index) => ({
          step_number: index + 1,
          instruction: step.instruction || "",
        })),
      };

      // Create FormData
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      // Add images separately if they're new (not URLs)
      if (image && !image.startsWith("http")) {
        const filename = image.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image";
        formData.append("image", {
          uri: image,
          name: filename,
          type,
        });
      }

      // Add step images if needed
      steps.forEach((step, index) => {
        if (step.image && !step.image.startsWith("http")) {
          const filename = step.image.split("/").pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image";
          formData.append(`steps[${index}][image]`, {
            uri: step.image,
            name: filename,
            type,
          });
        }
      });

      const response = await axios.patch(
        `${API_BASE_URL}/api/dishes/${id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          transformRequest: (data, headers) => {
            delete headers["Content-Type"];
            return data;
          },
        }
      );

      Alert.alert("Success", "Dish updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating dish:", error);
      Alert.alert(
        "Error",
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Failed to update dish. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const handleBackgroundTap = () => {
    Keyboard.dismiss();
    setShowIngredientDropdown(false);
    setShowUnitDropdown(false);
    setShowCategoryDropdown(false);
  };

  // Keep all your existing JSX from createDish.jsx, but change:
  // 1. The title from "Create Dish" to "Edit Dish"
  // 2. The save button text from "Save Dish" to "Update Dish"
  // The rest of the UI can remain exactly the same

  return (
    <TouchableWithoutFeedback onPress={handleBackgroundTap} accessible={false}>
      <View className="flex-1 bg-white">
        <FlatList
          ref={scrollViewRef}
          data={[{ key: "form" }]}
          renderItem={() => (
            <TouchableWithoutFeedback onPress={handleBackgroundTap}>
              <View className="flex-1 px-4">
                {/* Header with Title, x Button, and heart button */}
                <View className="flex-row justify-between items-center px-4 py-2 mt-14">
                  {/* X Button (Left-aligned) */}
                  <Link
                    href="/"
                    className="w-10 h-10 rounded-full justify-center items-center"
                  >
                    <AntDesign name="close" size={32} />
                  </Link>

                  {/* Title (Centered) - Changed to "Edit Dish" */}
                  <Text className="text-3xl font-bold text-gray-800">
                    Edit Dish
                  </Text>

                  {/* Heart Button (Right-aligned) */}
                  <TouchableOpacity
                    onPress={() => setIsFavorite(!isFavorite)}
                    className="w-10 h-10 rounded-full justify-center items-center"
                  >
                    <AntDesign
                      name={isFavorite ? "heart" : "hearto"}
                      size={32}
                      color={isFavorite ? "red" : "gray"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Basic Info */}
                <View className="mt-6">
                  <Text className="text-lg font-bold mb-2">Dish Name</Text>
                  <TextInput
                    className=" rounded-lg p-6 mb-4 bg-gray-100"
                    placeholder="Enter dish name"
                    value={name}
                    onChangeText={setName}
                    onFocus={() => {
                      setShowUnitDropdown(false);
                      setShowIngredientDropdown(false);
                      setShowCategoryDropdown(false);
                    }}
                  />

                  <Text className="text-lg font-bold mb-2">Description</Text>
                  <TextInput
                    className="rounded-lg p-6 mb-4 h-24 bg-gray-100"
                    placeholder="Enter description"
                    multiline
                    value={description}
                    onChangeText={setDescription}
                    onFocus={() => {
                      setShowUnitDropdown(false);
                      setShowIngredientDropdown(false);
                      setShowCategoryDropdown(false);
                    }}
                  />

                  {/* Category Selection */}
                  <View className="mb-4">
                    <Text className="text-lg font-bold mb-2">Category</Text>
                    <View className="relative">
                      <TouchableOpacity
                        className="bg-gray-100 rounded-lg p-6 justify-between flex-row items-center"
                        onPress={() =>
                          setShowCategoryDropdown(!showCategoryDropdown)
                        }
                      >
                        <Text className="text-gray-800">
                          {selectedCategory
                            ? selectedCategory.name
                            : "Select a category"}
                        </Text>
                        <Ionicons
                          name={
                            showCategoryDropdown ? "chevron-up" : "chevron-down"
                          }
                          size={20}
                          color="gray"
                        />
                      </TouchableOpacity>

                      {showCategoryDropdown && (
                        <View className="absolute top-full left-0 right-0 mt-1 max-h-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <ScrollView>
                            {categories.map((category) => (
                              <TouchableOpacity
                                key={category.id}
                                className="p-3 border-b border-gray-100"
                                onPress={() => {
                                  setSelectedCategory(category);
                                  setShowCategoryDropdown(false);
                                }}
                              >
                                <Text>{category.name}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Dish Image */}
                  <Text className="text-lg text-left font-bold">
                    Dish Image
                  </Text>
                  <View className="mt-4 mb-4 items-center">
                    <TouchableOpacity
                      onPress={() => pickImage()}
                      className="w-full h-64 bg-gray-100 rounded-lg justify-center items-center"
                    >
                      {image ? (
                        <Image
                          source={{ uri: image }}
                          className="w-full h-full rounded-lg"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="items-center">
                          <Ionicons
                            name="camera-outline"
                            size={40}
                            color="gray"
                          />
                          <Text className="mt-2 text-gray-500">
                            Add Dish Image
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row justify-between mb-4">
                    <View className="w-[48%]">
                      <Text className="text-lg font-bold mb-2">
                        Prep Time (min)
                      </Text>
                      <TextInput
                        className="rounded-lg p-4 bg-gray-100"
                        placeholder="e.g. 15"
                        keyboardType="numeric"
                        value={prepTime}
                        onChangeText={setPrepTime}
                        onFocus={() => {
                          setShowUnitDropdown(false);
                          setShowIngredientDropdown(false);
                          setShowCategoryDropdown(false);
                        }}
                      />
                    </View>
                    <View className="w-[48%]">
                      <Text className="text-lg font-bold mb-2">
                        Cook Time (min)
                      </Text>
                      <TextInput
                        className="rounded-lg p-4 bg-gray-100"
                        placeholder="e.g. 30"
                        keyboardType="numeric"
                        value={cookTime}
                        onChangeText={setCookTime}
                        onFocus={() => {
                          setShowUnitDropdown(false);
                          setShowIngredientDropdown(false);
                          setShowCategoryDropdown(false);
                        }}
                      />
                    </View>
                  </View>
                </View>
                {/* Ingredients */}
                <View className="mt-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-bold">Ingredients</Text>
                    <TouchableOpacity onPress={addIngredient}>
                      <Entypo name="plus" size={24} color="green" />
                    </TouchableOpacity>
                  </View>

                  {ingredients.map((ingredient, index) => (
                    <View
                      key={index}
                      className="mb-4 border-b border-gray-100 pb-4"
                    >
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-gray-600">
                          Ingredient {index + 1}
                        </Text>
                        {ingredients.length > 1 && (
                          <TouchableOpacity
                            onPress={() => removeIngredient(index)}
                          >
                            <MaterialIcons
                              name="delete-outline"
                              size={24}
                              color="red"
                            />
                          </TouchableOpacity>
                        )}
                      </View>

                      <Text className="mb-1">Name</Text>
                      <View className="relative">
                        <TextInput
                          className="bg-gray-100 rounded-lg p-6 mb-2"
                          placeholder="e.g. Flour"
                          value={ingredient.name}
                          onChangeText={(text) => {
                            handleIngredientChange(index, "name", text);
                            setIngredientSearch(text);
                            setActiveIngredientField(index);
                            setShowIngredientDropdown(true);
                          }}
                          onFocus={() => {
                            setActiveIngredientField(index);
                            setShowIngredientDropdown(true);
                            setShowUnitDropdown(false);
                            setShowCategoryDropdown(false);
                          }}
                        />
                        {showIngredientDropdown &&
                          activeIngredientField === index && (
                            <View className="absolute top-full left-0 right-0 mt-1 max-h-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <ScrollView>
                                {filteredIngredients.map((item) => (
                                  <TouchableOpacity
                                    key={item.id}
                                    className="p-3 border-b border-gray-100"
                                    onPress={() => {
                                      handleIngredientChange(
                                        index,
                                        "name",
                                        item.name
                                      );
                                      setShowIngredientDropdown(false);
                                    }}
                                  >
                                    <Text>{item.name}</Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                          )}
                      </View>

                      <View className="flex-row justify-between">
                        <View className="w-[48%]">
                          <Text className="mb-1">Quantity</Text>
                          <TextInput
                            className="bg-gray-100 rounded-lg p-6"
                            placeholder="e.g. 1.5"
                            keyboardType="decimal-pad"
                            value={ingredient.quantity}
                            onChangeText={(text) =>
                              handleIngredientChange(index, "quantity", text)
                            }
                            onFocus={() => {
                              setShowUnitDropdown(false);
                              setShowIngredientDropdown(false);
                              setShowCategoryDropdown(false);
                            }}
                          />
                        </View>
                        <View className="w-[48%]">
                          <Text className="mb-1">Unit</Text>
                          <View className="relative">
                            <TextInput
                              className="bg-gray-100 rounded-lg p-6"
                              placeholder="e.g. cups"
                              value={ingredient.unit}
                              onChangeText={(text) => {
                                handleIngredientChange(index, "unit", text);
                                setUnitSearch(text);
                                setShowUnitDropdown(true);
                                setActiveUnitField(index);
                              }}
                              onFocus={() => {
                                setShowUnitDropdown(true);
                                setShowIngredientDropdown(false);
                                setShowCategoryDropdown(false);
                                setActiveUnitField(index);
                              }}
                            />
                            {showUnitDropdown && activeUnitField === index && (
                              <View className="absolute top-full left-0 right-0 mt-1 max-h-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                <ScrollView>
                                  {filteredUnits.map((unit) => (
                                    <TouchableOpacity
                                      key={unit.id}
                                      className="p-3 border-b border-gray-100"
                                      onPress={() => {
                                        handleIngredientChange(
                                          index,
                                          "unit",
                                          unit.name
                                        );
                                        setActiveUnitField(null);
                                        setShowUnitDropdown(false);
                                      }}
                                    >
                                      <Text>{unit.name}</Text>
                                    </TouchableOpacity>
                                  ))}
                                </ScrollView>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
                {/* Cooking Steps */}
                <View className="mt-4 mb-8">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-bold">Cooking Steps</Text>
                    <TouchableOpacity onPress={addStep}>
                      <Entypo name="plus" size={24} color="green" />
                    </TouchableOpacity>
                  </View>

                  {steps.map((step, index) => (
                    <View
                      key={index}
                      className="mb-6 border-b border-gray-100 pb-4"
                    >
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-lg font-semibold">
                          Step {step.number}
                        </Text>
                        {steps.length > 1 && (
                          <TouchableOpacity onPress={() => removeStep(index)}>
                            <MaterialIcons
                              name="delete-outline"
                              size={24}
                              color="red"
                            />
                          </TouchableOpacity>
                        )}
                      </View>

                      <Text className="mb-1">Instructions</Text>
                      <TextInput
                        className="bg-gray-100 rounded-lg p-6 mb-2 h-24"
                        placeholder="Enter step instructions"
                        multiline
                        value={step.instruction}
                        onChangeText={(text) =>
                          handleStepChange(index, "instruction", text)
                        }
                        onFocus={() => {
                          setShowUnitDropdown(false);
                          setShowIngredientDropdown(false);
                          setShowCategoryDropdown(false);
                        }}
                      />

                      <Text className="mb-1">Step Image (Optional)</Text>
                      <TouchableOpacity
                        onPress={() => pickImage(index)}
                        className="w-full h-48 bg-gray-100 rounded-lg justify-center items-center mb-2"
                      >
                        {step.image ? (
                          <Image
                            source={{ uri: step.image }}
                            className="w-full h-full rounded-lg"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="items-center">
                            <Ionicons
                              name="camera-outline"
                              size={30}
                              color="gray"
                            />
                            <Text className="mt-2 text-gray-500">
                              Add Step Image
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        />

        {/* Save Button - Changed to "Update Dish" */}
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            className="bg-green-600 rounded-full p-4 items-center"
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text className="text-white font-bold text-lg">
              {isSubmitting ? "Updating..." : "Update Dish"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
