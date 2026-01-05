const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');


const app = express();
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const upload = multer({ dest: uploadsDir });
app.use(cors());

// Replace with your Faxage credentials
const FAXAGE_USERNAME = process.env.FAXAGE_USERNAME || 'YOUR_FAXAGE_USERNAME';
const FAXAGE_COMPANY = process.env.FAXAGE_COMPANY || 'YOUR_FAXAGE_COMPANY';
const FAXAGE_PASSWORD = process.env.FAXAGE_PASSWORD || 'YOUR_FAXAGE_PASSWORD';

app.post('/send-fax', upload.single('file'), async (req, res) => {
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  const { faxNumber, email, username, password } = req.body;
  const file = req.file;
  const company = '121117';
  if (!faxNumber || !email || !file || !username || !password) {
    return res.json({ success: false, error: 'Missing required fields.' });
  }
  try {
    // Prepare Faxage API request
    const formData = new FormData();
    formData.append('username', username);
    formData.append('company', company);
    formData.append('password', password);
    formData.append('faxnum', faxNumber);
    formData.append('notify_email', email);
    formData.append('file', fs.createReadStream(file.path), file.originalname);

    const response = await axios.post('https://api.faxage.com/httpsfax', formData, {
      headers: formData.getHeaders(),
    });
    // Clean up uploaded file
    fs.unlinkSync(file.path);
    if (response.data && response.data.includes('<Status>Success</Status>')) {
      res.json({ success: true });
    } else {
      res.json({ success: false, error: response.data || 'Faxage API error.' });
    }
  } catch (err) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.json({ success: false, error: err && err.message ? err.message : 'Server error.' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
