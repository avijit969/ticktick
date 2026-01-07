import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { db } from '../utils/db';

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const handleSendCode = async () => {
        if (!email) return Alert.alert('Error', 'Please enter your email');
        setLoading(true);
        try {
            await db.auth.sendMagicCode({ email });
            setStep('code');
        } catch (error: any) {
            Alert.alert('Error', error.body?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!code) return Alert.alert('Error', 'Please enter the code');
        setLoading(true);
        try {
            await db.auth.signInWithMagicCode({ email, code });
            // Navigation is handled by layout effect usually, but we can push
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Error', error.body?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Ionicons name="checkmark-done-circle" size={64} color={theme.primary} />
                    <Text style={[styles.title, { color: theme.text }]}>TickTick</Text>
                    <Text style={[styles.subtitle, { color: theme.icon }]}>
                        Master your day, every day.
                    </Text>
                </View>

                <View style={styles.form}>
                    {step === 'email' ? (
                        <>
                            <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.inputBackground,
                                        color: theme.text,
                                        borderColor: theme.border,
                                    },
                                ]}
                                placeholder="you@example.com"
                                placeholderTextColor={theme.icon}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.primary }]}
                                onPress={handleSendCode}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Continue with Email</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={[styles.label, { color: theme.text }]}>
                                Enter the code sent to {email}
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.inputBackground,
                                        color: theme.text,
                                        borderColor: theme.border,
                                        textAlign: 'center',
                                        letterSpacing: 4,
                                    },
                                ]}
                                placeholder="123456"
                                placeholderTextColor={theme.icon}
                                value={code}
                                onChangeText={setCode}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.primary }]}
                                onPress={handleVerifyCode}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Verify Code</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setStep('email')}
                                style={styles.backButton}
                            >
                                <Text style={[styles.backText, { color: theme.icon }]}>
                                    Wrong email? Go back
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 16,
    },
    subtitle: {
        fontSize: 16,
        marginTop: 8,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    button: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    backText: {
        fontSize: 14,
    },
});
