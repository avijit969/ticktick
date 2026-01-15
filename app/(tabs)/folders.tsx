import { Ionicons } from '@expo/vector-icons';
import { id } from '@instantdb/react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { db } from '@/utils/db';

const COLORS = [
    '#6366F1', // Indigo
    '#EF4444', // Red
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#84CC16', // Lime
];

export default function FoldersScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const { user } = db.useAuth();

    const { isLoading, error, data } = db.useQuery(
        user ? { folders: { $: { where: { 'owner.id': user.id } } } } : null
    );

    const [isModalVisible, setModalVisible] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

    const handleAddFolder = () => {
        if (!newFolderName.trim()) return;

        if (editingFolderId) {
            db.transact(
                db.tx.folders[editingFolderId].update({
                    name: newFolderName,
                    color: selectedColor,
                })
            );
        } else {
            const folderId = id();
            const ops = [
                db.tx.folders[folderId].update({
                    name: newFolderName,
                    color: selectedColor,
                })
            ];

            if (user) {
                ops.push(db.tx.folders[folderId].link({ owner: user.id }));
            }

            db.transact(ops);
        }

        setNewFolderName('');
        setSelectedColor(COLORS[0]);
        setEditingFolderId(null);
        setModalVisible(false);
    };

    const handleDeleteFolder = (folderId: string) => {
        // Note: This cascading delete should be handled by schema 'onDelete: cascade' if configured,
        // otherwise we might need to manually clean up todos or links.
        // Based on schema: foldersOwner has onDelete: cascade (owner -> folders).
        // todosFolder has onDelete: cascade (folder -> todos).
        // So usually deleting folder should be fine.

        db.transact(db.tx.folders[folderId].delete());
    };

    const openEditModal = (folder: any) => {
        setNewFolderName(folder.name);
        setSelectedColor(folder.color || COLORS[0]);
        setEditingFolderId(folder.id);
        setModalVisible(true);
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>Error: {error.message}</Text>
            </View>
        );
    }

    const folders = data?.folders ?? [];
    // Sort by creation time or name? Schema doesn't have createdAt for folders.
    // We can sort by name for now.
    const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Folders</Text>
                <Text style={[styles.subtitle, { color: theme.icon }]}>
                    {sortedFolders.length} Lists
                </Text>
            </View>

            <FlatList
                data={sortedFolders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.item, { backgroundColor: theme.card }]}
                        onPress={() => {
                            // Navigate to a folder detail view or filter todos by folder
                            // For now, let's just open edit modal to show interaction
                            openEditModal(item);
                        }}
                    >
                        <View style={styles.itemLeft}>
                            <View style={[styles.colorDot, { backgroundColor: item.color || theme.primary }]} />
                            <Text style={[styles.itemText, { color: theme.text }]}>{item.name}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteFolder(item.id)}>
                            <Ionicons name="trash-outline" size={20} color={theme.icon} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="folder-open-outline" size={64} color={theme.icon} />
                        <Text style={[styles.emptyText, { color: theme.icon }]}>No folders yet</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary }]}
                onPress={() => {
                    setNewFolderName('');
                    setSelectedColor(COLORS[0]);
                    setEditingFolderId(null);
                    setModalVisible(true);
                }}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContainer}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                {editingFolderId ? 'Edit Folder' : 'New Folder'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.icon} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.inputBackground,
                                    color: theme.text,
                                    borderColor: theme.border
                                }
                            ]}
                            placeholder="Folder Name"
                            placeholderTextColor={theme.icon}
                            value={newFolderName}
                            onChangeText={setNewFolderName}
                            autoFocus
                        />

                        <View style={styles.colorsContainer}>
                            <Text style={[styles.label, { color: theme.text }]}>Color:</Text>
                            <View style={styles.colorOptions}>
                                {COLORS.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorButton,
                                            { backgroundColor: color },
                                            selectedColor === color && styles.colorButtonSelected
                                        ]}
                                        onPress={() => setSelectedColor(color)}
                                    >
                                        {selectedColor === color && (
                                            <Ionicons name="checkmark" size={16} color="#fff" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: theme.primary }]}
                            onPress={handleAddFolder}
                        >
                            <Text style={styles.addButtonText}>
                                {editingFolderId ? 'Update Folder' : 'Create Folder'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    itemText: {
        fontSize: 16,
        fontWeight: '500',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 48,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    input: {
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    colorsContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    colorOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorButtonSelected: {
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    addButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 64,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
    }
});
