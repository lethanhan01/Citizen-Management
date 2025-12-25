import apiClient from '../lib/axios';

function extractFilename(disposition?: string | null): string | null {
  if (!disposition) return null;
  const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
  if (match) {
    const raw = match[1].replace(/['"]/g, '');
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

type ExportResult = { blob: Blob; filename: string | null };

export async function exportFeeOutstanding(id: string): Promise<ExportResult> {
  const resp = await apiClient.get(`/api/v1/export/thu-phi/ton-dong/${id}`, {
    responseType: 'blob',
  });
  const filename = extractFilename((resp as any).headers?.['content-disposition']);
  return { blob: resp.data as Blob, filename };
}

export async function exportDonationReport(id: string): Promise<ExportResult> {
  const resp = await apiClient.get(`/api/v1/export/dong-gop/${id}`, {
    responseType: 'blob',
  });
  const filename = extractFilename((resp as any).headers?.['content-disposition']);
  return { blob: resp.data as Blob, filename };
}

export async function exportFullFeeReport(id: string): Promise<ExportResult> {
  const resp = await apiClient.get(`/api/v1/export/thu-phi/tong-hop/${id}`, {
    responseType: 'blob',
  });
  const filename = extractFilename((resp as any).headers?.['content-disposition']);
  return { blob: resp.data as Blob, filename };
}

export async function exportReceipts(id: string): Promise<ExportResult> {
  const resp = await apiClient.get(`/api/v1/export/thu-phi/phieu-thu/${id}`, {
    responseType: 'blob',
  });
  const filename = extractFilename((resp as any).headers?.['content-disposition']);
  return { blob: resp.data as Blob, filename };
}
