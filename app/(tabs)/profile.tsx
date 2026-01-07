import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { db } from '@/utils/db';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function ProfileScreen() {
    const { user } = db.useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const handleSignOut = async () => {
        await db.auth.signOut();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                        <Text style={styles.avatarText}>
                            {user?.email?.charAt(0).toUpperCase() ?? '?'}
                        </Text>
                    </View>
                    <Text style={[styles.email, { color: theme.text }]}>{user?.email}</Text>
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
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
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
