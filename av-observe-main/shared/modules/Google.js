import { google } from 'googleapis';
import { getCredentials } from '../credentials.js';

class Google {
  constructor() {
    const credentials = getCredentials('google');

    // Initialize the Google Sheets API client
    this.auth = new google.auth.JWT({
      email: credentials.clientEmail,
      key: credentials.privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.isAuthorized = false;
  }

  /**
   * Authorize the JWT client
   * @returns {Promise<void>}
   */
  async authorize() {
    if (!this.isAuthorized) {
      try {
        await this.auth.authorize();
        this.isAuthorized = true;
      } catch (error) {
        console.error('Google authorization failed:', error);
        
        // Provide more specific error message for common issues
        if (error.message.includes('DECODER routines::unsupported')) {
          throw new Error('Google private key format is invalid. Please check that GOOGLE_KEY environment variable contains a properly formatted private key.');
        } else if (error.message.includes('invalid_grant')) {
          throw new Error('Google service account credentials are invalid. Please check GOOGLE_KEY and GOOGLE_CLIENT_EMAIL environment variables.');
        }
        
        throw error;
      }
    }
  }

  /**
   * Fetches data from a Google Sheet
   * @param {string} spreadsheetId - The ID of the spreadsheet
   * @param {string} [range] - Optional range in A1 notation (e.g., 'Sheet1!A1:B2')
   * @param {Object} [options] - Additional options for the request
   * @returns {Promise<Object>} The spreadsheet data
   */
  async getData(spreadsheetId, range = '', options = {}) {
    try {
      // Ensure we're authorized
      await this.authorize();
      
      // If no range is specified, get the entire first sheet
      if (!range) {
        // First, get the sheet names
        const sheetsResponse = await this.sheets.spreadsheets.get({
          spreadsheetId,
          fields: 'sheets.properties.title'
        });

        // Use the first sheet's name if available
        if (sheetsResponse.data.sheets && sheetsResponse.data.sheets.length > 0) {
          range = sheetsResponse.data.sheets[0].properties.title;
        } else {
          throw new Error('No sheets found in the spreadsheet');
        }
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
        ...options
      });

      return {
        values: response.data.values || [],
        range: response.data.range,
        majorDimension: response.data.majorDimension
      };

    } catch (error) {
      console.error('Google Sheets API error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Gets metadata about a spreadsheet
   * @param {string} spreadsheetId - The ID of the spreadsheet
   * @returns {Promise<Object>} Spreadsheet metadata
   */
  async getSpreadsheetInfo(spreadsheetId) {
    try {
      // Ensure we're authorized
      await this.authorize();
      
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get spreadsheet info:', error);
      throw error;
    }
  }

  /**
   * Gets all sheet names from a spreadsheet
   * @param {string} spreadsheetId - The ID of the spreadsheet
   * @returns {Promise<Array>} List of sheet names
   */
  async getSheetNames(spreadsheetId) {
    try {
      // Ensure we're authorized
      await this.authorize();
      
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties.title'
      });

      return response.data.sheets.map(sheet => sheet.properties.title);
    } catch (error) {
      console.error('Failed to get sheet names:', error);
      throw error;
    }
  }

  async clearSheet(sheetName, options = {}) {
    const spreadsheetId = options.spreadsheetId || this.default_spreadsheet_id || null;
    if (!spreadsheetId) return false;
    try {
      const response = await this.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: sheetName,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to clear sheet:', error);
      throw error;
    }
  }

  async updateData(spreadsheetId, range, values, options = {}) {
    try {
      // Update with new values
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: values
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update sheet:', error);
      throw error;
    }
  }
}

export default Google;
