#!/bin/bash

echo "Installing SamirAI..."

cd backend
npm install
cd ..

cd frontend
npm install
cd ..

ollama pull qwen2.5:7b

echo "SamirAI installed successfully."
echo "Run backend: cd backend && npm run dev"
echo "Run frontend: cd frontend && npm run dev"