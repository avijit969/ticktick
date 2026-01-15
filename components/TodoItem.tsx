import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Todo {
    id: string;
    text: string;
    isCompleted: boolean;
    priority?: "low" | "medium" | "high";
    createdAt: number;
    reminderId?: string;
    reminderInterval?: number;
}

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: string, isCompleted: boolean) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, text: string, priority?: "low" | "medium" | "high", reminderInterval?: number) => void
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const getPriorityColor = () => {
        switch (todo.priority) {
            case 'high': return theme.danger;
            case 'medium': return '#F59E0B'; // Amber 500
            case 'low': return theme.secondary;
            default: return theme.icon;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.card, borderColor: 'rgba(150,150,150,0.1)' }]}>
            <TouchableOpacity
                onPress={() => onToggle(todo.id, !todo.isCompleted)}
                style={styles.checkboxContainer}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons
                    name={todo.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                    size={26}
                    color={todo.isCompleted ? theme.primary : theme.icon}
                />
            </TouchableOpacity>

            <View style={styles.textContainer}>
                <Text
                    style={[
                        styles.text,
                        {
                            color: todo.isCompleted ? theme.icon : theme.text,
                            textDecorationLine: todo.isCompleted ? 'line-through' : 'none'
                        }
                    ]}
                >
                    {todo.text}
                </Text>

                <View style={styles.metaContainer}>
                    {todo.priority && (
                        <View style={[styles.badge, { backgroundColor: getPriorityColor() + '15' }]}>
                            <Text style={[styles.badgeText, { color: getPriorityColor() }]}>{todo.priority}</Text>
                        </View>
                    )}
                    {todo.reminderInterval && !todo.isCompleted && (
                        <View style={[styles.badge, { backgroundColor: theme.primary + '15' }]}>
                            <Ionicons name="alarm-outline" size={12} color={theme.primary} style={{ marginRight: 4 }} />
                            <Text style={[styles.badgeText, { color: theme.primary }]}>Remind</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity
                    onPress={() => onEdit(todo.id, todo.text, todo.priority, todo.reminderInterval)}
                    style={[styles.actionButton, { backgroundColor: theme.border + '40' }]}
                >
                    <Ionicons name="pencil-outline" size={18} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onDelete(todo.id)}
                    style={[styles.actionButton, { backgroundColor: theme.danger + '20' }]}
                >
                    <Ionicons name="trash-outline" size={18} color={theme.danger} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Align to top for multiline text
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        // Softer shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    checkboxContainer: {
        marginRight: 16,
        marginTop: 2,
    },
    textContainer: {
        flex: 1,
        gap: 8,
    },
    text: {
        fontSize: 17,
        fontWeight: '500',
        lineHeight: 24,
    },
    metaContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    actionContainer: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 12,
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
