import { getDriveClient, getGoogleClient } from '../config/google.js';
import { Readable } from 'stream';

export const listFiles = async (req, res) => {
  try {
    const auth = getGoogleClient(req.user.accessToken, req.user.refreshToken);
    const drive = getDriveClient(auth);

    const { folderId, q } = req.query;
    
    let query = q || "trashed = false";
    if (folderId && !q) {
      query = `'${folderId}' in parents and trashed = false`;
    } else if (!q) {
      query = "'root' in parents and trashed = false";
    }

    const response = await drive.files.list({
      q: query,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, iconLink, webViewLink, thumbnailLink)',
      spaces: 'drive',
    });

    res.json(response.data.files);
  } catch (error) {
    console.error('Drive API Error:', error);
    if (error.code === 403 || error.status === 403) {
      return res.status(403).json({ error: 'DRIVE_API_DISABLED', message: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const uploadFiles = async (req, res) => {
  try {
    const auth = getGoogleClient(req.user.accessToken, req.user.refreshToken);
    const drive = getDriveClient(auth);
    const { parentId } = req.body;

    const results = await Promise.all(req.files.map(async (file) => {
      const fileMetadata = {
        name: file.originalname,
        parents: parentId ? [parentId] : [],
      };
      
      const media = {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name',
      });
      return response.data;
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createFolder = async (req, res) => {
  try {
    const auth = getGoogleClient(req.user.accessToken, req.user.refreshToken);
    const drive = getDriveClient(auth);

    const { name, parentId } = req.body;

    const fileMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : [],
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name',
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStorageQuota = async (req, res) => {
  try {
    const auth = getGoogleClient(req.user.accessToken, req.user.refreshToken);
    const drive = getDriveClient(auth);

    const response = await drive.about.get({
      fields: 'storageQuota',
    });

    res.json(response.data.storageQuota);
  } catch (error) {
    console.error('Drive Quota API Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const auth = getGoogleClient(req.user.accessToken, req.user.refreshToken);
    const drive = getDriveClient(auth);

    await drive.files.update({
      fileId: req.params.id,
      requestBody: { trashed: true },
    });

    res.json({ message: 'File moved to trash' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const renameFile = async (req, res) => {
  try {
    const auth = getGoogleClient(req.user.accessToken, req.user.refreshToken);
    const drive = getDriveClient(auth);

    const { name } = req.body;

    const response = await drive.files.update({
      fileId: req.params.id,
      requestBody: { name },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
