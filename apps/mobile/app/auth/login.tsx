import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit() {
    setErr(null);
    try {
      await signIn(email.trim(), password);
      router.replace("/");
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Falha no login");
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Entrar</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
      />

      {err ? <Text style={{ color: "red" }}>{err}</Text> : null}

      <Pressable onPress={onSubmit} style={{ padding: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" }}>
        <Text>Entrar</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/(auth)/register")} style={{ padding: 14, alignItems: "center" }}>
        <Text>Criar conta</Text>
      </Pressable>
    </View>
  );
}