import { getGmailClient, getGoogleClient } from '../config/google.js';

export const listEmails = async (req, res) => {
  console.log('Listing emails for user:', req.user?.email);
  try {
    const auth = getGoogleClient(req.user.accessToken, req.user.refreshToken);
    const gmail = getGmailClient(auth);

    const { q, maxResults = 20, pageToken } = req.query;
    console.log('Gmail query params:', { q, maxResults, pageToken });

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: q || '',
      maxResults,
      pageToken: pageToken || null,
    });

    console.log('Gmail API response received, count:', response.data.messages?.length || 0);

    const messages = await Promise.all(
      (response.data.messages || []).map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date'],
        });
        return detail.data;
      })
    );

    res.json({
      messages,
      nextPageToken: response.data.nextPageToken,
      resultSizeEstimate: response.data.resultSizeEstimate,
    });
  } catch (error) {
    console.error('Gmail API Error:', error);
    if (error.code === 403 || error.status === 403) {
      return res.status(403).json({ error: 'GMAIL_API_DISABLED', message: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const getEmail = async (req, res) => {
  try {
    const auth = getGoogleClient(req.user.accessToken, req.user.refreshToken);
    const gmail = getGmailClient(auth);

    const response = await gmail.users.messages.get({
      userId: 'me',
      id: req.params.id,
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendEmail = async (req, res) => {
  try {
    const auth = getGoogleClient(req.user.accessToken, req.user.refreshToken);
    const gmail = getGmailClient(auth);

    const { to, subject, body, threadId } = req.body;

    // Basic MIME message
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      body,
    ];
    const message = messageParts.join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        threadId: threadId || null,
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEmail = async (req, res) => {
  try {
    const auth = getGoogleClient(req.user.accessToken, req.user.refreshToken);
    const gmail = getGmailClient(auth);

    await gmail.users.messages.trash({
      userId: 'me',
      id: req.params.id,
    });

    res.json({ message: 'Email moved to trash' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const modifyEmail = async (req, res) => {
  try {
    const auth = getGoogleClient(req.user.accessToken, req.user.refreshToken);
    const gmail = getGmailClient(auth);

    const { addLabelIds, removeLabelIds } = req.body;

    const response = await gmail.users.messages.modify({
      userId: 'me',
      id: req.params.id,
      requestBody: {
        addLabelIds,
        removeLabelIds,
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
