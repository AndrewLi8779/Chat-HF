import os

import tenacity
import yaml
from dotenv import load_dotenv

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from model import generate

load_dotenv()
app = Flask(__name__, static_folder='build', static_url_path='')
CORS(app)


@app.route('/api/getdefaultconfig', methods=['GET'])
def get_default_config():
    try:
        with open('../default_config.yaml', 'r') as file:
            config_data = yaml.safe_load(file)
        return jsonify(config_data)
    except FileNotFoundError:
        return jsonify()
    except yaml.YAMLError:
        return jsonify()


# Route to get env variables to chatbox js file for client side transcription without converting to full node.js app
@app.route('/api/getspeechkey', methods=['GET'])
def get_speech_key():
    return jsonify(
        {'azure_speech_key': os.getenv("AZURE_SPEECH_KEY"), 'azure_speech_region': os.getenv("AZURE_SPEECH_REGION")})


# Route to get model response
@app.route('/api/predict', methods=['POST'])
def predict():
    history = request.get_json().get("history")
    conv_hist = []
    for i in range(len(history)):
        conv_hist.append({'role': history[i]['role'], 'content': history[i]['content']})
    model = request.get_json().get("model")
    sys_prompt = request.get_json().get("sys_prompt")
    memory_len = int(request.get_json().get("memory_len"))
    diversity = float(request.get_json().get("diversity"))
    timeout = int(request.get_json().get("timeout"))
    try:
        response = generate(conv_hist, model, sys_prompt, memory_len, diversity, timeout)
    except tenacity.RetryError as e:
        response = "Sorry, the model timed out, please try again."
    message = {"response": response}
    return jsonify(message)


# Default route, renders app
@app.route('/index')
@app.route('/', methods=['GET'])
def index():
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0", port=2974)
