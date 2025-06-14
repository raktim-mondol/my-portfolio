# 🤖 Raktim Mondol's Portfolio with RAGtim Bot

A modern, responsive portfolio website featuring an intelligent AI assistant powered by multiple backend options including Hugging Face Transformers.

## 🌟 Features

### Portfolio Website
- **Responsive Design**: Beautiful, mobile-first design with dark/light theme support
- **Interactive Sections**: Education, Experience, Skills, Research, Publications, Awards
- **Audio Summaries**: Listen to AI-generated summaries of research papers
- **Thesis Mind Map**: Interactive visualization of PhD research (desktop only)
- **Contact Form**: Direct email integration with validation

### RAGtim Bot - AI Assistant
- **Multiple Backend Options**: Choose from Hugging Face Space, Backend Server, or Netlify Functions
- **Advanced Search**: Hybrid semantic + keyword search for accurate responses
- **Comprehensive Knowledge**: Covers all aspects of Raktim's expertise
- **Real-time Chat**: Instant responses with conversation history
- **Performance Optimized**: Caching and efficient processing

## 🚀 RAGtim Bot Deployment Options

### Option 1: Hugging Face Space (Recommended) 🤗
**Pros**: Free GPU acceleration, no API keys needed, automatic scaling
**Best for**: Public deployment, maximum performance

```bash
# Set environment variable
VITE_USE_HUGGING_FACE=true
```

**Live Demo**: [RAGtim Bot on Hugging Face](https://huggingface.co/spaces/raktimhugging/ragtim-bot)

### Option 2: Backend Server 🖥️
**Pros**: Full control, local processing, custom configurations
**Best for**: Development, private deployments

```bash
# Set environment variables
VITE_USE_BACKEND=true
VITE_BACKEND_URL=http://localhost:3001
VITE_DEEPSEEK_API_KEY=your_api_key

# Start backend server
cd server
npm install
npm run dev

# Start frontend
npm run dev
```

### Option 3: Netlify Functions ⚡
**Pros**: Serverless, automatic scaling, integrated with Netlify
**Best for**: Simple deployments, cost-effective

```bash
# Set environment variable
VITE_DEEPSEEK_API_KEY=your_api_key
# (VITE_USE_HUGGING_FACE and VITE_USE_BACKEND should be false or unset)
```

## 🛠️ Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd portfolio
npm install
```

### 2. Choose Your RAG Backend

#### For Hugging Face Space (Easiest):
```bash
echo "VITE_USE_HUGGING_FACE=true" > .env
npm run dev
```

#### For Backend Server:
```bash
echo "VITE_USE_BACKEND=true" > .env
echo "VITE_BACKEND_URL=http://localhost:3001" >> .env
echo "VITE_DEEPSEEK_API_KEY=your_api_key" >> .env

# Start both frontend and backend
npm run dev:full
```

#### For Netlify Functions:
```bash
echo "VITE_DEEPSEEK_API_KEY=your_api_key" > .env
npm run dev
```

### 3. Open Browser
Visit `http://localhost:5173` to see the portfolio with RAGtim Bot!

## 📊 RAGtim Bot Comparison

| Feature | Hugging Face | Backend Server | Netlify Functions |
|---------|-------------|----------------|-------------------|
| **Setup Complexity** | ⭐ Easy | ⭐⭐⭐ Complex | ⭐⭐ Medium |
| **Performance** | ⭐⭐⭐ Excellent | ⭐⭐⭐ Excellent | ⭐⭐ Good |
| **Cost** | 🆓 Free | 💰 Server costs | 💰 Function costs |
| **Scalability** | ⭐⭐⭐ Auto | ⭐⭐ Manual | ⭐⭐⭐ Auto |
| **Customization** | ⭐⭐ Limited | ⭐⭐⭐ Full | ⭐⭐ Medium |
| **API Key Required** | ❌ No | ✅ Yes | ✅ Yes |

## 🎯 RAGtim Bot Capabilities

### What You Can Ask:
- **Research**: "What is Raktim's research about?"
- **Publications**: "Tell me about BioFusionNet"
- **Skills**: "What programming languages does he know?"
- **Experience**: "Where has he worked?"
- **Education**: "What degrees does he have?"
- **Statistics**: "What statistical methods does he use?"
- **Contact**: "How can I reach Raktim?"

### Technical Features:
- **Semantic Search**: Understanding context and meaning
- **Keyword Matching**: Exact term matching for precision
- **Conversation Memory**: Maintains chat history
- **Response Caching**: Fast repeated queries
- **Error Handling**: Graceful fallbacks and error messages

## 🔧 Development

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development (if using backend server)
```bash
cd server
npm run dev          # Start backend in development
npm run start        # Start backend in production
npm run install-models  # Pre-download AI models
```

### Full Stack Development
```bash
npm run dev:full     # Start both frontend and backend
npm run build:full   # Build both frontend and backend
```

## 🚀 Deployment

### Deploy to Netlify (with Hugging Face)
1. Set `VITE_USE_HUGGING_FACE=true` in Netlify environment variables
2. Deploy normally - no additional configuration needed!

### Deploy to Netlify (with Functions)
1. Set `VITE_DEEPSEEK_API_KEY` in Netlify environment variables
2. Netlify Functions will be automatically deployed

### Deploy Backend Server
Choose from:
- **Railway**: Easy deployment with automatic scaling
- **Render**: Free tier available, good for development
- **DigitalOcean**: Full control, various pricing options
- **AWS/GCP**: Enterprise-grade with advanced features

## 📱 Mobile Experience

- **Responsive Design**: Optimized for all screen sizes
- **Touch-Friendly**: Large buttons and easy navigation
- **Fast Loading**: Optimized assets and lazy loading
- **Offline Fallback**: Graceful degradation when offline

## 🎨 Customization

### Themes
- Light and dark mode support
- Consistent color scheme throughout
- Smooth transitions and animations

### Content
- Easy content updates via markdown files
- Modular component structure
- Configurable sections and features

## 🔒 Security & Privacy

- **No Data Storage**: Conversations are not stored permanently
- **Secure APIs**: All API calls use HTTPS
- **Input Validation**: Prevents malicious inputs
- **Rate Limiting**: Prevents abuse and spam

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Fast Loading**: Optimized bundle sizes
- **Efficient Caching**: Smart caching strategies
- **CDN Ready**: Optimized for global delivery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Hugging Face**: For providing free GPU-accelerated AI hosting
- **OpenAI/DeepSeek**: For powerful language models
- **Netlify**: For seamless deployment and functions
- **React/Vite**: For the excellent development experience
- **Tailwind CSS**: For beautiful, responsive styling

---

**Live Demo**: [mondol.me](https://mondol.me)
**RAGtim Bot**: [Hugging Face Space](https://huggingface.co/spaces/raktimhugging/ragtim-bot)

Built with ❤️ by Raktim Mondol