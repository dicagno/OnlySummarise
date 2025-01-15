import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import axios from "axios";

export default function App() {
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [sqft, setSqft] = useState("");
  const [location, setLocation] = useState("urban");
  const [predictedPrice, setPredictedPrice] = useState(null);

  const handlePredict = async () => {
    try {
      const response = await axios.post("https://your-worker-name.workers.dev", {
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        sqft: Number(sqft),
        location,
      });
      setPredictedPrice(response.data.predictedPrice);
    } catch (error) {
      console.error("Error predicting price:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Bedrooms"
        value={bedrooms}
        onChangeText={setBedrooms}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Bathrooms"
        value={bathrooms}
        onChangeText={setBathrooms}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Square Feet"
        value={sqft}
        onChangeText={setSqft}
        style={styles.input}
        keyboardType="numeric"
      />
      <Button title="Predict Price" onPress={handlePredict} />
      {predictedPrice !== null && (
        <Text style={styles.result}>Predicted Price: ${predictedPrice}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  result: { marginTop: 20, fontSize: 18, fontWeight: "bold" },
});
