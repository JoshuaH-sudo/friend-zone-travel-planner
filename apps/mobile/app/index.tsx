import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import { StyleSheet } from "react-native";

export default function Index() {
  return (
    <WebView
      style={styles.container}
      showsHorizontalScrollIndicator={false}
      source={{ uri: "http://localhost:3000/en" }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
