import { View, Text, Pressable } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";

export default function FarmerHome() {
  const { user, signOut } = useAuth();
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Área do Agricultor</Text>
      <Text>{user?.name}</Text>
      <Pressable onPress={signOut} style={{ padding: 14, borderWidth: 1, borderRadius: 10, alignItems: "center" }}>
        <Text>Sair</Text>
      </Pressable>
    </View>
  );
}