import { Platform, ToastAndroid } from "react-native";
interface ToastOptions {
  title: string;
  description: string;
}
export function useToast() {
  const showToast = ({ title, description }: ToastOptions) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(
        `${title}\n${description}`,
        ToastAndroid.LONG,
      );
    }
  };

  return { showToast };
}
