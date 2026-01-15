// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react-native";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      type: i.string().optional(),
    }),
    todos: i.entity({
      text: i.string(),
      isCompleted: i.boolean(),
      createdAt: i.number(),
      dueDate: i.number().optional(),
      priority: i.string().optional(),
      reminderId: i.string().optional(),
      reminderInterval: i.number().optional(),
    }),
    folders: i.entity({
      name: i.string(),
      color: i.string().optional(),
      createdAt: i.number().optional(),
      updatedAt: i.number().optional(),
    }),
  },
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    todosOwner: {
      forward: {
        on: "todos",
        has: "one",
        label: "owner",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "todos",
      },
    },
    usersImage: {
      forward: {
        on: "$users",
        has: "one",
        label: "avatarImage",
        onDelete: "cascade",
      },
      reverse: {
        on: "$files",
        has: "one",
        label: "user",
      },
    },
    foldersOwner: {
      forward: {
        on: "folders",
        has: "one",
        label: "owner",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "folders",
      },
    },
    todosFolder: {
      forward: {
        on: "todos",
        has: "one",
        label: "folder",
        onDelete: "cascade",
      },
      reverse: {
        on: "folders",
        has: "many",
        label: "todos",
      },
    },
  },
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
