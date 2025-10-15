/**
 * Shared TypeScript types and interfaces
 */

/**
 * Resultado do processamento de um único arquivo PDF
 */
export interface ProcessedFile {
  /** Nome do arquivo PDF */
  name: string;
  /** Número de páginas no PDF original */
  originalPages: number;
  /** Número de páginas no PDF processado */
  finalPages: number;
  /** Se o processamento foi bem-sucedido */
  success: boolean;
  /** Mensagem de erro, se houver */
  error?: string;
}

/**
 * Resultado do processamento de PDF
 */
export interface ProcessResult {
  /** PDF processado em bytes */
  processedPdf: Uint8Array;
  /** Número de páginas originais */
  originalPages: number;
  /** Número de páginas finais */
  finalPages: number;
}

/**
 * Arquivo PDF extraído do ZIP
 */
export interface PdfFile {
  /** Nome do arquivo */
  name: string;
  /** Dados do PDF em Buffer */
  data: Buffer;
}

/**
 * Tipos MIME suportados para capa
 */
export type SupportedCoverMimeType =
  | 'application/pdf'
  | 'image/png'
  | 'image/jpeg'
  | 'image/jpg'
  | 'image/svg+xml';

/**
 * Configuração de processamento
 */
export interface ProcessConfig {
  /** Altura do rodapé a ser removido em pixels */
  footerHeightPx: number;
}

/**
 * Request body para processamento
 */
export interface ProcessRequest {
  /** Arquivo ZIP com PDFs */
  filesZip: Express.Multer.File;
  /** Arquivo de capa (PDF ou imagem) */
  cover: Express.Multer.File;
  /** Altura do rodapé (opcional, padrão 10) */
  footerHeightPx?: number;
}

/**
 * Informações de dimensão de página
 */
export interface PageDimensions {
  /** Largura em pontos */
  width: number;
  /** Altura em pontos */
  height: number;
}

/**
 * Estatísticas de processamento
 */
export interface ProcessStats {
  /** Total de arquivos processados */
  totalFiles: number;
  /** Arquivos processados com sucesso */
  successCount: number;
  /** Arquivos que falharam */
  failureCount: number;
  /** Tempo total de processamento em ms */
  processingTimeMs?: number;
}

/**
 * Opções de conversão de imagem
 */
export interface ImageConversionOptions {
  /** Largura alvo da página */
  targetWidth?: number;
  /** Altura alvo da página */
  targetHeight?: number;
  /** Manter proporção */
  maintainAspectRatio?: boolean;
}

/**
 * Erro customizado para processamento de PDF
 */
export class PdfProcessingError extends Error {
  constructor(
    message: string,
    public readonly fileName?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'PdfProcessingError';
  }
}

/**
 * Erro customizado para conversão de imagem
 */
export class ImageConversionError extends Error {
  constructor(
    message: string,
    public readonly mimeType?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ImageConversionError';
  }
}
