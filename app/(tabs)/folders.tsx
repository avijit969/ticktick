import { Ionicons } from '@expo/vector-icons';
import { id } from '@instantdb/react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useAlert } from '@/context/AlertContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { db } from '@/utils/db';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GAP = 16;
const ITEM_WIDTH = (width - 32 - GAP) / COLUMN_COUNT;

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
        user ? {
            folders: {
                $: { where: { 'owner.id': user.id } },
                todos: {}
            }
        } : null
    );

    const [isModalVisible, setModalVisible] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

    const { showAlert } = useAlert();

    const handleAddFolder = () => {
        if (!newFolderName.trim()) return;

        const now = Date.now();
        if (editingFolderId) {
            db.transact(
                db.tx.folders[editingFolderId].update({
                    name: newFolderName,
                    color: selectedColor,
                    updatedAt: now,
                })
            );
        } else {
            const folderId = id();
            const ops = [
                db.tx.folders[folderId].update({
                    name: newFolderName,
                    color: selectedColor,
                    createdAt: now,
                    updatedAt: now,
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
        showAlert({
            title: 'Delete Folder',
            message: 'Are you sure you want to delete this folder? All tasks inside will be deleted.',
            type: 'warning',
            confirmText: 'Delete',
            onConfirm: () => {
                db.transact(db.tx.folders[folderId].delete());
            }
        });
    };

    const openEditModal = (folder: any) => {
        setNewFolderName(folder.name);
        setSelectedColor(folder.color || COLORS[0]);
        setEditingFolderId(folder.id);
        setModalVisible(true);
    };

    const toggleViewMode = () => {
        setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'));
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
    const sortedFolders = [...folders].sort((a, b) => {
        const timeA = a.updatedAt || a.createdAt || 0;
        const timeB = b.updatedAt || b.createdAt || 0;
        if (timeB !== timeA) return timeB - timeA;
        return a.name.localeCompare(b.name);
    });

    const renderItem = ({ item }: { item: any }) => {
        const todoCount = item.todos?.length || 0;

        if (viewMode === 'grid') {
            return (
                <Animated.View
                    layout={Layout.springify()}
                    entering={FadeIn}
                    style={{ width: ITEM_WIDTH, marginBottom: GAP }}
                >
                    <TouchableOpacity
                        style={[styles.gridItem, { backgroundColor: theme.card }]}
                        onPress={() => router.push(`/folder/${item.id}` as any)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.gridHeader, { backgroundColor: item.color || theme.primary }]}>
                            <Ionicons name="folder-open" size={24} color="#fff" />
                            <TouchableOpacity
                                onPress={() => openEditModal(item)}
                                style={styles.gridEditBtn}
                            >
                                <Ionicons name="ellipsis-horizontal" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.gridContent}>
                            <Text style={[styles.gridTitle, { color: theme.text }]} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <Text style={[styles.gridSubtitle, { color: theme.icon }]}>
                                {todoCount} {todoCount === 1 ? 'Task' : 'Tasks'}
                            </Text>

                            <View style={styles.gridFooter}>
                                <Text style={[styles.gridDate, { color: theme.icon }]}>
                                    {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Just now'}
                                </Text>
                                <TouchableOpacity onPress={() => handleDeleteFolder(item.id)}>
                                    <Ionicons name="trash-outline" size={16} color={theme.icon} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            );
        }

        return (
            <Animated.View layout={Layout.springify()} entering={FadeIn}>
                <TouchableOpacity
                    style={[styles.listItem, { backgroundColor: theme.card }]}
                    onPress={() => router.push(`/folder/${item.id}` as any)}
                    activeOpacity={0.7}
                >
                    <View style={styles.listItemLeft}>
                        <View style={[styles.listIconContainer, { backgroundColor: (item.color || theme.primary) + '20' }]}>
                            <Ionicons name="folder" size={24} color={item.color || theme.primary} />
                        </View>
                        <View style={styles.listItemTextContainer}>
                            <Text style={[styles.listItemTitle, { color: theme.text }]} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <Text style={[styles.listItemSubtitle, { color: theme.icon }]}>
                                {todoCount} {todoCount === 1 ? 'Task' : 'Tasks'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.listItemActions}>
                        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
                            <Ionicons name="pencil-outline" size={20} color={theme.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteFolder(item.id)} style={styles.actionBtn}>
                            <Ionicons name="trash-outline" size={20} color={theme.icon} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: theme.text }]}>Folders</Text>
                    <Text style={[styles.subtitle, { color: theme.icon }]}>
                        {sortedFolders.length} Lists
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={toggleViewMode}
                    style={[styles.viewToggleBtn, { backgroundColor: theme.card }]}
                >
                    <Ionicons
                        name={viewMode === 'grid' ? 'list' : 'grid'}
                        size={20}
                        color={theme.text}
                    />
                </TouchableOpacity>
            </View>

            <FlatList
                key={viewMode}
                data={sortedFolders}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                style={styles.list}
                contentContainerStyle={[
                    styles.listContent,
                    viewMode === 'grid' && styles.gridListContent
                ]}
                numColumns={viewMode === 'grid' ? 2 : 1}
                columnWrapperStyle={viewMode === 'grid' ? { gap: GAP } : undefined}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    viewToggleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(150,150,150,0.2)',
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    gridListContent: {
        paddingHorizontal: 16,
    },
    // List Item Styles
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(150,150,150,0.1)',
    },
    listItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    listIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listItemTextContainer: {
        flex: 1,
    },
    listItemTitle: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
    },
    listItemSubtitle: {
        fontSize: 14,
    },
    listItemActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        padding: 8,
    },
    // Grid Item Styles
    gridItem: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(150,150,150,0.1)',
        height: 180,
        flex: 1,
        flexDirection: 'column'
    },
    gridHeader: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 80,
    },
    gridEditBtn: {
        padding: 4,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
    },
    gridContent: {
        padding: 16,
        flex: 1,
        justifyContent: 'space-between',
    },
    gridTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    gridSubtitle: {
        fontSize: 14,
    },
    gridFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    gridDate: {
        fontSize: 12,
    },

    // FAB & Modal
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8, // Android
        shadowColor: '#000', // iOS
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
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
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
        fontSize: 24,
        fontWeight: 'bold',
    },
    input: {
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 18,
        borderWidth: 1,
        marginBottom: 24,
    },
    colorsContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    colorOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    colorButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorButtonSelected: {
        borderWidth: 3,
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
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
    }
});
