const os = require('os');
const fs = require('fs');
const { createInterface } = require('readline');
const googleapis = require('@googleapis/sheets');

module.exports = {

  async evalArguments() {
    if (false) {
    } else if (arguments[2] === 'login') {
      return this.evalLogin.apply(this, arguments);
    } else if (arguments[2] === 'updateById') {
      return this.evalUpdateById.apply(this, arguments);
    }
  },

  async evalLogin() {
    const stream = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const credentials = await this.readCredentialsJSON({});

    const oauth2 = this.createGoogleOAuth2Client(credentials);

    console.log('Authorize this app by visiting this url:');
    console.log(oauth2.generateAuthUrl({
      scope: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    }));

    const code = await new Promise((resolve) => {
      return stream.question('Enter the code from that page here: ', (code) => {
        return resolve(code);
      });
    });

    stream.close();

    const token = await new Promise((resolve, reject) => {
      return oauth2.getToken(code, (err, token) => {
        return err ? reject(err) : resolve(token);
      });
    });

    await this.writeTokenJSON(token, {});
    console.log('your token created successfully');
  },

  async evalUpdateById() {
    if (!arguments[3]) {
      throw 'arguments error.';
    }

    if (!arguments[4]) {
      throw 'arguments error.';
    }

    if (!arguments[5]) {
      throw 'arguments error.';
    }

    const [, , , spreadsheetId, sheet, startAddress] = arguments;
    const { row, column } = this.parseA1Notation(startAddress);
    const credentials = await this.readCredentialsJSON({});
    const token = await this.readTokenJSON({});
    const oauth2 = this.createGoogleOAuth2Client(credentials);
    oauth2.setCredentials(token);
    const sheets = googleapis.sheets({ version: 'v4', auth: oauth2 });

    const stream = createInterface({
      input: process.stdin,
      // output: process.stdout,
    });

    const values = [];

    await new Promise((resolve) => {
      stream.on('line', (line) => {
        const object = JSON.parse(line);
        values.push(object);
      });

      stream.on('close', () => {
        resolve();
      });
    });

    const endAddress = `${this.numberToColumn(column + values[0].length)}${row + values.length}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheet}!${startAddress}:${endAddress}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
  },

  parseA1Notation(a1notation) {
    const m = /([A-Z]+)([0-9]+)/g.exec(a1notation);

    if (!m) {
      throw 'parse error';
    }

    return {
      row: parseInt(m[2]),
      column: this.columnToNumber(m[1]),
    };
  },

  createGoogleOAuth2Client(credentials) {
    return new googleapis.auth.OAuth2(
      credentials.installed.client_id,
      credentials.installed.client_secret,
      credentials.installed.redirect_uris[0],
    );
  },

  async readCredentialsJSON(options) {
    const filepath = this.getCredentialsFilepath();
    return this.readJSONFile(filepath, options);
  },

  async writeCredentialsJSON(object, options) {
    const filepath = this.getCredentialsFilepath();
    return this.writeJSONFile(filepath, object, options);
  },

  async readTokenJSON(options) {
    const filepath = this.getTokenFilepath();
    return this.readJSONFile(filepath, options);
  },

  async writeTokenJSON(object, options) {
    const filepath = this.getTokenFilepath();
    return this.writeJSONFile(filepath, object, options);
  },

  async readJSONFile(path, options) {
    return new Promise((resolve, reject) => {
      return fs.readFile(path, Object.assign({ 'encoding': 'utf-8' }, options), (err, data) => {
        return err ? reject(err) : resolve(JSON.parse(data));
      });
    });
  },

  async writeJSONFile(path, object, options) {
    return new Promise((resolve, reject) => {
      return fs.writeFile(path, JSON.stringify(object, null, 2), options, (err) => {
        return err ? reject(err) : resolve();
      });
    });
  },

  getCredentialsFilepath() {
    return `${os.homedir()}/.jq_at_spreadsheets_credentials.json`;
  },

  getTokenFilepath() {
    return `${os.homedir()}/.jq_at_spreadsheets_token.json`;
  },

  columnToNumber(column) {
    return this.columnToNumberRec(column, 0);
  },

  columnToNumberRec(column, num) {
    const d = 1 + column[0].charCodeAt(0) - 'A'.charCodeAt(0);

    if (column.length === 1) {
      return d + num;
    } else {
      return this.columnToNumberRec(column.slice(1), d * 26 + num);
    }
  },

  numberToColumn(num) {
    return this.numberToColumnRec(num, '');
  },

  numberToColumnRec(num, str) {
    const q = Math.floor((num - 1) / 26);
    const r = (num - 1) % 26;
    const d = String.fromCharCode('A'.charCodeAt(0) + r);

    if (q === 0) {
      return d + str;
    } else {
      return this.numberToColumnRec(q, d + str);
    }
  },

};
