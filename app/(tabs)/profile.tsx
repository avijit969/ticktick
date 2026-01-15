import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { db } from '@/utils/db';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user } = db.useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const [uploading, setUploading] = useState(false);

    // Query user and their todos for stats
    const { data: userData } = db.useQuery(
        user ? {
            $users: { $: { where: { id: user.id } }, avatarImage: {} },
            todos: { $: { where: { 'owner.id': user.id } } }
        } : null
    );

    const currentUser = userData?.$users?.[0];
    const todos = userData?.todos ?? [];

    // Calculate Stats
    const totalTasks = todos.length;
    const completedTasks = todos.filter((t: any) => t.isCompleted).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
            const response = await fetch(asset.uri);
            const blob = await response.blob();
            const filename = `${user.id}/${Date.now()}.jpg`;
            const { data } = await db.storage.uploadFile(filename, blob);
            await db.transact(db.tx.$users[user.id].link({ avatarImage: data?.id }));
        } catch (error: any) {
            Alert.alert('Upload Failed', error.message);
        } finally {
            setUploading(false);
        }
    };

    const displayImage = currentUser?.avatarImage?.url;
    const displayName = currentUser?.email || user?.email;

    const StatCard = ({ label, value, icon, color }: { label: string, value: string | number, icon: keyof typeof Ionicons.glyphMap, color: string }) => (
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.icon }]}>{label}</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={pickImage} disabled={uploading} activeOpacity={0.8}>
                        <View style={[styles.avatarContainer, { borderColor: theme.card }]}>
                            {uploading ? (
                                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                                    <ActivityIndicator color="#fff" size="large" />
                                </View>
                            ) : displayImage ? (
                                <Image source={{ uri: displayImage }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                                    <Text style={styles.avatarText}>
                                        {displayName?.charAt(0).toUpperCase() ?? '?'}
                                    </Text>
                                </View>
                            )}
                            <View style={[styles.editBadge, { backgroundColor: theme.text }]}>
                                <Ionicons name="camera" size={14} color={theme.background} />
                            </View>
                        </View>
                    </TouchableOpacity>

                    <Text style={[styles.email, { color: theme.text }]}>{displayName}</Text>
                    <Text style={[styles.memberSince, { color: theme.icon }]}>Member</Text>
                </View>

                <View style={styles.statsGrid}>
                    <StatCard
                        label="Total Tasks"
                        value={totalTasks}
                        icon="layers"
                        color={theme.primary}
                    />
                    <StatCard
                        label="Completed"
                        value={completedTasks}
                        icon="checkmark-circle"
                        color="#10B981"
                    />
                    <StatCard
                        label="Pending"
                        value={pendingTasks}
                        icon="time"
                        color="#F59E0B"
                    />
                    <StatCard
                        label="Success Rate"
                        value={`${completionRate}%`}
                        icon="trending-up"
                        color="#8B5CF6"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.icon }]}>Settings</Text>

                    <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]}>
                        <View style={[styles.menuIcon, { backgroundColor: theme.inputBackground }]}>
                            <Ionicons name="notifications-outline" size={20} color={theme.text} />
                        </View>
                        <Text style={[styles.menuText, { color: theme.text }]}>Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.icon} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]}>
                        <View style={[styles.menuIcon, { backgroundColor: theme.inputBackground }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={theme.text} />
                        </View>
                        <Text style={[styles.menuText, { color: theme.text }]}>Privacy & Security</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.icon} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: theme.danger + '15' }]}
                        onPress={handleSignOut}
                    >
                        <Ionicons name="log-out-outline" size={20} color={theme.danger} />
                        <Text style={[styles.logoutText, { color: theme.danger }]}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 16,
    },
    avatarContainer: {
        marginBottom: 16,
        padding: 4,
        borderRadius: 60,
        borderWidth: 2,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
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
        borderWidth: 3,
        borderColor: 'white', // Should match background but simplistic here
    },
    email: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    memberSince: {
        fontSize: 14,
        opacity: 0.7,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        width: '48%', // Approx 2 columns
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 16,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
    }
});
