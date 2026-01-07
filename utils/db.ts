import { init } from "@instantdb/react-native";
import schema from "../instant.schema";

const APP_ID = process.env.EXPO_PUBLIC_INSTANT_APP_ID;

if (!APP_ID) {
  throw new Error("EXPO_PUBLIC_INSTANT_APP_ID is not defined");
}

export const db = init({ appId: APP_ID, schema });
