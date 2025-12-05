const dog1 = document.getElementById('dog1');
const dog2 = document.getElementById('dog2');


// <- This thing knows if you upload the image then replaces the random Cat img with yours -> //

document.getElementById('upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            dog1.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});


// <- MAth random so it reload the images ✅ -> //

dog1.src = 'https://cataas.com/cat?' + Math.random();
dog2.src = 'https://cataas.com/cat?' + Math.random();

document.getElementById('rf').addEventListener('click', function() {
    location.reload();
})

document.getElementById('nc').addEventListener('click', async function() {
    document.getElementById('res').textContent = "Loading";
    await sendAi();
});


// <- Main send thing 6000 or whatever -> //

async function sendAi() {
    const response = await fetch('https://dogfight-api.therealdominic84plays.workers.dev', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            dog1: dog1.src,
            dog2: dog2.src,
            mode: 'cat'
        })
    });

    // <- This is raw json response it also logs to consle -> //
    const data = await response.json();
    console.log('API Response:', data);
    
    // <- this is for the logs so it will say if issue or not -> //

    if (!response.ok) {
        console.error('API Error:', data);
        document.getElementById('res').textContent = 'Error: ' + (data.error?.message || 'API request failed');
        return;
    }
    
    if (data.error) {
        console.error('API Error:', data.error);
        document.getElementById('res').textContent = 'Error: ' + data.error.message;
        return;
    }
    
    // <- This puts the awnser & makes it show in consle -> //

    const answer = data.choices[0].message.content;
    console.log('AI Answer:', answer);
    document.getElementById('res').textContent = answer;
}

// <- The dog mode and uploasd buttons -> //

document.getElementById('cm').addEventListener('click', function() {
    window.location.href = 'index.html';
});

document.getElementById('upload-btn').addEventListener('click', function() {
    document.getElementById('upload').click();
});
