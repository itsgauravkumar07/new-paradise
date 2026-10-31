const http = require('http');

http.get('http://localhost:3000/fixed-departures/char-dham-yatra-haridwar', (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const hasCollage = data.includes('char_dham_collage.png');
        console.log('Includes char_dham_collage?', hasCollage);
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
