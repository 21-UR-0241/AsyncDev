# ⚡AI Async Studio

An AI-powered marketing visual generator that creates stunning, brand-tailored images through an interactive onboarding process. Built with modern web technologies and powered by Google's Gemini 2.5 Flash model.

![AI Async Studio](https://img.shields.io/badge/React-18.3.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue) ![Vite](https://img.shields.io/badge/Vite-5.4.19-yellow) ![Supabase](https://img.shields.io/badge/Supabase-2.58.0-green)

## ✨ Features

- **Interactive Onboarding**: Step-by-step process to collect your brand preferences (industry, niche, goals, style, format, profile)
- **AI-Powered Generation**: Leverages Google's Gemini 2.5 Flash model for high-quality image creation
- **Smart Prompt Building**: Automatically constructs detailed prompts based on your onboarding data
- **Customizable Prompts**: Edit generated prompts before image creation
- **Image Gallery**: View and manage all generated images
- **Download Options**: Save images in various formats
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Modern UI**: Built with ShadCN UI components and Tailwind CSS

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **ShadCN UI** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Low-level UI primitives
- **React Router** - Client-side routing
- **TanStack Query** - Powerful data synchronization

### Backend

- **Supabase Functions** - Serverless functions powered by Deno API
- **Supabase** - Backend-as-a-Service for database and auth

### AI Integration

-
- **Google Gemini 2.5 Flash** - Advanced multimodal AI model for image generation

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or bun package manager
- Supabase CLI (for local development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd async-ai-studio
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up Supabase**

   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase

   # Initialize Supabase (if not already done)
   supabase init

   # Start Supabase locally
   supabase start
   ```

4. **Environment Variables**

   Create a `.env` file in the root directory and add your API keys:

   ```env
   # Lovable AI Gateway API Key (required for image generation)
   LOVABLE_API_KEY=your_lovable_api_key_here

   # Supabase configuration (if using custom Supabase instance)
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   > **Note**: Get your `LOVABLE_API_KEY` from your Lovable workspace settings.

5. **Deploy Supabase Functions** (for local development)
   ```bash
   supabase functions deploy generate-image
   ```

### Running the Application

1. **Start the development server**

   ```bash
   npm run dev
   # or
   bun run dev
   ```

2. **Open your browser**

   Navigate to `http://localhost:5173` (or the port shown in your terminal).

## 📖 Usage

### Onboarding Process

1. **Welcome**: Introduction to the AI Async Studio
2. **Industry**: Select your business industry
3. **Niche**: Define your specific market niche
4. **Goals**: Choose your marketing objectives
5. **Style**: Pick your preferred visual style
6. **Format**: Select image format and dimensions
7. **Profile**: Provide brand details and preferences

### Generating Images

1. After completing onboarding, you'll see the main dashboard
2. Review the auto-generated prompt based on your preferences
3. Customize the prompt if needed using the prompt input
4. Click "Generate Image" to create your visual
5. View generated images in the gallery
6. Download images in your preferred format

## 📁 Project Structure

```
async-ai-studio/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── steps/         # Onboarding step components
│   │   └── ui/            # ShadCN UI components
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # External service integrations
│   │   └── supabase/      # Supabase client and types
│   ├── lib/               # Utility libraries
│   ├── pages/             # Page components
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── ...
├── supabase/
│   ├── functions/         # Serverless functions
│   │   └── generate-image/# Image generation function
│   └── config.toml        # Supabase configuration
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style and conventions
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ShadCN UI](https://ui.shadcn.com/) for the beautiful component library
- [Google Gemini](https://ai.google.dev/) for the powerful AI model
- [Supabase](https://supabase.com/) for the backend infrastructure

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Check the documentation
- Reach out to the maintainers

---

**Made with ❤️ using modern web technologies**
