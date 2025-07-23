import Constants from "expo-constants";
import { StyleSheet } from 'react-native';

import WebView from 'react-native-webview';

export default function HomeScreen() {
  return (
    <WebView
      style={styles.container}
      showsHorizontalScrollIndicator={false}
      source={{ uri: "https://www.friend-zone.app/en/home" }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
