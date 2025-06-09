import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import { StyleSheet } from "react-native";

const isDevelopment = process.env.NODE_ENV === "development";

export default function Index() {
  // https://github.com/react-native-webview/react-native-webview/blob/master/docs/Guide.md
  return (
    <WebView
      style={styles.container}
      showsHorizontalScrollIndicator={false}
      source={{ uri: isDevelopment ? "http://localhost:3000" : "https://www.friend-zone.app/" }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
