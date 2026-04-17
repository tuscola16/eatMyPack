import { Alert, Platform } from 'react-native';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

export function confirmDestructive({
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
}: ConfirmOptions): void {
  if (Platform.OS === 'web') {
    const promptText = message ? `${title}\n\n${message}` : title;
    if (typeof window !== 'undefined' && window.confirm(promptText)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
