const dog1 = document.getElementById('dog1');
const dog2 = document.getElementById('dog2');

dog1.crossOrigin = 'anonymous';
dog2.crossOrigin = 'anonymous';

const apilist =[
    "https://cataas.com/cat",
    "https://dog.ceo/api/breeds/image/random",
    "https://foodish-api.com/api/"
]

let api = apilist[Math.floor(Math.random() * apilist.length)];
let api2 = apilist[Math.floor(Math.random() * apilist.length)];

if(api == 'https://cataas.com/cat'){
    dog1.src = 'https://cataas.com/cat?' + Math.random();
    console.log('Img1 = ' + api + 'Random = cat')
} else {
    fetch(api)
    .then(response => response.json())
    .then(data => {
        if(data.message) {
            dog1.src = data.message;
            console.log('Img1 = ' + api + 'Random = Dog')
        } else {
            dog1.src = data.image;
            console.log('Img1 = ' + api + 'Random = food')
        }
        console.log(dog1)
    });
}

if(api2 == 'https://cataas.com/cat'){
    dog2.src = 'https://cataas.com/cat?' + Math.random();
    console.log('Img2 = ' + api2 + 'Random = cat')
} else {
    fetch(api2)
    .then(response => response.json())
    .then(data => {
        if(data.message) {
            dog2.src = data.message;
            console.log('Img2 = ' + api2 + 'Random = Dog')
        } else {
            dog2.src = data.image;
            console.log('Img2 = ' + api2 + 'Random = food')
        }
        console.log(dog2)
    });
}

// <- This thing knows if you upload the image then replaces the random img with yours -> //

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

// <- This reloads the page but i forgot what i put it to do so like idk -> //

document.getElementById('rf').addEventListener('click', function() {
    location.reload();
})

// <- this button is the send button it sends the images to worker (ai) -> //

document.getElementById('nc').addEventListener('click', async function() {
    const res = document.getElementById('res');
    res.textContent = "Loading";
    res.classList.add('loading');
    await sendAi();
    res.classList.remove('loading');
});


// <- Main send thing 6000 or whatever -> //

async function sendAi() {
    // <- Convert to base64 so worker gets exact same images not new random ones -> //
    const canvas1 = document.createElement('canvas');
    const canvas2 = document.createElement('canvas');
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    
    canvas1.width = dog1.naturalWidth;
    canvas1.height = dog1.naturalHeight;
    canvas2.width = dog2.naturalWidth;
    canvas2.height = dog2.naturalHeight;
    
    ctx1.drawImage(dog1, 0, 0);
    ctx2.drawImage(dog2, 0, 0);
    
    const base64_1 = canvas1.toDataURL('image/jpeg');
    const base64_2 = canvas2.toDataURL('image/jpeg');
    
    console.log('Object 1 URL:', dog1.src.substring(0, 100));
    console.log('Object 2 URL:', dog2.src.substring(0, 100));
    
    const response = await fetch('https://dogfight-api.therealdominic84plays.workers.dev', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            dog1: base64_1,
            dog2: base64_2,
            mode: 'ran'
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

// <- THe cat and upload buttons -> //

document.getElementById('cm').addEventListener('click', function() {
    window.location.href = 'cat.html';
});

// <- So basicly code says "Click = open file explore" -> //

document.getElementById('upload-btn').addEventListener('click', function() {
    document.getElementById('upload').click();
});

