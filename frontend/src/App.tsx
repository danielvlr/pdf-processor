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

  // Extract PDFs from ZIP and process in batches
  const processPDFsInBatches = async (): Promise<any[]> => {
    if (!filesZip || !cover) {
      throw new Error('Por favor, selecione os arquivos ZIP e capa');
    }

    setUploadProgress('Extracting PDFs from ZIP...');

    // Extract all PDFs from ZIP
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(filesZip);

    const pdfFiles: Array<{ name: string; blob: Blob }> = [];

    for (const [filename, file] of Object.entries(zip.files)) {
      if (!file.dir && filename.toLowerCase().endsWith('.pdf')) {
        const blob = await file.async('blob');
        pdfFiles.push({ name: filename, blob });
      }
    }

    console.log(`Found ${pdfFiles.length} PDFs in ZIP`);

    if (pdfFiles.length === 0) {
      throw new Error('No PDF files found in ZIP');
    }

    const allProcessedFiles: any[] = [];
    const BATCH_SIZE = 10; // Process 10 PDFs at a time
    const totalBatches = Math.ceil(pdfFiles.length / BATCH_SIZE);

    // Process PDFs in batches
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, pdfFiles.length);
      const batch = pdfFiles.slice(start, end);

      setUploadProgress(`Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} PDFs)...`);

      console.log(`Processing batch ${batchIndex + 1}/${totalBatches}: ${batch.length} PDFs`);

      // Create a mini ZIP with this batch
      const batchZip = new JSZip();
      for (const pdf of batch) {
        batchZip.file(pdf.name, pdf.blob);
      }

      const batchZipBlob = await batchZip.generateAsync({ type: 'blob' });

      const formData = new FormData();
      formData.append('zipChunk', batchZipBlob);
      formData.append('cover', cover);
      formData.append('footerHeightPx', footerHeightPx.toString());
      formData.append('headerHeightPx', headerHeightPx.toString());
      formData.append('chunkIndex', batchIndex.toString());

      try {
        const response = await axios.post('/api/process-chunk', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log(`Batch ${batchIndex + 1} processed:`, response.data);

        // Collect results from this batch
        if (response.data.results && Array.isArray(response.data.results)) {
          allProcessedFiles.push(...response.data.results);
        }

      } catch (error) {
        console.error(`Error processing batch ${batchIndex + 1}:`, error);
        throw new Error(`Failed to process batch ${batchIndex + 1}/${totalBatches}`);
      }

      // Force garbage collection hint
      if ((window as any).gc) {
        (window as any).gc();
      }
    }

    return allProcessedFiles;
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
      // Process PDFs in batches and get all results
      const allProcessedFiles = await processPDFsInBatches();

      setUploadProgress('Creating final ZIP...');

      // Create final ZIP with all processed PDFs
      const JSZip = (await import('jszip')).default;
      const finalZip = new JSZip();

      let successCount = 0;
      let failCount = 0;

      for (const file of allProcessedFiles) {
        if (file.success && file.data) {
          // Convert base64 back to binary
          const binaryData = Uint8Array.from(atob(file.data), c => c.charCodeAt(0));
          finalZip.file(file.name, binaryData);
          successCount++;
        } else {
          failCount++;
        }
      }

      console.log(`Creating ZIP with ${successCount} files (${failCount} failed)`);

      // Generate ZIP blob
      const zipBlob = await finalZip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 1 }
      });

      // Download the final ZIP
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'processed-pdfs.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Set report for UI
      setReport(allProcessedFiles.map((f: any) => ({
        name: f.name,
        originalPages: f.originalPages,
        finalPages: f.finalPages,
        success: f.success,
        error: f.error
      })));

    } catch (err: any) {
      console.error('Error during processing:', err);

      // Try to extract error message from response
      if (err.response?.data) {
        // Check if it's a Blob (from responseType: 'blob')
        if (err.response.data instanceof Blob) {
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
        } else if (typeof err.response.data === 'object') {
          // JSON error response
          setError(err.response.data.error || err.response.data.message || 'Erro ao processar arquivos');
        } else {
          setError(String(err.response.data) || 'Erro ao processar arquivos');
        }
      } else {
        setError(err.message || 'Erro ao processar arquivos');
      }
    } finally {
      setProcessing(false);
      setUploadProgress('');
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
