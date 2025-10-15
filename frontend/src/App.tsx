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
  const [report, setReport] = useState<ProcessedFile[]>([]);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setReport([]);

    if (!filesZip || !cover) {
      setError('Por favor, selecione os arquivos ZIP e capa');
      return;
    }

    const formData = new FormData();
    formData.append('filesZip', filesZip);
    formData.append('cover', cover);
    formData.append('footerHeightPx', footerHeightPx.toString());
    formData.append('headerHeightPx', headerHeightPx.toString());

    setProcessing(true);

    try {
      const response = await axios.post('/api/process', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
