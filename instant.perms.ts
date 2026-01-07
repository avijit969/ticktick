// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react-native";

const rules = {
  todos: {
    allow: {
      view: "auth.id != null",
      create: "auth.id != null",
      update: "auth.id != null",
      delete: "auth.id != null",
    },
  },
  $files: {
    allow: {
      view: "true",
      create: "auth.id != null",
    },
  },
  $users: {
    allow: {
      update: "auth.id == data.id",
    },
  },
} satisfies InstantRules;

export default rules;
