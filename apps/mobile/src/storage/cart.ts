import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "greentech_cart_v1";

export async function loadCart() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}
export async function saveCart(data: any) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}
export async function clearCart() {
  await AsyncStorage.removeItem(KEY);
}
