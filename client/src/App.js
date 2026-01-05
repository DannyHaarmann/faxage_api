import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [faxNumber, setFaxNumber] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !faxNumber || !email || !username || !password) {
      setStatus('Please fill in all fields.');
      return;
    }
    console.log('File debug:', file);
    if (!(file instanceof File)) {
      setStatus('Selected file is not valid. Please choose a PDF file again.');
      console.error('File is not instance of File:', file);
      return;
    }
    if (file.type !== 'application/pdf') {
      setStatus('Only PDF files are allowed.');
      console.error('File type is not PDF:', file.type);
      return;
    }
    if (!(file instanceof Blob)) {
      setStatus('File is not a Blob.');
      console.error('File is not a Blob:', file);
      return;
    }
    console.log('File is valid. Type:', file.type, 'Size:', file.size);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('faxNumber', faxNumber);
    formData.append('email', email);
    formData.append('username', username);
    formData.append('company', '121117');
    formData.append('password', password);
    setStatus('Sending fax...');
    try {
      const response = await fetch('https://faxage-api.onrender.com/send-fax', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setStatus('Fax sent successfully! Confirmation will be emailed.');
      } else {
        setStatus('Failed to send fax: ' + data.error);
      }
    } catch (err) {
      setStatus('Error sending fax.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Send a Fax</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Faxage Username:</label><br />
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Faxage Username" />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Faxage Password:</label><br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Faxage Password" />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>File to Fax:</label><br />
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Fax Number:</label><br />
          <input type="text" value={faxNumber} onChange={e => setFaxNumber(e.target.value)} placeholder="e.g. 1234567890" />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Confirmation Email:</label><br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
        </div>
        <button type="submit" style={{ marginTop: 20 }}>Send Fax</button>
      </form>
      {status && <div style={{ marginTop: 20 }}>{status}</div>}
    </div>
  );
}

export default App;
