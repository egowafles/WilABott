const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data');

function loadDB(name) {
  const file = path.join(DB_PATH, `${name}.json`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}));
    return {};
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveDB(name, data) {
  const file = path.join(DB_PATH, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = { loadDB, saveDB };
