const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const crypto = require('crypto');

let exifParser;
try {
  exifParser = require('exif-parser');
} catch (error) {
  console.log('exif-parser not available');
}

let pdfParse;
try {
  pdfParse = require('pdf-parse');
} catch (error) {
  console.log('pdf-parse not available');
}

let mammoth;
try {
  mammoth = require('mammoth');
} catch (error) {
  console.log('mammoth not available');
}

let XLSX;
try {
  XLSX = require('xlsx');
} catch (error) {
  console.log('xlsx not available');
}

let AdmZip;
try {
  AdmZip = require('adm-zip');
} catch (error) {
  console.log('adm-zip not available');
}

function generateHashes(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return {
    md5: crypto.createHash('md5').update(fileBuffer).digest('hex'),
    sha256: crypto.createHash('sha256').update(fileBuffer).digest('hex'),
  };
}

function extractImageMetadata(filePath, originalName) {
  const metadata = {
    exif: {},
    gps: null,
    camera: {},
    sensitive: [],
  };

  if (exifParser && originalName.match(/\.(jpg|jpeg|png|tiff|tif)$/i)) {
    try {
      const buffer = fs.readFileSync(filePath);
      const parser = exifParser.create(buffer);
      const result = parser.parse();
      
      if (result && result.tags) {
        metadata.exif = result.tags;
        
        // GPS extraction
        if (result.tags.GPSLatitude && result.tags.GPSLongitude) {
          metadata.gps = {
            latitude: result.tags.GPSLatitude,
            longitude: result.tags.GPSLongitude,
            warning: '⚠️ GPS location detected!',
          };
          metadata.sensitive.push('GPS coordinates found');
        }

        // Camera info
        if (result.tags.Make || result.tags.Model) {
          metadata.camera = {
            make: result.tags.Make,
            model: result.tags.Model,
          };
        }

        // Author detection
        if (result.tags.Artist || result.tags.Copyright) {
          metadata.sensitive.push(`Author: ${result.tags.Artist || result.tags.Copyright}`);
        }

        // Software used
        if (result.tags.Software) {
          metadata.sensitive.push(`Software: ${result.tags.Software}`);
        }
      }
    } catch (error) {
      // EXIF extraction failed
    }
  }

  return metadata;
}

async function extractPDFMetadata(filePath) {
  const metadata = {
    pages: 0,
    info: {},
    sensitive: [],
  };

  if (pdfParse) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      
      metadata.pages = pdfData.numpages;
      metadata.info = pdfData.info || {};
      
      if (pdfData.info && pdfData.info.Author) {
        metadata.sensitive.push(`Author: ${pdfData.info.Author}`);
      }
      if (pdfData.info && pdfData.info.Creator) {
        metadata.sensitive.push(`Creator: ${pdfData.info.Creator}`);
      }
      if (pdfData.info && pdfData.info.Producer) {
        metadata.sensitive.push(`Producer: ${pdfData.info.Producer}`);
      }
    } catch (error) {
      // PDF parsing failed
    }
  }

  return metadata;
}

async function extractDOCXMetadata(filePath) {
  const metadata = {
    content: '',
    sensitive: [],
  };

  if (mammoth) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      metadata.content = result.value.substring(0, 500);
    } catch (error) {
      // DOCX parsing failed
    }
  }

  return metadata;
}

function extractZIPMetadata(filePath) {
  const metadata = {
    files: [],
    sensitive: [],
  };

  if (AdmZip) {
    try {
      const zip = new AdmZip(filePath);
      const zipEntries = zip.getEntries();
      
      metadata.files = zipEntries.map(entry => ({
        name: entry.entryName,
        size: entry.header.size,
        compressed: entry.header.compressedSize,
      }));

      // Check for sensitive files
      const sensitivePatterns = ['.env', 'config', 'password', 'secret', 'key'];
      zipEntries.forEach(entry => {
        sensitivePatterns.forEach(pattern => {
          if (entry.entryName.toLowerCase().includes(pattern)) {
            metadata.sensitive.push(`Sensitive file found: ${entry.entryName}`);
          }
        });
      });
    } catch (error) {
      // ZIP parsing failed
    }
  }

  return metadata;
}

function extractMetadata(filePath, originalName) {
  const stats = fs.statSync(filePath);
  const metadata = {
    filename: originalName,
    size: stats.size,
    type: mime.lookup(originalName) || 'application/octet-stream',
    general: {
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
    },
    hashes: generateHashes(filePath),
    sensitive: [],
    gps: null,
    exif: {},
    pdf: {},
    docx: {},
    zip: {},
  };

  // Image metadata
  if (originalName.match(/\.(jpg|jpeg|png|tiff|tif|gif|bmp)$/i)) {
    const imageMeta = extractImageMetadata(filePath, originalName);
    metadata.exif = imageMeta.exif;
    metadata.gps = imageMeta.gps;
    metadata.sensitive = metadata.sensitive.concat(imageMeta.sensitive);
  }

  // PDF metadata
  if (originalName.match(/\.pdf$/i)) {
    return extractPDFMetadata(filePath).then(pdfMeta => {
      metadata.pdf = pdfMeta;
      metadata.sensitive = metadata.sensitive.concat(pdfMeta.sensitive);
      return metadata;
    });
  }

  // DOCX metadata
  if (originalName.match(/\.(docx|doc)$/i)) {
    return extractDOCXMetadata(filePath).then(docxMeta => {
      metadata.docx = docxMeta;
      metadata.sensitive = metadata.sensitive.concat(docxMeta.sensitive);
      return metadata;
    });
  }

  // ZIP metadata
  if (originalName.match(/\.(zip|rar|7z)$/i)) {
    metadata.zip = extractZIPMetadata(filePath);
    metadata.sensitive = metadata.sensitive.concat(metadata.zip.sensitive);
  }

  return Promise.resolve(metadata);
}

router.post('/', async (req, res) => {
  try {
    const form = formidable({
      uploadDir: path.join(__dirname, '../uploads'),
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: 'File upload error: ' + err.message });
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      try {
        const metadata = await extractMetadata(file.filepath, file.originalFilename);

        // Clean up uploaded file
        fs.unlinkSync(file.filepath);

        // Save to database if available
        const { db } = require('../index');
        const database = db();
        if (database) {
          try {
            await database.execute(
              'INSERT INTO scan_history (tool_name, target, result) VALUES (?, ?, ?)',
              [file.originalFilename, JSON.stringify(metadata)]
            );
          } catch (error) {
            console.error('Database save error:', error.message);
          }
        }

        res.json({ metadata });
      } catch (error) {
        if (file && file.filepath && fs.existsSync(file.filepath)) {
          try {
            fs.unlinkSync(file.filepath);
          } catch (unlinkError) {
            // Ignore cleanup errors
          }
        }
        throw error;
      }
    });
  } catch (error) {
    console.error('Metadata extraction error:', error);
    res.status(500).json({ error: 'Failed to extract metadata' });
  }
});

module.exports = router;
