import * as ImageManipulator from 'expo-image-manipulator';
import { SaveFormat } from 'expo-image-manipulator';
import { CameraView } from 'expo-camera';
import { RefObject } from 'react';

/**
 * Captura uma foto com a câmera, redimensiona para 640px de largura e
 * retorna a string base64 pura (sem prefixo "data:image/jpeg;base64,").
 * Tamanho resultante: ~60-120 KB — bem abaixo do limite de 5 MB do Rekognition.
 */
export async function captureAndResize(
  cameraRef: RefObject<CameraView>
): Promise<string> {
  if (!cameraRef.current) throw new Error('Câmera não está pronta');

  const photo = await cameraRef.current.takePictureAsync({
    quality: 0.9,
    base64: false,
    skipProcessing: true,
  });

  const result = await ImageManipulator.manipulateAsync(
    photo.uri,
    [{ resize: { width: 640 } }],
    { compress: 0.8, format: SaveFormat.JPEG, base64: true }
  );

  if (!result.base64) throw new Error('Falha ao codificar imagem');
  return result.base64;
}
