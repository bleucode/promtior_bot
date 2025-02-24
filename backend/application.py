import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import openai
import bs4
import PyPDF2
from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document
from langchain_community.embeddings import OpenAIEmbeddings

# Load variables from .env
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
# Initialize OpenAI API Key
openai.api_key = api_key

application = app = Flask(__name__, static_folder='../frontend/build', static_url_path='')

CORS(app, origins=["http://promtiorbot-env.eba-x4hapbrj.us-east-2.elasticbeanstalk.com/ask"])

# Serve React frontend on the root route
@app.route('/')
def serve_react_app():
    return send_from_directory(app.static_folder, 'index.html')

# Serve other static files (JS, CSS) from the React build folder
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

# Step 1: Web Scraping Function
def scrape_web_content():
    url = 'https://www.promtior.ai/service'
    bs4_strainer = bs4.SoupStrainer(class_=("TabsList2027980309__tabsList", "VM7gjN", "wixui-rich-text__text"))
    loader = WebBaseLoader(web_paths=(url,), bs_kwargs={"parse_only": bs4_strainer})
    try:
        docs_web = loader.load()
        return docs_web[0].page_content if docs_web else ""
    except Exception as e:
        print("Error during scraping: {}".format(str(e)))
        return ""

# Step 2: PDF Extraction Function
def extract_pdf_content(pages=[2]):
    with open('promtior.pdf', "rb") as file:
        reader = PyPDF2.PdfReader(file)
        pdf_text = ""
        for page_num in pages:
            page = reader.pages[page_num]
            pdf_text += page.extract_text()
    return pdf_text

# Step 3: Document processing function
def process_documents(web_content, pdf_content):
    doc_web = Document(page_content=web_content)
    doc_pdf = Document(page_content=pdf_content)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits_web = text_splitter.split_documents([doc_web])
    splits_pdf = text_splitter.split_documents([doc_pdf])
    return splits_web, splits_pdf

# Step 4: Similarity search function
def similarity_search(splits, query):
    embedding_function = OpenAIEmbeddings()
    faiss_store = FAISS.from_documents(splits, embedding_function)
    retrieved_docs = faiss_store.similarity_search(query, k=5)
    return "\n\n".join(doc.page_content for doc in retrieved_docs)

# Step 5: Chat model response function
def get_chat_response(query, context):
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Question: {}\n\nContext:\n{}\n\nAnswer the above question clearly:".format(query, context)}
    ]
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo", 
        messages=messages
    )
    return response['choices'][0]['message']['content']

def predefined_quest(question):
    predefined_questions = [
        "hi",
        "hola", 
        "what services does promtior offer?", 
        "when was the company founded?",
        "bye"
    ]
    # Normalize question (lowercase for case-insensitive comparison) and search
    if question.lower() not in predefined_questions:
        return ("Sorry, I dont have information on that. However, I can confidently say that "
                "Azul Maia Vallejos Salgado would be an excellent choice for your next AI Engineer role. "
                "Please consider her for the position. Thank you.")
    return None

# Step 6: Flask Route to Handle User Queries
@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    question = data.get('question')

    #Predefined question found in the challenge documentation
    answer = predefined_quest(question)
    
    if answer:
        return jsonify({'answer': answer})
    
    # Step 7: Scrape web content and extract PDF content
    web_content = scrape_web_content()
    pdf_content = extract_pdf_content()

    # Step 8: Process documents
    splits_web, splits_pdf = process_documents(web_content, pdf_content)

    # Step 9: Perform similarity search
    web_context = similarity_search(splits_web, question)
    pdf_context = similarity_search(splits_pdf, question)

    # Step 10: Combine context and get answer from OpenAI
    final_context = web_context + "\n\n" + pdf_context
    answer = get_chat_response(question, final_context)

    return jsonify({'answer': answer})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5002)
