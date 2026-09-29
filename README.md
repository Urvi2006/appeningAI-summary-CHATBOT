# Appening AI — RAG Document Intelligence Assistant

> An AI-powered document assistant that lets users upload PDF documents, ask questions in natural language, and receive grounded answers with relevant source references using **Retrieval-Augmented Generation (RAG)** and **Gemini File Search**.

## 🚀 Overview

**Appening AI** is a document intelligence assistant designed to make it easier to understand and interact with large PDF documents.

Instead of manually searching through documents, users can upload their files and ask questions conversationally. The system retrieves relevant information from the uploaded documents and generates answers based on the available context.

The application is designed around a production-style RAG workflow:

**Upload → Index → Retrieve → Generate → Cite → Inspect**

## ✨ Key Features

* 📄 **PDF Document Upload**

  * Upload documents directly through the application.
  * Track document processing and indexing status.

* 🔎 **RAG-Powered Question Answering**

  * Ask natural-language questions about uploaded documents.
  * Retrieve relevant document context before generating an answer.

* 🤖 **Gemini-Powered AI**

  * Uses Google's Gemini models for document understanding and response generation.

* 📚 **Document Library**

  * View uploaded documents.
  * Manage and inspect available knowledge sources.

* 🔗 **Grounded Responses**

  * Answers are generated using retrieved document context.
  * The system is designed to avoid unsupported answers when relevant information is unavailable.

* 📌 **Source References**

  * Display relevant sources used to generate an answer.
  * Page references are shown when reliable page information is available from the retrieval system.

* 💬 **Conversational Chat**

  * Ask follow-up questions without repeatedly explaining the context.
  * Start new conversations when needed.

* 🧠 **Agent Activity**

  * Visualize important stages of the AI workflow such as retrieval and response generation.

* 📱 **Responsive Interface**

  * Designed for desktop, tablet, and mobile screen sizes.

* 🛡️ **Error Handling**

  * Handles invalid files, failed uploads, API failures, and unavailable document context gracefully.

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      User           │
                    │ Upload PDF / Ask Q  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │ Chat + Documents UI │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Backend API      │
                    │  Request Handling   │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
        ┌─────────────────┐        ┌──────────────────┐
        │ Gemini File     │        │ Gemini Model     │
        │ Search          │───────▶│ Answer Generation│
        │ Retrieval       │        │                  │
        └────────┬────────┘        └─────────┬────────┘
                 │                           │
                 └─────────────┬─────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Grounded Response   │
                    │ + Source References │
                    └─────────────────────┘
```

## 🔄 RAG Workflow

### 1. Upload

The user uploads a supported PDF document.

### 2. Index

The document is processed and added to the application's searchable knowledge base using Gemini File Search.

### 3. Retrieve

When a user asks a question, the system searches the indexed document for relevant information.

### 4. Generate

The retrieved context is provided to the Gemini model to generate an answer.

### 5. Ground

The response is based on the retrieved document context rather than relying solely on the model's general knowledge.

### 6. Cite

Relevant source information is presented alongside the response whenever available.

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Modern responsive UI
* Component-based architecture

### Backend

* Node.js
* API-based architecture
* Server-side AI integration

### AI / RAG

* Google Gemini
* Gemini File Search
* Retrieval-Augmented Generation (RAG)
* Large Language Models (LLMs)

### Development

* Git
* GitHub
* Environment variables
* API-based integration

---

## 📂 Project Structure

```text
appening-ai-rag-assistant/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── controllers/
│   └── ...
│
├── public/
│
├── .env.example
├── package.json
├── README.md
└── ...
```

> The exact structure may vary depending on the final implementation generated by Google AI Studio.

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have:

* Node.js installed
* npm installed
* A Google AI Studio / Gemini API key
* Git installed

### 1. Clone the repository

```bash
git clone https://github.com/Urvi2006/appening-ai-rag-assistant.git
cd appening-ai-rag-assistant
```

### 2. Install dependencies

```bash
npm install
```

If the project contains separate frontend and backend applications:

```bash
cd frontend
npm install

cd ../backend
npm install
```

### 3. Configure environment variables

Create a `.env` file based on `.env.example`.

```env
GEMINI_API_KEY=your_api_key_here
```

**Never commit your API key to GitHub.**

Make sure `.env` is included in `.gitignore`.

### 4. Start the application

Use the project's configured development command, for example:

```bash
npm run dev
```

If frontend and backend run separately, start both development servers according to their respective package scripts.

---

## 🧪 Testing

The application should be tested using real documents and real user flows.

### Basic Test

1. Upload a PDF.
2. Wait for indexing to complete.
3. Ask a question whose answer exists in the PDF.
4. Verify that the response is grounded in the document.
5. Inspect the displayed source reference.
6. Ask a follow-up question.

### Out-of-Document Test

Ask a question that is unrelated to the uploaded document.

The assistant should clearly indicate when the required information cannot be found instead of presenting an unsupported answer as fact.

### Additional Tests

* Upload multiple PDFs.
* Upload an invalid file.
* Test large documents.
* Test API failure.
* Test failed indexing.
* Refresh the application.
* Start a new conversation.
* Test mobile layout.
* Test desktop layout.
* Test repeated questions.
* Test follow-up questions.

---

## 🔐 Security Considerations

* API keys must remain server-side.
* `.env` files must not be committed.
* User-uploaded files should be validated.
* API errors should not expose sensitive configuration.
* Secrets should never be hardcoded in frontend code.
* Production deployments should use secure environment variables.

---

## 🎯 Project Objectives

The project was built to demonstrate practical implementation of:

* Retrieval-Augmented Generation
* Document Question Answering
* LLM application development
* Semantic search
* AI-powered document processing
* Source-grounded responses
* Full-stack AI application development
* API integration
* Responsive frontend development
* Production-oriented error handling

---

## 🔮 Future Improvements

Potential future enhancements include:

* Multi-format document support
* DOCX and TXT ingestion
* Advanced document analytics
* Conversation persistence
* User authentication
* Team workspaces
* Document sharing
* Advanced source highlighting
* Document comparison
* Voice-based interaction
* Streaming responses
* Evaluation datasets for RAG accuracy
* Retrieval quality monitoring
* Admin analytics dashboard

---

## 📸 Screenshots

Add screenshots of the application here once the UI is finalized.

```text
screenshots/
├── dashboard.png
├── document-upload.png
├── chat.png
└── source-inspector.png
```

---

## 👩‍💻 Author

**Urvi Kasbe**

BSc IT | AI & Software Development

GitHub: [Urvi2006](https://github.com/Urvi2006)

LinkedIn: [Urvi Kasbe](https://www.linkedin.com/in/urvi-kasbe/)

---

## 📄 License

This project is intended for educational, portfolio, and demonstration purposes.

---

⭐ If you find this project useful, consider giving the repository a star.
