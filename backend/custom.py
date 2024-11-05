from flask import request


def custom_generate(messages):
    pass


def custom_save():
    conversation_tree = request.get_json().get("conversationTree")
    conversations = request.get_json().get("conversations")
    pass
