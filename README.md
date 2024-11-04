# ChattyChef
Link: http://nlprx.cc.gatech.edu:2974/
### To deploy:
1. Go to frontend and run node build
2. Copy the build folder to the build folder in backend 
3. Go to the backend and run pip install -r requirements.txt
4. Fill in the blank .env file. This should be your Azure OpenAI key, endpoint, and model name, Azure Speech service key and region.
5. For testing purposes, run python app.py