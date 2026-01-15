import TodoItem from '@/components/TodoItem';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { db } from '@/utils/db';
import { cancelReminder, scheduleRecurringReminder } from '@/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import { id } from '@instantdb/react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FolderDetailScreen() {
    const { id: folderId } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = db.useAuth();

    const { isLoading, error, data } = db.useQuery({
        folders: { $: { where: { id: folderId } } },
        todos: { $: { where: { 'folder.id': folderId } } }
    });

    const [isModalVisible, setModalVisible] = useState(false);
    const [newTodoText, setNewTodoText] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
    const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
    const [reminderInterval, setReminderInterval] = useState<number>(0);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const folder = data?.folders?.[0];

    const handleAddTodo = async () => {
        if (!newTodoText.trim() || !folderId) return;

        let reminderId: string | undefined;
        if (editingTodoId && editingReminderId) {
            await cancelReminder(editingReminderId);
        }

        if (reminderInterval > 0) {
            reminderId = await scheduleRecurringReminder(
                "Task Reminder",
                newTodoText,
                reminderInterval
            );
        }

        if (editingTodoId) {
            db.transact(
                db.tx.todos[editingTodoId].update({
                    text: newTodoText,
                    priority,
                    reminderInterval,
                    reminderId,
                })
            );
        } else {
            const todoId = id();
            const ops = [
                db.tx.todos[todoId].update({
                    text: newTodoText,
                    isCompleted: false,
                    createdAt: Date.now(),
                    priority,
                    reminderInterval,
                    reminderId,
                }),
                db.tx.todos[todoId].link({ folder: folderId }),
            ];

            if (user) {
                ops.push(db.tx.todos[todoId].link({ owner: user.id }));
            }

            db.transact(ops);
        }

        setNewTodoText('');
        setPriority('medium');
        setEditingTodoId(null);
        setEditingReminderId(null);
        setReminderInterval(0);
        setModalVisible(false);
    };

    const handleToggleTodo = async (todoId: string, isCompleted: boolean) => {
        const todo = data?.todos.find((t: any) => t.id === todoId);
        if (!todo) return;

        if (isCompleted) {
            if (todo.reminderId) {
                await cancelReminder(todo.reminderId);
                db.transact(db.tx.todos[todoId].update({ isCompleted, reminderId: null }));
                return;
            }
        } else {
            if (todo.reminderInterval) {
                const newReminderId = await scheduleRecurringReminder(
                    "Task Reminder",
                    todo.text,
                    todo.reminderInterval
                );
                db.transact(db.tx.todos[todoId].update({ isCompleted, reminderId: newReminderId }));
                return;
            }
        }

        db.transact(db.tx.todos[todoId].update({ isCompleted }));
    };

    const handleDeleteTodo = async (todoId: string) => {
        const todo = data?.todos.find((t: any) => t.id === todoId);
        if (todo?.reminderId) {
            await cancelReminder(todo.reminderId);
        }
        db.transact(db.tx.todos[todoId].delete());
    };

    const handleEditTodo = (todoId: string, text: string, priority?: "low" | "medium" | "high", reminderInterval?: number) => {
        const todo = data?.todos.find((t: any) => t.id === todoId);
        setNewTodoText(text);
        setPriority(priority || 'medium');
        setEditingTodoId(todoId);
        setEditingReminderId(todo?.reminderId || null);
        setReminderInterval(reminderInterval || 0);
        setModalVisible(true);
    }

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (error || !folder) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>{error ? error.message : 'Folder not found'}</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
                    <Text style={{ color: theme.primary, fontSize: 16 }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const todos = data?.todos ?? [];
    const sortedTodos = [...todos].sort((a, b) => b.createdAt - a.createdAt);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View style={[styles.folderBadge, { backgroundColor: folder.color || theme.primary }]}>
                        <Ionicons name="folder-open" size={16} color="#fff" />
                    </View>
                </View>
                <Text style={[styles.title, { color: theme.text }]}>{folder.name}</Text>
                <Text style={[styles.subtitle, { color: theme.icon }]}>
                    {todos.length} Tasks
                </Text>
            </View>

            <FlatList
                data={sortedTodos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TodoItem
                        todo={{
                            ...item,
                            priority: item.priority as "low" | "medium" | "high" | undefined
                        }}
                        onToggle={handleToggleTodo}
                        onDelete={handleDeleteTodo}
                        onEdit={handleEditTodo}
                    />
                )}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="clipboard-outline" size={64} color={theme.icon} />
                        <Text style={[styles.emptyText, { color: theme.icon }]}>No tasks in this folder</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary }]}
                onPress={() => {
                    setNewTodoText('');
                    setPriority('medium');
                    setEditingTodoId(null);
                    setReminderInterval(0);
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
                                {editingTodoId ? 'Edit Task' : 'New Task'}
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
                            placeholder="What needs to be done?"
                            placeholderTextColor={theme.icon}
                            value={newTodoText}
                            onChangeText={setNewTodoText}
                            autoFocus
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.priorityContainer}>
                            <Text style={[styles.label, { color: theme.text }]}>Priority:</Text>
                            <View style={styles.priorityOptions}>
                                {(['low', 'medium', 'high'] as const).map((p) => (
                                    <TouchableOpacity
                                        key={p}
                                        style={[
                                            styles.priorityButton,
                                            {
                                                borderColor: theme.border,
                                                backgroundColor: priority === p ? theme.primary : 'transparent'
                                            }
                                        ]}
                                        onPress={() => setPriority(p)}
                                    >
                                        <Text style={{
                                            color: priority === p ? '#fff' : theme.text,
                                            textTransform: 'capitalize'
                                        }}>
                                            {p}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.priorityContainer}>
                            <Text style={[styles.label, { color: theme.text }]}>Reminder:</Text>
                            <View style={styles.priorityOptions}>
                                {[
                                    { label: 'None', value: 0 },
                                    { label: "2m", value: 2 },
                                    { label: '30m', value: 30 },
                                    { label: '1h', value: 60 },
                                    { label: 'Daily', value: 1440 }
                                ].map((opt) => (
                                    <TouchableOpacity
                                        key={opt.label}
                                        style={[
                                            styles.priorityButton,
                                            {
                                                borderColor: theme.border,
                                                backgroundColor: reminderInterval === opt.value ? theme.primary : 'transparent'
                                            }
                                        ]}
                                        onPress={() => setReminderInterval(opt.value)}
                                    >
                                        <Text style={{
                                            color: reminderInterval === opt.value ? '#fff' : theme.text,
                                        }}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: theme.primary }]}
                            onPress={handleAddTodo}
                        >
                            <Text style={styles.addButtonText}>
                                {editingTodoId ? 'Update Task' : 'Create Task'}
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
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    folderBadge: {
        padding: 6,
        borderRadius: 8,
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
        paddingBottom: 100, // Space for FAB
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
        fontSize: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    priorityContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    priorityOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    priorityButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
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
