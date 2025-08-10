# AI Image Processing App - React Native + Laravel

A full-stack mobile application that leverages AI-powered image processing capabilities through Cloudinary's AI services, built with React Native (Expo) and Laravel backend.

## 🚀 Key Features

### 🔐 Authentication & User Management
- **Secure Authentication**: JWT-based authentication using Laravel Sanctum
- **User Registration & Login**: Complete user registration and login system
- **Email Verification**: Built-in email verification system
- **Session Management**: Persistent user sessions with secure token storage

### 🎨 AI-Powered Image Processing
- **Generative Fill**: AI-powered image expansion with customizable aspect ratios (1:1, 4:3, 16:9)
- **Image Restoration**: AI-powered image enhancement and restoration
- **Object Removal**: Intelligent background-aware object removal
- **Image Recoloring**: AI-powered color transformation and enhancement

### 💳 Credit System & Payments
- **Credit-Based Operations**: Each AI operation consumes credits based on complexity
- **Stripe Integration**: Secure payment processing for credit purchases
- **Credit Packages**: Multiple pricing tiers (10, 50, 200 credits)
- **Transaction History**: Complete payment and credit usage tracking

### 📱 Mobile-First Design
- **Cross-Platform**: Built with Expo for iOS and Android compatibility
- **Modern UI/UX**: Tailwind CSS styling with dark/light theme support
- **Responsive Design**: Optimized for various screen sizes and orientations
- **Native Performance**: Smooth animations and gesture handling

### 🖼️ Image Management
- **Operation History**: Track all AI operations with before/after comparisons
- **Image Storage**: Cloudinary integration for scalable image storage
- **Gallery Integration**: Save processed images to device gallery
- **Full-Screen Viewer**: Enhanced image viewing experience

## 🏗️ Project Structure

```
react-native-laravel-app/
├── api/                          # Laravel Backend
│   ├── app/
│   │   ├── Enums/               # Operation credit definitions
│   │   ├── Http/
│   │   │   ├── Controllers/     # API controllers
│   │   │   ├── Middleware/      # Authentication middleware
│   │   │   └── Requests/        # Form validation
│   │   ├── Models/              # Eloquent models
│   │   └── Providers/           # Service providers
│   ├── config/                  # Laravel configuration
│   ├── database/                # Migrations and seeders
│   └── routes/                  # API route definitions
│
├── app/                         # React Native Frontend
│   ├── app/                     # Expo Router screens
│   │   ├── (app)/              # Protected app routes
│   │   │   ├── (tabs)/         # Tab navigation
│   │   │   ├── credits.tsx     # Credit purchase screen
│   │   │   ├── generative-fill.tsx
│   │   │   ├── recolor.tsx
│   │   │   ├── remove.tsx
│   │   │   └── restore.tsx
│   │   ├── sign-in.tsx         # Authentication screens
│   │   └── signup.tsx
│   ├── components/              # Reusable UI components
│   │   ├── app/                 # App-specific components
│   │   ├── core/                # Core UI components
│   │   └── images/              # Image-related components
│   ├── context/                 # React Context providers
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # API service layer
│   └── config/                  # App configuration
```

## 🛠️ Technology Stack

### Frontend (React Native)
- **Expo SDK 53**: Cross-platform development framework
- **React Native 0.79**: Native mobile app development
- **TypeScript**: Type-safe JavaScript development
- **Expo Router**: File-based routing system
- **NativeWind**: Tailwind CSS for React Native
- **React Context**: State management
- **Axios**: HTTP client for API communication

### Backend (Laravel)
- **Laravel 12**: Modern PHP framework
- **Laravel Sanctum**: API authentication
- **Cloudinary**: AI-powered image processing
- **Stripe**: Payment processing
- **SQLite**: Database (development)
- **Pest**: Testing framework

### Key Libraries & Services
- **@stripe/stripe-react-native**: Stripe mobile SDK
- **expo-image-picker**: Image selection
- **expo-linear-gradient**: UI enhancements
- **expo-haptics**: Haptic feedback
- **expo-blur**: Visual effects

## 🔧 Core Features Implementation

### AI Image Processing
```typescript
// Example: Generative Fill with Cloudinary
const generatedImg = (new CloudinaryImage(originalPublicId))->resize(
    resize: $pad
        ->aspectRatio(AspectRatio::{$aspectRatioMethod}())
        ->background(Background::generativeFill())
);
```

### Credit System
```php
// Credit consumption based on operation type
enum OperationEnum: string
{
    case GENERATIVE_FILL = 'generative_fill';  // 3 credits
    case RESTORE = 'restore';                  // 2 credits
    case RECOLOR = 'recolor';                  // 1 credit
    case REMOVE_OBJECT = 'remove_object';      // 2 credits
}
```

### Payment Integration
```typescript
// Stripe payment intent creation
const paymentIntent = await stripe.createPaymentIntent({
    amount: amountInCents,
    currency: 'usd',
    customer: customer.id,
    automatic_payment_methods: { enabled: true }
});
```

## 📱 App Screens & Navigation

### Authentication Flow
1. **Sign Up**: User registration with email verification
2. **Sign In**: Secure login with JWT tokens
3. **Email Verification**: Account activation

### Main App Flow
1. **Home Tab**: Dashboard and quick actions
2. **Operations Tab**: History of AI operations
3. **Profile Tab**: User settings and account info
4. **Credits Tab**: Purchase and manage credits

### AI Operations
1. **Generative Fill**: Expand images with AI
2. **Restore**: Enhance image quality
3. **Recolor**: Transform image colors
4. **Remove**: Delete objects intelligently

## 🎯 What I Learned Building This App

### Full-Stack Development
- **API Design**: RESTful API architecture with proper authentication
- **Database Design**: Efficient schema design for operations and transactions
- **State Management**: React Context for global state management
- **Error Handling**: Comprehensive error handling across frontend and backend

### Mobile Development
- **Expo Ecosystem**: Leveraging Expo's powerful development tools
- **Cross-Platform**: Building for both iOS and Android simultaneously
- **Performance**: Optimizing image processing and API calls
- **User Experience**: Creating intuitive mobile interfaces

### AI Integration
- **Cloudinary AI**: Integrating advanced AI image processing services
- **API Integration**: Working with third-party AI services
- **Image Processing**: Understanding various image transformation techniques
- **Credit Management**: Implementing usage-based pricing models

### Payment Systems
- **Stripe Integration**: Secure payment processing implementation
- **Webhook Handling**: Processing payment confirmations
- **Transaction Management**: Tracking payment and credit flows
- **Security**: Implementing secure payment flows

### Modern Development Practices
- **TypeScript**: Type-safe development for better code quality
- **Testing**: Unit and feature testing with Pest
- **Code Organization**: Clean architecture and separation of concerns
- **Version Control**: Git workflow and project management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PHP 8.2+
- Composer
- Expo CLI
- Stripe account
- Cloudinary account

### Backend Setup
```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Setup
```bash
cd app
npm install
npx expo start
```

### Environment Variables
```env
# Laravel
STRIPE_KEY=your_stripe_publishable_key
STRIPE_SECRET=your_stripe_secret_key
CLOUDINARY_URL=your_cloudinary_url

# React Native
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **CSRF Protection**: Cross-site request forgery protection
- **Input Validation**: Comprehensive request validation
- **Secure Storage**: Encrypted local storage for sensitive data
- **HTTPS**: Secure API communication

## 📊 Performance Optimizations

- **Image Caching**: Efficient image loading and caching
- **Lazy Loading**: Progressive image loading
- **API Optimization**: Efficient database queries and caching
- **Memory Management**: Proper cleanup of image resources

## 🧪 Testing

- **Backend Testing**: Pest framework for PHP testing
- **API Testing**: Comprehensive endpoint testing
- **Frontend Testing**: Component and integration testing
- **Payment Testing**: Stripe test mode integration

## 📈 Future Enhancements

- **Real-time Processing**: WebSocket integration for live updates
- **Batch Processing**: Multiple image processing
- **Advanced AI Models**: Integration with additional AI services
- **Social Features**: Sharing and collaboration tools
- **Analytics Dashboard**: Usage statistics and insights

## 🤝 Contributing

This project demonstrates modern full-stack mobile development practices. Feel free to explore the codebase and use it as a reference for your own projects.

## 📄 License

This project is for educational and demonstration purposes. Please respect the licenses of all third-party services and libraries used.

---

**Built with ❤️ using React Native, Laravel, and AI-powered image processing**
