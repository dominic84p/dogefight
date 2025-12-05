# Dog Fight Predictor

ai predicts which dog would win in a fight lol

also has cat mode

## setup

1. get a free api key from google ai studio (https://aistudio.google.com/apikey)
2. create a cloudflare worker 
```bash
wrangler deploy -c wrangler-dogfight.toml
```
3. add your api key as a secret:
```bash
wrangler secret put GEMINI_KEY
```
4. create a kv namespace for rate limiting:
```bash
wrangler kv namespace create RATE_LIMIT
```
5. update the kv id in wrangler-dogfight.toml
6. deploy:
```bash
wrangler deploy -c wrangler-dogfight.toml
```
7. update the worker url in app.js and cat.js

note: switched from openrouter to gemini, Use older ver of worker (1.0.0) if want openrouter

## features

- upload your own dog/cat
- ai roasts them
- rate limiting so ppl cant spam
- secure api key storage

Special thanks to 
- https://dog.ceo/dog-api/
- https://cataas.com/cat

made with ❤️

Credits 
Dominic84p
Prolly slatefv or some shi idfk

Ps: Plz giv credit or I be sad, And if u deadazz sell ts ur a dick. 