# Gemini Image Chatbot — Multimodal Vision AI 

![Gemini Image Chatbot](public/favicon.svg) <!-- You can replace this with a screenshot of the app later -->

A highly responsive, premium multimodal AI application built with React and powered by Google's **Gemini 2.5 Flash** model. This application allows users to upload images and engage in natural language conversations about them. Whether it's object identification, scene description, or complex visual reasoning, this app handles it with a beautiful, modern UI.

## Key Features

- **Multimodal AI Analysis**: Powered by the robust `gemini-2.5-flash` model for high-speed, accurate image reasoning.
- **Context-Aware Conversations**: Retains multi-turn chat history so you can ask follow-up questions about the uploaded image seamlessly.
- **Premium App-Shell UI**: Designed with modern glassmorphism, animated mesh gradients, and a sleek split-pane layout for a desktop-grade experience.
- **Rich Text Rendering**: AI responses are fully formatted with Markdown (bolding, lists, code blocks) using `react-markdown` and Tailwind Typography.
- **Smart Error Handling**: Gracefully handles API quota limits, invalid keys, and safety blocks with user-friendly alerts.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for lightning-fast HMR and optimized builds
- **Styling**: Tailwind CSS & custom Vanilla CSS for advanced animations
- **Icons**: Lucide React
- **AI SDK**: `@google/generative-ai` (Latest Official SDK)
- **Markdown Parsing**: `react-markdown` & `remark-gfm`

## Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- A Google Gemini API Key. You can get one for free from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Deep6908/Gemini-Image-Chatbot.git
   cd Gemini-Image-Chatbot
