import { loadingController } from '@ionic/core';
import { Toast } from '@capacitor/toast';

let loadingInstance = null;

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

export async function showToast(message, success = true) {
    await Toast.show({
        text: `${success ? '✅' : '❌'} ${message}`,
        duration: 'short',
        position: 'bottom',
    });
}