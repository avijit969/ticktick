import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { db } from '@/utils/db';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user } = db.useAuth();
    // Query the user to get real-time updates for imageURL
    const { data: userData } = db.useQuery(
        user ? { $users: { $: { where: { id: user.id } }, avatarImage: {} } } : null
    );

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const [uploading, setUploading] = useState(false);

    const currentUser = userData?.$users?.[0]; // Get the explicit user record

    const handleSignOut = async () => {
        await db.auth.signOut();
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0]);
        }
    };

    const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
        if (!user) return;
        setUploading(true);
        try {
            // 1. Upload to Instant Storage
            const response = await fetch(asset.uri);
            const blob = await response.blob();

            // Generate a unique filename
            const filename = `${user.id}/${Date.now()}.jpg`;
            const { data } = await db.storage.uploadFile(filename, blob);

            // 2. Update User Profile
            await db.transact(db.tx.$users[user.id].link({ avatarImage: data?.id }));

        } catch (error: any) {
            Alert.alert('Upload Failed', error.message);
        } finally {
            setUploading(false);
        }
    };
    // console.log(currentUser?.avatarImage?.url);
    const displayImage = currentUser?.avatarImage?.url;
    const displayName = currentUser?.email || user?.email;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={pickImage} disabled={uploading}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                            {uploading ? (
                                <ActivityIndicator color="#fff" />
                            ) : displayImage ? (
                                <Image source={{ uri: displayImage }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>
                                    {displayName?.charAt(0).toUpperCase() ?? '?'}
                                </Text>
                            )}
                            <View style={[styles.editBadge, { backgroundColor: theme.card }]}>
                                <Ionicons name="camera" size={16} color={theme.text} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.email, { color: theme.text }]}>{displayName}</Text>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.card, borderColor: theme.border }]}
                        onPress={handleSignOut}
                    >
                        <Ionicons name="log-out-outline" size={24} color={theme.danger} />
                        <Text style={[styles.buttonText, { color: theme.danger }]}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        flex: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
        marginTop: 48,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarImage: {
        width: 96,
        height: 96,
        borderRadius: 48,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    email: {
        fontSize: 20,
        fontWeight: '600',
    },
    section: {
        gap: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
