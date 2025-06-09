import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import { StyleSheet } from "react-native";

export default function Index() {
  // https://github.com/react-native-webview/react-native-webview/blob/master/docs/Guide.md
  return (
    <WebView
      style={styles.container}
      showsHorizontalScrollIndicator={false}
      source={{ uri: "http://localhost:3000" }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
