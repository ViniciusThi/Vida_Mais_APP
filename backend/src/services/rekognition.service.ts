import {
  RekognitionClient,
  IndexFacesCommand,
  SearchFacesByImageCommand,
  DeleteFacesCommand,
} from '@aws-sdk/client-rekognition';

const client = new RekognitionClient({
  region: process.env.AWS_REGION || 'sa-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const COLLECTION_ID =
  process.env.AWS_REKOGNITION_COLLECTION_ID || 'vida-mais-faces';

const MIN_SIMILARITY = 95;

/**
 * Indexa uma face na collection do Rekognition.
 * @param imageBase64 - Base64 puro (sem prefixo data-URI)
 * @param externalUserId - UUID do usuário Prisma (usado como ExternalImageId)
 * @returns FaceId gerado pelo Rekognition
 */
export async function indexFace(
  imageBase64: string,
  externalUserId: string
): Promise<string> {
  const response = await client.send(
    new IndexFacesCommand({
      CollectionId: COLLECTION_ID,
      Image: { Bytes: Buffer.from(imageBase64, 'base64') },
      ExternalImageId: externalUserId,
      MaxFaces: 1,
      QualityFilter: 'AUTO',
      DetectionAttributes: [],
    })
  );

  const faceId = response.FaceRecords?.[0]?.Face?.FaceId;
  if (!faceId) throw new Error('FACE_NOT_DETECTED');
  return faceId;
}

/**
 * Busca uma face na collection pelo Rekognition.
 * @param imageBase64 - Base64 puro (sem prefixo data-URI)
 * @returns userId (Prisma id) e similaridade, ou null se não encontrado
 */
export async function searchFace(
  imageBase64: string
): Promise<{ userId: string; similarity: number } | null> {
  const response = await client.send(
    new SearchFacesByImageCommand({
      CollectionId: COLLECTION_ID,
      Image: { Bytes: Buffer.from(imageBase64, 'base64') },
      MaxFaces: 1,
      FaceMatchThreshold: MIN_SIMILARITY,
      QualityFilter: 'AUTO',
    })
  );

  const best = response.FaceMatches?.[0];
  if (
    !best ||
    (best.Similarity ?? 0) < MIN_SIMILARITY ||
    !best.Face?.ExternalImageId
  ) {
    return null;
  }

  return { userId: best.Face.ExternalImageId, similarity: best.Similarity! };
}

/**
 * Remove uma face da collection pelo FaceId.
 */
export async function deleteFace(faceId: string): Promise<void> {
  await client.send(
    new DeleteFacesCommand({
      CollectionId: COLLECTION_ID,
      FaceIds: [faceId],
    })
  );
}
