import { google } from 'googleapis';

export const getGoogleClient = (accessToken, refreshToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || '/auth/google/callback'
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return oauth2Client;
};

export const getGmailClient = (auth) => google.gmail({ version: 'v1', auth });
export const getDriveClient = (auth) => google.drive({ version: 'v3', auth });
export const getCalendarClient = (auth) => google.calendar({ version: 'v3', auth });
