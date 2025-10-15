/**
 * Validation utilities
 */

import { SupportedCoverMimeType } from '../types';

/**
 * Valida se o MIME type é suportado para capa
 */
export function isSupportedCoverMimeType(mimeType: string): mimeType is SupportedCoverMimeType {
  const supportedTypes: SupportedCoverMimeType[] = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/svg+xml',
  ];
  return supportedTypes.includes(mimeType as SupportedCoverMimeType);
}

/**
 * Valida se o arquivo é um PDF
 */
export function isPdfFile(filename: string): boolean {
  return filename.toLowerCase().endsWith('.pdf');
}

/**
 * Valida se o arquivo é uma imagem
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return imageExtensions.includes(ext);
}

/**
 * Valida altura do rodapé
 */
export function isValidFooterHeight(height: number): boolean {
  return height >= 0 && height <= 200 && Number.isInteger(height);
}

/**
 * Sanitiza nome de arquivo
 */
export function sanitizeFilename(filename: string): string {
  // Remove caracteres perigosos e mantém apenas alfanuméricos, pontos, hífens e underscores
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Valida tamanho de arquivo
 */
export function isValidFileSize(sizeInBytes: number, maxSizeInBytes: number = 100 * 1024 * 1024): boolean {
  return sizeInBytes > 0 && sizeInBytes <= maxSizeInBytes;
}
