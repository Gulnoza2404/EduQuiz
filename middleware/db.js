const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Make sure data folder exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const filePath = (name) => path.join(DATA_DIR, `${name}.json`);

// Read a collection (returns array)
const readDB = (name) => {
  const fp = filePath(name);
  if (!fs.existsSync(fp)) return [];
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch {
    return [];
  }
};

// Write a collection
const writeDB = (name, data) => {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf8');
};

module.exports = { readDB, writeDB };
