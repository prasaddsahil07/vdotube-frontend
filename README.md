# VdoTube Frontend

A modern video sharing platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- User authentication (login/register)
- Video upload and streaming
- Like and comment system
- User profiles and channels
- Playlist management
- Watch history
- Responsive design

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running (see backend setup)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vdotube-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp env.example .env.local
   ```
   
   Update the `.env.local` file with your backend API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   url=http://localhost:8000/api/v1
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Backend Setup

Make sure your backend server is running on `http://localhost:8000` with the following configuration:

1. **Backend Environment Variables**
   
   Create a `.env` file in the backend directory:
   ```env
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/vdotube
   ACCESS_TOKEN_SECRET=your_access_token_secret_here
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
   CORS_ORIGIN=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

2. **Start the backend server**
   ```bash
   cd ../vdotube-backend
   npm install
   npm run dev
   ```

## Key Changes Made

### Authentication
- Updated login/register to handle backend cookie-based authentication
- Added proper CORS credentials handling
- Fixed token extraction from cookies and headers

### API Integration
- All API calls now include `credentials: 'include'` for proper cookie handling
- Updated API endpoints to match backend routes
- Added proper error handling for API responses

### Branding
- Replaced all "Vidloom" references with "VdoTube"
- Updated UI text and branding throughout the application

### Configuration
- Added Next.js configuration for environment variables
- Configured image domains for Cloudinary
- Added example environment files

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Notifications**: Sonner

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── functions/           # API functions and utilities
├── lib/                 # Utility functions
├── store/              # Redux store configuration
└── ui/                 # Base UI components
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
