import gradio as gr
import requests
import json
from transformers import pipeline
import os

# Initialize the embedding model
embedder = pipeline('feature-extraction', 'sentence-transformers/all-MiniLM-L6-v2')

# Your knowledge base and search logic here
def search_knowledge_base(query):
    # Implement your search logic
    return f"Search results for: {query}"

def chat_interface(message, history):
    # Your RAG logic here
    response = search_knowledge_base(message)
    return response

# Create Gradio interface
iface = gr.ChatInterface(
    fn=chat_interface,
    title="RAGtim Bot - Raktim's AI Assistant",
    description="Ask me anything about Raktim Mondol's research, experience, and expertise!"
)

if __name__ == "__main__":
    iface.launch()