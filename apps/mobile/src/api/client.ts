import axios from "axios";
import Constants from "expo-constants";

const apiUrl =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ??
  "http://localhost:3333";

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 15000,
});


//Importante: no celular físico, localhost não funciona. 
// Depois de rodar o servidor, ajusta com IP da máquina (http://192.168.18.154:3333)