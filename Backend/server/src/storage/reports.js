const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const appendFileAsync = promisify(fs.appendFile);
const mkdirAsync = promisify(fs.mkdir);

const STORE_DIR = path.join(__dirname, '../../data-store');
const REPORTS_FILE = path.join(STORE_DIR, 'reports.json');

// Ensure directory exists synchronously on startup
if (!fs.existsSync(STORE_DIR)) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
}
if (!fs.existsSync(REPORTS_FILE)) {
  fs.writeFileSync(REPORTS_FILE, '[\n]');
}

// Very basic queue to handle concurrent appends to a JSON array.
// Note: Real world would use a DB. For json append without parsing whole file,
// we just manipulate the trailing `\n]` byte. But simple file locking/queue is asked.
let isWriting = false;
let writeQueue = [];

const processQueue = async () => {
  if (isWriting || writeQueue.length === 0) return;
  isWriting = true;

  const { report, resolve, reject } = writeQueue.shift();

  try {
    // Read the file stats to remove the last two characters (`\n]`)
    // If the file just has `[\n]` (length 3), we don't prepend a comma.
    const fileData = await promisify(fs.readFile)(REPORTS_FILE, 'utf8');
    
    // A more robust approach for this simple assignment: read as string, insert, rewrite.
    // Given the constraints and size limitations, reading fully and writing is safer 
    // against malformed files than byte-stripping, though byte-stripping is faster.
    let currentReports = [];
    try {
      currentReports = JSON.parse(fileData);
      if (!Array.isArray(currentReports)) currentReports = [];
    } catch(e) {
      currentReports = [];
    }

    currentReports.push(report);
    
    await promisify(fs.writeFile)(REPORTS_FILE, JSON.stringify(currentReports, null, 2), 'utf8');
    
    resolve();
  } catch (err) {
    reject(err);
  } finally {
    isWriting = false;
    processQueue(); // process next in queue if any
  }
};

const saveReport = (report) => {
  return new Promise((resolve, reject) => {
    writeQueue.push({ report, resolve, reject });
    processQueue();
  });
};

module.exports = { saveReport, REPORTS_FILE };
