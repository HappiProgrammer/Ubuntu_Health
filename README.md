# CareTaker - Cameroon Healthcare Matching Platform

CareTaker is a Progressive Web App (PWA) that connects verified nurses and caregivers with clients in Cameroon. Built with ethics, security, and optimization for low-bandwidth environments in mind.

## 🚀 Features

### Core Functionality
- **Role-based Registration**: Nurses/Caregivers and Clients
- **Secure Authentication**: Supabase auth with JWT tokens
- **AI-Powered Matching**: Weighted scoring algorithm (reviews 40%, jobs 30%, sentiment 30%)
- **Real-time Chat**: Offline-first with IndexedDB queue
- **Location-based Matching**: Geolocation + manual address input
- **Payment Integration**: MTN MoMo API support
- **Admin Dashboard**: Nurse verification and request approval

### Technical Features
- **PWA Ready**: Service worker, offline support, installable
- **Mobile-First**: Optimized for low-end devices and 2G networks
- **Lightweight**: <50MB app size, <100KB initial load
- **Secure**: Row-Level Security (RLS), encrypted data, OWASP compliant
- **Multi-language**: English/French toggle
- **Progressive**: Works offline, syncs when online

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend & Database
- **Supabase** (Auth, Database, Realtime, Storage, Edge Functions)
- **PostgreSQL** with Row-Level Security
- **Supabase Edge Functions** for serverless logic

### Third-party Integrations
- **Tesseract.js** for OCR (ID/document scanning)
- **Leaflet.js** for maps (lightweight)
- **HuggingFace API** for sentiment analysis
- **MTN MoMo API** for payments

### Development Tools
- **TypeScript** for type safety
- **React Hook Form** with Zod validation
- **ESLint** for code quality

## 📋 Requirements

- Node.js 18+
- npm or yarn
- Supabase account
- MTN MoMo developer account (for payments)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd caretaker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Fill in your environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
MOMO_API_KEY=your_momo_api_key
MOMO_API_SECRET=your_momo_api_secret
HUGGINGFACE_API_KEY=your_huggingface_api_key
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_32_character_encryption_key
```

4. **Set up Supabase database**
```bash
# Apply migrations
supabase db push

# Enable required extensions
supabase db push --include-extensions
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 PWA Features

### Offline Support
- Service worker caches all static assets
- IndexedDB stores chat messages and form data
- Automatic sync when connection restored

### Installation
- Add to home screen on mobile devices
- Works as standalone app
- Push notifications support

## 🔒 Security & Ethics

### Data Protection
- **HIPAA/GDPR Compliant**: All sensitive data encrypted
- **Row-Level Security**: Users only see their own data
- **Consent-based**: Explicit consent for location/document access
- **No Raw Document Storage**: Only hashes of ID documents

### AI Ethics
- **Bias-Free Scoring**: Algorithm doesn't consider gender/age/ethnicity
- **Transparent AI**: Clear explanation of how matches are scored
- **Human Oversight**: Admin approval required for all matches
- **Fair Opportunity**: Equal visibility for all verified nurses

### Cameroon Compliance
- **Data Localization**: Where possible, data stored locally
- **Anonymization**: Personal data anonymized where feasible
- **Local Laws**: Compliant with Cameroon data protection regulations

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📊 Database Schema

### Core Tables
- `profiles`: User accounts and basic info
- `nurse_profiles`: Professional nurse information
- `care_requests`: Client service requests
- `matches`: Nurse-client matching records
- `messages`: Chat messages between matched users
- `reviews`: Post-service reviews
- `payments`: Transaction records

### Relationships
- Users → Profiles (1:1)
- Profiles → Nurse Profiles (1:0..1)
- Profiles → Care Requests (1:N)
- Care Requests → Matches (1:N)
- Matches → Messages (1:N)
- Matches → Reviews (1:1)
- Matches → Payments (1:N)

## 🤖 AI Matching Algorithm

### Scoring Components
1. **Reviews (40%)**: Historical client ratings
2. **Jobs Completed (30%)**: Experience and reliability
3. **Sentiment Analysis (30%)**: Communication quality assessment

### Location Filtering
- Maximum distance: 50km (configurable)
- Priority to closer matches
- Urban/rural consideration

### Admin Oversight
- All matches require admin approval
- Manual override capability
- Audit trail for all decisions

## 💳 Payment System

### MTN MoMo Integration
- Edge Functions handle MoMo API calls
- Webhook-based payment confirmation
- Receipt generation in chat
- Refund support

### Payment Flow
1. Client confirms match
2. Payment request initiated
3. MoMo payment processed
4. Receipt sent via chat
5. Funds released after service completion

## 🌍 Localization

### Supported Languages
- English (default)
- French

### Implementation
- React Context for language state
- Translation objects for all UI text
- Date/time localization
- Currency formatting (XAF)

## 📈 Performance Optimization

### Bundle Size
- Code splitting by route
- Dynamic imports for heavy components
- Image optimization (80% compression)
- Tree shaking for unused code

### Network Optimization
- Service worker caching
- IndexedDB for offline storage
- Lazy loading for images
- Minimal API calls

### Memory Management
- No heavy libraries
- Efficient state management
- Component cleanup
- Memory leak prevention

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Performance Tests
```bash
npm run test:performance
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Care Request Endpoints
- `GET /api/requests` - List care requests
- `POST /api/requests` - Create care request
- `PUT /api/requests/:id` - Update care request

### Matching Endpoints
- `GET /api/matches` - List user matches
- `POST /api/matches` - Create new match
- `PUT /api/matches/:id` - Update match status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support:
- Email: support@caretaker.cm
- Phone: +237 XXX XXX XXX
- Website: [caretaker.cm](https://caretaker.cm)

## 🗺️ Roadmap

### Phase 1 (MVP)
- [x] Basic registration and authentication
- [x] Care request creation
- [x] Basic matching algorithm
- [x] Chat functionality
- [x] Payment integration

### Phase 2
- [ ] Advanced AI matching
- [ ] Video consultation
- [ ] Insurance integration

### Phase 3
- [ ] Mobile apps (iOS/Android)
- [ ] Hospital partnerships
- [ ] Training programs
- [ ] Expansion to other countries

---

**Built with ❤️ for Cameroon's healthcare community**
