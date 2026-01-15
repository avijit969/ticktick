import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    type?: AlertType;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
}

const { width } = Dimensions.get('window');

export default function CustomAlert({
    visible,
    title,
    message,
    type = 'info',
    onClose,
    onConfirm,
    confirmText = 'OK',
    cancelText = 'Cancel'
}: CustomAlertProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    if (!visible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            case 'warning': return 'warning';
            case 'confirm': return 'help-circle';
            default: return 'information-circle';
        }
    };

    const getColor = () => {
        switch (type) {
            case 'success': return '#10B981';
            case 'error': return theme.danger;
            case 'warning': return '#F59E0B';
            case 'confirm': return theme.primary;
            default: return theme.primary;
        }
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    entering={ZoomIn.duration(200)}
                    style={[styles.container, { backgroundColor: theme.card }]}
                >
                    <View style={[styles.iconContainer, { backgroundColor: getColor() + '20' }]}>
                        <Ionicons name={getIcon()} size={32} color={getColor()} />
                    </View>

                    <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: theme.icon }]}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        {(type === 'confirm' || type === 'warning') && (
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton, { borderColor: theme.border }]}
                                onPress={onClose}
                            >
                                <Text style={[styles.buttonText, { color: theme.text }]}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                { backgroundColor: getColor() }
                            ]}
                            onPress={() => {
                                if (onConfirm) onConfirm();
                                onClose();
                            }}
                        >
                            <Text style={[styles.buttonText, { color: '#fff' }]}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        width: Math.min(width - 48, 340),
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    confirmButton: {

    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    }
});
