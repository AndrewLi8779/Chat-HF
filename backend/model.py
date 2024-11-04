import copy
import os

from transformers import AutoTokenizer, pipeline

import openai
import anthropic
import google.generativeai as genai
from mistralai import Mistral
from openai import OpenAI
from openai import AzureOpenAI
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt

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
        pass

    elif model['provider'] == 'Ollama':
        # Ollama API may not need initialization like OpenAI
        pass


@retry(stop=stop_after_attempt(3))
def generate(history, model, sys_prompt, memory_len, diversity, timeout):
    if model['type'] == 'API':
        set_api(model)

    system_prompt = {'role': 'system', 'content': sys_prompt}
    if len(history) > memory_len:
        conversation_history = history[-memory_len:]
    else:
        conversation_history = copy.deepcopy(history)

    conversation_history.insert(0, system_prompt)
    model_response = ''

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
            pass

        elif model['provider'] == 'Gemini':
            # Call the Gemini API (modify as needed)
            pass

        elif model['provider'] == 'Mistral':
            # Call the Mistral API (modify as needed)
            pass

        elif model['provider'] == 'HuggingFace':
            pipe = pipeline("text-generation", "HuggingFaceH4/zephyr-7b-beta")
            model_response = pipe(conversation_history)[0]['generated_text'][-1]

        elif model['provider'] == 'Ollama':
            # Call Ollama API (modify as needed)
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
