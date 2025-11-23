import { View, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const WEB_APP_URL = "http://192.168.1.201:5173";

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      )}

      <WebView
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        injectedJavaScript={`
          (function() {W
            // Remove any existing viewport tags
            let old = document.querySelectorAll('meta[name=viewport]');
            old.forEach(m => m.remove());

            // Force DESKTOP viewport
            let meta = document.createElement('meta');
            meta.setAttribute('name', 'viewport');
            meta.setAttribute('content', 'width=1500, initial-scale=0.22, maximum-scale=1');
            document.head.appendChild(meta);

            // FORCE SIDEBAR VISIBLE
            let style = document.createElement('style');
            style.innerHTML = \`
              /* Show sidebar even if Tailwind hides it */
              .sidebar, #sidebar, .organizer-sidebar, .organizer-panel, .side-nav {
                  display: block !important;
                  visibility: visible !important;
                  opacity: 1 !important;
              }

              /* Override Tailwind hidden/md:block */
              .hidden {
                  display: block !important;
              }

              /* Prevent transitions that hide layout */
              * {
                  transition: none !important;
              }
            \`;
            document.head.appendChild(style);
          })();
        `}
        scalesPageToFit={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f1724",
    paddingHorizontal: 10,
  },

  webview: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 10,
  },

  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0f1724",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
});
