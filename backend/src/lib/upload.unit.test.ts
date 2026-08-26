import { describe, expect, it } from 'vitest';

import { isAllowedAvatarFile, isAllowedSubmitFile } from './upload.js';

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
