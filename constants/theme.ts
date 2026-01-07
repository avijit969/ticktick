/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    tint: '#6366F1',
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#6366F1',
    card: '#FFFFFF',
    primary: '#6366F1',
    secondary: '#10B981',
    danger: '#EF4444',
    border: '#E2E8F0',
    inputBackground: '#F1F5F9',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    tint: '#6366F1',
    icon: '#94A3B8',
    tabIconDefault: '#475569',
    tabIconSelected: '#6366F1',
    card: '#1E293B',
    primary: '#6366F1',
    secondary: '#10B981',
    danger: '#EF4444',
    border: '#334155',
    inputBackground: '#1E293B',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
