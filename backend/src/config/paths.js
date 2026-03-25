/**
 * Shared filesystem paths
 * Keeps local defaults and production overrides in one place.
 */

const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');

// Production can override these via env vars.
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT_DIR, 'data');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'devtools.db');
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(ROOT_DIR, 'uploads');

module.exports = {
    ROOT_DIR,
    DATA_DIR,
    DB_PATH,
    UPLOADS_DIR,
};
