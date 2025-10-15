import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

interface ProcessedFile {
  name: string;
  originalPages: number;
  finalPages: number;
  success: boolean;
  error?: string;
}

function App() {
  const [filesZip, setFilesZip] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [footerHeightPx, setFooterHeightPx] = useState<number>(40);
  const [headerHeightPx, setHeaderHeightPx] = useState<number>(80);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [report, setReport] = useState<ProcessedFile[]>([]);
  const [error, setError] = useState<string>('');

  const CHUNK_SIZE = 30 * 1024 * 1024; // 30MB

  // Upload file in chunks if larger than 30MB
  const uploadFileInChunks = async (file: File, fieldName: string): Promise<string> => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    if (totalChunks === 1) {
      // Small file, upload directly
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fieldName', fieldName);
      formData.append('originalName', file.name);

      const response = await axios.post('/api/upload-single', formData);
      return response.data.fileId;
    }

    // Large file, upload in chunks
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('fileId', fileId);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fieldName', fieldName);
      formData.append('originalName', file.name);

      setUploadProgress(`Uploading ${fieldName}: ${chunkIndex + 1}/${totalChunks} chunks (${Math.round((chunkIndex + 1) / totalChunks * 100)}%)`);

      await axios.post('/api/upload-chunk', formData);
    }

    return fileId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setReport([]);
    setUploadProgress('');

    if (!filesZip || !cover) {
      setError('Por favor, selecione os arquivos ZIP e capa');
      return;
    }

    setProcessing(true);

    try {
      // Upload ZIP file (possibly in chunks)
      setUploadProgress('Uploading ZIP file...');
      const zipFileId = await uploadFileInChunks(filesZip, 'filesZip');

      // Upload cover file (possibly in chunks)
      setUploadProgress('Uploading cover file...');
      const coverFileId = await uploadFileInChunks(cover, 'cover');

      // Process the uploaded files
      setUploadProgress('Processing PDFs...');
      const response = await axios.post('/api/process-uploaded', {
        zipFileId,
        coverFileId,
        footerHeightPx,
        headerHeightPx,
      }, {
        responseType: 'blob',
      });

      // Get report from headers
      const reportHeader = response.headers['x-process-report'];
      if (reportHeader) {
        const parsedReport = JSON.parse(reportHeader);
        setReport(parsedReport);
      }

      // Download the processed ZIP
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'processed-pdfs.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      if (err.response?.data) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result as string);
            setError(errorData.error || 'Erro ao processar arquivos');
          } catch {
            setError('Erro ao processar arquivos');
          }
        };
        reader.readAsText(err.response.data);
      } else {
        setError(err.message || 'Erro ao processar arquivos');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Processador de PDFs</h1>
        <p className="subtitle">
          Envie um ZIP com PDFs e uma capa para processamento em lote
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="filesZip">
              ZIP com PDFs *
              {filesZip && <span className="file-name">{filesZip.name}</span>}
            </label>
            <input
              type="file"
              id="filesZip"
              accept=".zip"
              onChange={(e) => setFilesZip(e.target.files?.[0] || null)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cover">
              Arquivo de Capa * (PDF ou Imagem)
              {cover && <span className="file-name">{cover.name}</span>}
            </label>
            <input
              type="file"
              id="cover"
              accept=".pdf,.png,.jpg,.jpeg,.svg"
              onChange={(e) => setCover(e.target.files?.[0] || null)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="headerHeight">
              Altura do Cabeçalho (px)
            </label>
            <input
              type="number"
              id="headerHeight"
              min="0"
              max="200"
              value={headerHeightPx}
              onChange={(e) => setHeaderHeightPx(parseInt(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="footerHeight">
              Altura do Rodapé (px)
            </label>
            <input
              type="number"
              id="footerHeight"
              min="0"
              max="200"
              value={footerHeightPx}
              onChange={(e) => setFooterHeightPx(parseInt(e.target.value))}
            />
          </div>

          <button type="submit" disabled={processing} className="btn-submit">
            {processing ? 'Processando...' : 'Processar PDFs'}
          </button>
        </form>

        {uploadProgress && processing && (
          <div className="alert alert-info">
            {uploadProgress}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {report.length > 0 && (
          <div className="report">
            <h2>Relatório de Processamento</h2>
            <div className="report-summary">
              <p>
                <strong>Total:</strong> {report.length} arquivo(s)
              </p>
              <p>
                <strong>Sucesso:</strong> {report.filter(r => r.success).length}
              </p>
              <p>
                <strong>Falhas:</strong> {report.filter(r => !r.success).length}
              </p>
            </div>
            <div className="report-table">
              <table>
                <thead>
                  <tr>
                    <th>Arquivo</th>
                    <th>Pág. Orig.</th>
                    <th>Pág. Final</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.map((file, index) => (
                    <tr key={index} className={file.success ? 'success' : 'error'}>
                      <td>{file.name}</td>
                      <td>{file.originalPages}</td>
                      <td>{file.finalPages}</td>
                      <td>
                        {file.success ? (
                          <span className="status-badge success">✓ Sucesso</span>
                        ) : (
                          <span className="status-badge error">
                            ✗ {file.error}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
