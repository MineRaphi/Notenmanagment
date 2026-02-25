import { loadingController } from '@ionic/core';
import { Toast } from '@capacitor/toast';

let loadingInstance = null;
const ionContent = document.querySelector('ion-content');

export async function showLoading() {
    loadingInstance = await loadingController.create({
        message: 'Loading...',
        spinner: 'crescent',
        translucent: true,
        backdropDismiss: false,
    });
    await loadingInstance.present();
}

export async function hideLoading() {
    if (loadingInstance) {
        await loadingInstance.dismiss();
        loadingInstance = null;
    }
}

export async function showToast(message, success = true, position = 'bottom') {
    await Toast.show({
        text: `${success ? '✅' : '❌'} ${message}`,
        duration: 'short',
        position: position,
        keyboardAvoid: true,
    });
}

export function enableScroll() {
    ionContent.style.overflowY = 'auto';
}

export function disableScroll() {
    ionContent.style.overflowY = 'hidden';
}

export async function changeTheme(theme) {
    if (theme == "dark") {
        document.documentElement.classList.add("dark");
    }
    else if (theme == "light") {
        document.documentElement.classList.remove("dark");
    }
    else {
        document.documentElement.classList.toggle("dark");
    }
}