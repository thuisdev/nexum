import { describe, expect, it } from 'vitest';

import {
  applyUploadStaticHeaders,
  filenameFromStoredUrl,
  isAllowedAvatarFile,
  isAllowedSubmitFile,
  safeUploadFilename,
} from './upload.js';

describe('isAllowedSubmitFile', () => {
  it('allows pdf and zip deliverables', () => {
    expect(isAllowedSubmitFile('application/pdf', 'spec.pdf')).toBe(true);
    expect(isAllowedSubmitFile('application/zip', 'build.zip')).toBe(true);
  });

  it('rejects html and svg', () => {
    expect(isAllowedSubmitFile('text/html', 'page.html')).toBe(false);
    expect(isAllowedSubmitFile('image/svg+xml', 'icon.svg')).toBe(false);
  });

  it('rejects mime/extension mismatch', () => {
    expect(isAllowedSubmitFile('application/pdf', 'spec.html')).toBe(false);
  });
});

describe('isAllowedAvatarFile', () => {
  it('allows raster images', () => {
    expect(isAllowedAvatarFile('image/png', 'me.png')).toBe(true);
    expect(isAllowedAvatarFile('image/jpeg', 'me.jpg')).toBe(true);
  });

  it('rejects svg even when labelled as an image', () => {
    expect(isAllowedAvatarFile('image/svg+xml', 'me.svg')).toBe(false);
  });
});

describe('applyUploadStaticHeaders', () => {
  it('lets avatars be embedded from another origin', () => {
    const headers: Record<string, string> = {};
    applyUploadStaticHeaders(
      {
        setHeader: (name, value) => {
          headers[name] = value;
        },
      },
      '/tmp/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png',
    );

    expect(headers['Cross-Origin-Resource-Policy']).toBe('cross-origin');
    expect(headers['Content-Disposition']).toBeUndefined();
  });

  it('forces download for non-image deliverables', () => {
    const headers: Record<string, string> = {};
    applyUploadStaticHeaders(
      {
        setHeader: (name, value) => {
          headers[name] = value;
        },
      },
      '/tmp/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.pdf',
    );

    expect(headers['Cross-Origin-Resource-Policy']).toBe('cross-origin');
    expect(headers['Content-Disposition']).toBe('attachment');
  });
});

describe('safeUploadFilename', () => {
  it('accepts a stored uuid filename', () => {
    expect(
      safeUploadFilename('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.pdf'),
    ).toBe('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.pdf');
  });

  it('rejects path traversal', () => {
    expect(safeUploadFilename('../secret.png')).toBeNull();
    expect(safeUploadFilename('..\\secret.png')).toBeNull();
    expect(safeUploadFilename('foo/bar.png')).toBeNull();
  });
});

describe('filenameFromStoredUrl', () => {
  it('reads the filename from a stored /uploads path', () => {
    expect(
      filenameFromStoredUrl(
        '/uploads/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.pdf',
      ),
    ).toBe('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.pdf');
  });

  it('rejects a path that is not a stored upload url', () => {
    expect(filenameFromStoredUrl('/uploads/../secret.png')).toBeNull();
    expect(filenameFromStoredUrl('https://cdn.example/file.pdf')).toBeNull();
  });
});
