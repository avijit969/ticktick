import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Todo {
    id: string;
    text: string;
    isCompleted: boolean;
    priority?: string;
    createdAt: number;
}

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: string, isCompleted: boolean) => void;
    onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
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
        <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity
                onPress={() => onToggle(todo.id, !todo.isCompleted)}
                style={styles.checkboxContainer}
            >
                <Ionicons
                    name={todo.isCompleted ? 'checkbox' : 'square-outline'}
                    size={24}
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
                {todo.priority && (
                    <View style={[styles.badge, { backgroundColor: getPriorityColor() + '20' }]}>
                        <Text style={[styles.badgeText, { color: getPriorityColor() }]}>{todo.priority}</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity onPress={() => onDelete(todo.id)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color={theme.danger} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    checkboxContainer: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: '500',
    },
    deleteButton: {
        padding: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    }
});
