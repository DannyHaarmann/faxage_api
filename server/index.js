const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());

// Replace with your Faxage API credentials
const FAXAGE_USERNAME = 'YOUR_FAXAGE_USERNAME';
const FAXAGE_PASSWORD = 'YOUR_FAXAGE_PASSWORD';
const FAXAGE_APIKEY = 'YOUR_FAXAGE_APIKEY';

app.post('/send-fax', upload.single('file'), async (req, res) => {
  const { faxNumber, email } = req.body;
  const file = req.file;
  if (!faxNumber || !email || !file) {
    return res.json({ success: false, error: 'Missing required fields.' });
  }
  try {
    // Prepare Faxage API request
    const formData = new FormData();
    formData.append('username', FAXAGE_USERNAME);
    formData.append('password', FAXAGE_PASSWORD);
    formData.append('api_key', FAXAGE_APIKEY);
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
      res.json({ success: false, error: 'Faxage API error.' });
    }
  } catch (err) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.json({ success: false, error: 'Server error.' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
