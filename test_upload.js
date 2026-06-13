
const fs = require('fs');
fetch('http://localhost:4321/api/thumbnails', {
  method: 'POST',
  body: (() => {
    const formData = new FormData();
    formData.append('file', new Blob(['test']), 'test.txt');
    return formData;
  })()
}).then(r => r.text()).then(console.log).catch(console.error);

