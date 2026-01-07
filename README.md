# TickTick 📝

A modern, real-time reminder application built with **React Native (Expo)** and **InstantDB**. Experience seamless synchronization, magic code authentication, and a sleek user interface.

![TickTick Banner](https://via.placeholder.com/1200x600/4f46e5/ffffff?text=TickTick+Reminders)

## ✨ Features

*   **Real-time Sync**: Todos update instantly across all connected devices using [InstantDB](https://instantdb.com).
*   **Magic Code Auth**: Secure and passwordless login via Email Magic Codes.
*   **Modern UI**: Beautiful Dark Mode aesthetics with a Slate & Indigo color palette.
*   **Profile Management**: Upload and update your profile picture with ease.
*   **Crucial Todo Features**:
    *   Add, complete, and delete tasks.
    *   Set priorities (High, Medium, Normal).
    *   Filter your own personal tasks.

## 🛠️ Tech Stack

*   **Frontend**: React Native, Expo, Expo Router
*   **Backend & Database**: InstantDB (Real-time with local first)
*   **Storage**: InstantDB Storage (for Profile Pictures)


## 🚀 Getting Started

### Prerequisites

*   Node.js (LTS recommended)
*   npm or bun
*   Expo Go app on your mobile device (or an Android/iOS Simulator)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/avijit969/ticktick.git
    cd ticktick
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory (if it doesn't exist) and add your InstantDB App ID.
    ```env
    EXPO_PUBLIC_INSTANT_APP_ID=your_instantdb_app_id
    ```
    > You can get your App ID from the [InstantDB Dashboard](https://instantdb.com/dash).

4.  **Start the App**
    ```bash
    npx expo start
    ```
    Scan the QR code with your phone or press `a` for Android Emulator / `i` for iOS Simulator.

## 🗄️ Database & Permissions

This project uses **InstantDB** for backend logic.

*   **Schema**: Defined in `instant.schema.ts`. Includes `todos` and `$users` (with `$files` relation).
*   **Permissions**: Defined in `instant.perms.ts`. Secured so users can only access their own data.

### Deploying Schema & Perms
If you are setting up your own InstantDB backend:
```bash
# Push Schema
npx instant-cli push schema

# Push Permissions
npx instant-cli push perms
```

## 📱 Screens

| Home Screen | Profile Screen | Auth Screen |
|:---:|:---:|:---:|
| List your tasks, prioritize them, and mark as done. | Manage your account and update your avatar. | Simple email login. |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
