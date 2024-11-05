# Chat-HF
Link: http://nlprx.cc.gatech.edu:2974/
### To deploy:
1. Go to frontend/app and run "npm run build"
2. Copy the build folder into backend 
3. Go to the backend and run pip install -r requirements.txt
4. Fill in the blank .env file. This where to put your Azure Speech service key and region and API keys. If you're using .env to store API keys, the API key and endpoint must match the modelTitle in the configuration file's model list, in the format {modelTitle}_API_KEY and {modelTitle}_ENDPOINT, such as in the provided .env and config files.
5. For testing purposes, run python app.py
