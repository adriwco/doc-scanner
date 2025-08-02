// src/hooks/useCameraPermission.ts
import { useState, useEffect, useCallback } from 'react';
import { Camera } from 'expo-camera';
import { Linking } from 'react-native';

interface CameraPermissionState {
  hasPermission: boolean | null;
  requestPermission: () => Promise<void>;
}

export const useCameraPermission = (): CameraPermissionState => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.getCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const requestPermission = useCallback(async () => {
    const { status, canAskAgain } =
      await Camera.requestCameraPermissionsAsync();

    if (status === 'granted') {
      setHasPermission(true);
      return;
    }

    setHasPermission(false);

    if (!canAskAgain) {
      // Opcional: Informar o usuário que ele precisa habilitar manualmente
      // e talvez oferecer um botão para abrir as configurações do app.
      Linking.openSettings();
    }
  }, []);

  return { hasPermission, requestPermission };
};
