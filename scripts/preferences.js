import { Preferences } from '@capacitor/preferences';

export async function loadTheme() {
    const { value: theme } = await Preferences.get({ key: 'theme' });
    const { value: lastSystemTheme } = await Preferences.get({ key: 'lastSystemTheme' });

    return { theme, lastSystemTheme };
}

export async function setPreferedTheme(value, system) {
    await Preferences.set({ key: 'theme', value: value });
    await Preferences.set({ key: 'lastSystemTheme', value: system });
}