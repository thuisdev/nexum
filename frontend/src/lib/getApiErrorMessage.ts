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
