# Setting Up and Using the Qwen API

This document provides guidance on using the Qwen3 API in this application.

## What is Qwen?

Qwen (pronounced as "chuen") is a series of large language models developed by Alibaba Cloud. Qwen3 is the latest generation model that offers excellent performance across a range of natural language tasks, including Vietnamese language support.

## API Key Setup

1. **Get an API Key**: 
   - Visit the [Alibaba Cloud DashScope platform](https://dashscope.aliyun.com)
   - Create an account or sign in
   - Navigate to the API Keys section
   - Create a new API key

2. **Input your API Key in the application**:
   - When you open the application, you'll see an API Key input field
   - Enter your Qwen API key and click "Lưu" (Save)
   - The key will be stored in your browser's memory (not sent to any server)
   - You'll need to enter it again if you close or refresh the browser

## How the API is Used in this Application

1. **PDF Processing**:
   - When you upload a PDF, the application extracts text from it
   - The text is split into manageable chunks
   - These chunks are stored in memory (not sent to any server)

2. **Question Answering**:
   - When you ask a question, the application:
     - Finds the most relevant chunks from your PDF
     - Creates a prompt with these chunks as context
     - Sends this prompt to the Qwen API with your question
     - Displays the response

3. **API Configuration**:
   - The application uses the following Qwen model settings:
     - Model: `qwen2-72b-instruct`
     - Temperature: 0.7
     - Top-P: 0.8
     - Maximum tokens: 1500

## Privacy Considerations

- Your API key is stored only in browser memory
- PDF contents are processed in your browser
- Only your question and relevant chunks from the PDF are sent to the Qwen API
- No data is stored on any server beyond the temporary processing required by the Qwen API

## Troubleshooting

If you encounter issues with the API:

1. **Check your API key**: Ensure it's correctly entered without extra spaces
2. **API limits**: Be aware of any rate limits or token quotas from Alibaba Cloud
3. **Network issues**: Ensure you have a stable internet connection
4. **PDF processing**: Some PDFs may not extract text correctly due to formatting
5. **Error messages**: The application will display error messages from the API to help diagnose issues 