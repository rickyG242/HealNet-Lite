# HealNet-Lite

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

HealNet-Lite is a platform connecting donors with healthcare organizations in need of medical supplies and equipment. Our intelligent matching system uses semantic search and geospatial analysis to create meaningful connections between available resources and critical needs.

## 🚀 Features

### 🤖 Intelligent Matching
- **Semantic Search**: Uses AI-powered embeddings to match similar items (e.g., "N95 masks" with "respirator PPE")
- **Geospatial Analysis**: Finds the closest matches based on physical location
- **Smart Scoring**: Prioritizes matches based on urgency, quantity, and relevance

### 🏥 For Healthcare Organizations
- Post supply needs with detailed requirements
- Receive real-time notifications of matching donations
- Manage incoming donations and communicate with donors

### ❤️ For Donors
- Easily post available medical supplies
- See which organizations need your donations most
- Get directions and logistics for drop-off

### 🛠️ Technical Highlights
- **Frontend**: React with TypeScript and Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI/ML**: pgvector for semantic search, Xenova Transformers for embeddings
- **Geospatial**: PostGIS for location-based queries
- **Real-time Updates**: WebSockets for live notifications

## 🛠️ Installation

### Prerequisites
- Node.js 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- npm or yarn
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rickyG242/HealNet-Lite.git
   cd HealNet-Lite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   ```

4. **Run database migrations**
   ```bash
   npx supabase migration up
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in your browser**
   ```
   http://localhost:5173
   ```

## 🗄️ Database Schema

### Key Tables
- `donations`: Donated medical supplies
- `needs`: Organization requests for supplies
- `organizations`: Healthcare facilities
- `donors`: Individual donors
- `geocoding_cache`: Cached geocoding results
- `matches`: Connection between donations and needs

### Spatial Features
- PostGIS for geographic calculations
- pgvector for semantic search
- Geospatial indexes for fast location queries

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the amazing backend
- [Vite](https://vitejs.dev/) for the build tooling
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Mapbox](https://www.mapbox.com/) for mapping services

## 📞 Contact

For questions or support, please open an issue or contact the maintainers.

---

Built with ❤️ for better healthcare access

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

