const formidable = require("formidable");

const fileParser = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  // If it's JSON, let express.json() handle it (should already be parsed)
  // But we still need to initialize req.files
  if (contentType.includes('application/json')) {
    req.body = req.body || {};
    req.files = req.files || {};
    console.log('📦 JSON request detected, body already parsed by express.json()');
    console.log('📦 Request body keys:', Object.keys(req.body));
    return next();
  }
  
  // For multipart/form-data, use formidable
  console.log('📦 FormData request detected, parsing with formidable');
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("❌ Error parsing the files", err);
      return next(err);
    }

    req.body = req.body || {};
    console.log('📦 FormData fields:', Object.keys(fields));
    
    // Parse fields from FormData
    for (const key in fields) {
      if (fields[key]) {
        const value = fields[key][0];

        try {
          // Try to parse as JSON (for nested objects/arrays)
          req.body[key] = JSON.parse(value);
        } catch (e) {
          // If not JSON, use as string
          req.body[key] = value;
        }

        // Convert numeric strings to numbers
        if (
          typeof req.body[key] === "string" &&
          !isNaN(req.body[key]) &&
          req.body[key].trim() !== ""
        ) {
          req.body[key] = Number(req.body[key]);
        }
      }
    }
    
    // Handle files
    req.files = req.files || {};
    for (const key in files) {
      const actualFiles = files[key];
      if (!actualFiles) break;

      if (Array.isArray(actualFiles)) {
        req.files[key] = actualFiles.length > 1 ? actualFiles : actualFiles[0];
      } else {
        req.files[key] = actualFiles;
      }
    }
    
    console.log('📦 Parsed body keys:', Object.keys(req.body));
    console.log('📦 Parsed files keys:', Object.keys(req.files));
    next();
  });
};

module.exports = fileParser;
