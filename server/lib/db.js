import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_DIR = (process.env.VERCEL || process.env.NODE_ENV === 'production') 
  ? '/tmp/safelink_data' 
  : path.resolve(__dirname, '../data')

// Ensure data folder exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

// Atomic file write to avoid file corruption
function writeJsonFile(filePath, data) {
  const tempPath = `${filePath}.tmp`
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(tempPath, filePath)
}

function readJsonFile(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    // On Vercel, attempt to seed from the static bundled data directory
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      const staticPath = path.resolve(__dirname, '../data', path.basename(filePath));
      if (fs.existsSync(staticPath)) {
        try {
          const content = fs.readFileSync(staticPath, 'utf8');
          writeJsonFile(filePath, JSON.parse(content));
          return JSON.parse(content);
        } catch (e) {
          console.error(`Error reading static seed file ${staticPath}:`, e);
        }
      }
    }
    writeJsonFile(filePath, defaultData)
    return defaultData
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content)
  } catch (err) {
    console.error(`Error reading database file ${filePath}:`, err)
    return defaultData
  }
}

class Collection {
  constructor(filename) {
    this.filePath = path.join(DB_DIR, filename)
  }

  getAll() {
    return readJsonFile(this.filePath)
  }

  saveAll(data) {
    writeJsonFile(this.filePath, data)
  }

  find(predicate) {
    const list = this.getAll()
    return list.find(predicate)
  }

  filter(predicate) {
    const list = this.getAll()
    return list.filter(predicate)
  }

  insert(item) {
    const list = this.getAll()
    list.push(item)
    this.saveAll(list)
    return item
  }

  update(predicate, updates) {
    const list = this.getAll()
    let updatedItem = null
    const updatedList = list.map(item => {
      if (predicate(item)) {
        updatedItem = { ...item, ...updates }
        return updatedItem
      }
      return item
    })
    if (updatedItem) {
      this.saveAll(updatedList)
    }
    return updatedItem
  }

  delete(predicate) {
    const list = this.getAll()
    const initialLength = list.length
    const filteredList = list.filter(item => !predicate(item))
    if (filteredList.length !== initialLength) {
      this.saveAll(filteredList)
      return true
    }
    return false
  }

  clear() {
    this.saveAll([])
  }
}

export const users = new Collection('users.json')
export const scans = new Collection('scans.json')
export const conversations = new Collection('conversations.json')
