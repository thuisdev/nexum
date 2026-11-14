import axios from 'axios';

type ZodFlatten = {
  formErrors?: unknown;
  fieldErrors?: unknown;
};

function flattenValidationDetails(details: unknown): string[] {
  if (!details || typeof details !== 'object') {
    return [];
  }

  const { formErrors, fieldErrors } = details as ZodFlatten;

  const fromForm = Array.isArray(formErrors)
    ? formErrors.filter((message): message is string => typeof message === 'string' && message.length > 0)
    : [];

  const fromFields =
    fieldErrors && typeof fieldErrors === 'object'
      ? Object.values(fieldErrors).flatMap((messages) =>
          Array.isArray(messages)
            ? messages.filter(
                (message): message is string => typeof message === 'string' && message.length > 0,
              )
            : [],
        )
      : [];

  return [...fromForm, ...fromFields];
}

type BlobLike = {
  type?: string;
  text?: () => Promise<string>;
  arrayBuffer?: () => Promise<ArrayBuffer>;
};

async function readBlobText(data: unknown): Promise<string | null> {
  if (typeof data !== 'object' || data === null) {
    return null;
  }

  const blob = data as BlobLike;
  const isBlob = typeof Blob !== 'undefined' && data instanceof Blob;
  if (!isBlob && typeof blob.text !== 'function') {
    return null;
  }

  if (typeof blob.text === 'function') {
    return blob.text();
  }

  if (typeof blob.arrayBuffer === 'function') {
    return new TextDecoder().decode(await blob.arrayBuffer());
  }

  return null;
}

/** Blob downloads turn JSON error bodies into Blobs. Restore the object so callers can read `error`. */
export async function parseJsonBlobErrorBody(error: unknown): Promise<void> {
  if (!axios.isAxiosError(error) || !error.response) {
    return;
  }

  const data = error.response.data;
  const text = await readBlobText(data);
  if (text === null) {
    return;
  }

  try {
    error.response.data = JSON.parse(text) as typeof error.response.data;
  } catch {
    if (typeof Blob !== 'undefined') {
      error.response.data = new Blob([text], {
        type: typeof data === 'object' && data && 'type' in data ? String((data as BlobLike).type ?? '') : '',
      });
    }
  }
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; message?: string; details?: unknown }
      | undefined;
    const details = flattenValidationDetails(data?.details);
    if (details.length > 0) {
      return details.join(' · ');
    }
    return data?.error ?? data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
