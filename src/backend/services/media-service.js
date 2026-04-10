/**
 * OrcaLog — Media Service
 *
 * Handles photo uploads via Wix Media Manager.
 */

import { mediaManager } from 'wix-media-backend';

const UPLOAD_FOLDER = '/OrcaLog';

/**
 * Get an upload URL for a file.
 * The frontend uses this URL to upload directly to Wix Media Manager.
 *
 * @param {string} fileName - Original file name
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @returns {Promise<{ uploadUrl: string, uploadToken: string }>}
 */
export async function getUploadUrl(fileName, mimeType) {
  const result = await mediaManager.getUploadUrl(UPLOAD_FOLDER, {
    mediaOptions: {
      mimeType,
      mediaType: 'image',
    },
    metadataOptions: {
      isPrivate: false,
      isVisitorUpload: false,
      context: {
        someKey1: 'orcalog-dive-photo',
      },
    },
  });

  return {
    uploadUrl: result.uploadUrl,
    uploadToken: result.uploadToken,
  };
}

/**
 * Get file info from Wix Media Manager by file URL.
 * @param {string} fileUrl - Wix media URL
 * @returns {Promise<Object>} File info
 */
export async function getFileInfo(fileUrl) {
  return mediaManager.getFileInfo(fileUrl);
}

/**
 * Import a file from an external URL into Wix Media Manager.
 * @param {string} url - External URL
 * @param {string} fileName - Target file name
 * @returns {Promise<Object>} Imported file info
 */
export async function importFile(url, fileName) {
  return mediaManager.importFile(UPLOAD_FOLDER, url, {
    mediaOptions: {
      mediaType: 'image',
    },
    metadataOptions: {
      isPrivate: false,
      isVisitorUpload: false,
      fileName,
    },
  });
}
