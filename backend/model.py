import copy
import os

from transformers import pipeline

import openai
import anthropic
import google.generativeai as genai
from mistralai import Mistral
from openai import OpenAI
from openai import AzureOpenAI
import ollama
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt

from backend.custom import custom_generate

load_dotenv()
client = None


def get_api_key(api_key, model_title):
    """Retrieve the API key from environment or use the provided key."""
    if api_key == 'env':
        return os.getenv(model_title + '_API_KEY')
    return api_key


def get_endpoint(endpoint, model_title):
    """Retrieve the endpoint from environment or use the provided endpoint."""
    if endpoint == 'env':
        return os.getenv(model_title + '_ENDPOINT')
    return endpoint


def set_api(model):
    global client

    if model['provider'] == 'Azure':
        api_key = get_api_key(model['apiKey'], model['modelTitle'])
        endpoint = get_endpoint(model['azureEndpoint'], model['modelTitle'])
        if client is None or client.api_key != api_key:
            client = AzureOpenAI(api_key=api_key, azure_endpoint=endpoint, api_version="2023-12-01-preview")
            return

    elif model['provider'] == 'OpenAI':
        api_key = get_api_key(model['apiKey'], model['modelTitle'])
        if client is None or client.api_key != api_key:
            client = OpenAI(api_key=api_key)
            return

    elif model['provider'] == 'Anthropic':
        api_key = get_api_key(model['apiKey'], model['modelTitle'])
        client = anthropic.Anthropic(
            api_key=api_key,
        )

    elif model['provider'] == 'Gemini':
        api_key = get_api_key(model['apiKey'], model['modelTitle'])
        genai.configure(api_key=api_key)

    elif model['provider'] == 'Mistral':
        api_key = get_api_key(model['apiKey'], model['modelTitle'])
        client = Mistral(api_key=api_key)


def convert_text_only(history):
    text_only_history = []

    for message in history:
        text_only_history.append({
            'role': message['role'],
            'content': message['content'][0]['text']
        })

    return text_only_history


@retry(stop=stop_after_attempt(3))
def generate(history, model, sys_prompt, memory_len, diversity, timeout):
    if model['type'] == 'API':
        set_api(model)

    system_prompt = {'role': 'system', 'content': sys_prompt}
    if len(history) > memory_len:
        conversation_history = history[-memory_len:]
    else:
        conversation_history = copy.deepcopy(history)

    if not model['imageCapable']:
        conversation_history = convert_text_only(conversation_history)

    conversation_history.insert(0, system_prompt)

    model_response = ''

    if model['type'] == 'Custom':
        model_response = custom_generate(conversation_history)

    try:
        if model['provider'] in ['Azure', 'OpenAI']:
            response = client.chat.completions.create(
                model=model['modelName'],
                messages=conversation_history,
                temperature=diversity,
                timeout=timeout,
            )
            model_response = response.choices[0].message.content

        elif model['provider'] == 'Anthropic':
            model_response = client.messages.create(
                messages=conversation_history,
                model=model['modelName'],
                temperature=diversity
            )

        elif model['provider'] == 'Gemini':
            model = genai.GenerativeModel(model['modelName'])
            model_response = model.generate_content(
                conversation_history,
                generation_config=genai.types.GenerationConfig(
                    temperature=diversity,
                ),
            ).text

        elif model['provider'] == 'Mistral':
            model_response = client.chat.complete(model=model['modelName'], messages=conversation_history, temperature=diversity)
            pass

        elif model['provider'] == 'HuggingFace':
            pipe = pipeline("text-generation", model['modelName'], temperature=diversity)
            model_response = pipe(conversation_history)[0]['generated_text'][-1]

        elif model['provider'] == 'Ollama':
            model_response = ollama.chat(model=model['modelName'], messages=conversation_history)
            pass

    except openai.APIConnectionError as e:
        return f"OpenAI API request failed to connect: {e}"
    except openai.BadRequestError as e:
        return f"OpenAI API request was invalid: {e}"
    except openai.RateLimitError as e:
        return f"OpenAI API request exceeded rate limit: {e}"
    except openai.APIStatusError as e:
        return f"OpenAI API status error: {e}"
    except Exception as e:
        return f"An error occurred: {e}"

    return model_response
