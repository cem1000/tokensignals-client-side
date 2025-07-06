# TokenSignals - Uniswap Network Visualizer

A real-time interactive trading network visualizer for Uniswap DEX data. This React application displays an interactive network graph showing how different cryptocurrencies are connected through trading activity.

## 🎯 Features

- **Interactive Network Graph**: Visual representation of token trading relationships using D3.js
- **Dynamic Central Node**: Click any token to make it the center of the network
- **Real-time Data**: Live updates from Uniswap trading data every 30 seconds
- **Token Search**: Search for any token by symbol
- **Token Statistics**: Display detailed trading volumes, swap counts, and flow data
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Backend API server running on `http://localhost:3000`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tokensignals-client-side
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Layout/          # Layout components (Header, etc.)
│   ├── NetworkGraph/    # D3.js network visualization
│   ├── TokenSearch/     # Token search functionality
│   ├── TokenStats/      # Token statistics display
│   └── UI/              # Reusable UI components
├── hooks/               # Custom React hooks
├── services/            # API services and data fetching
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and constants
└── styles/              # Global styles and Tailwind CSS
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_REFRESH_INTERVAL=30000
VITE_DEFAULT_TOKEN=WETH
```

### API Endpoints

The application connects to the following backend endpoints:

- `GET /api/health` - Health check
- `GET /api/tokens/:symbol` - Get specific token data
- `GET /api/tokens/top?limit=N` - Get top tokens by volume
- `GET /api/token-pairs/:symbol` - Get all pairs for a token
- `GET /api/pairs/:token0/:token1/swaps?hours=24` - Get swaps for a specific pair
- `GET /api/stats` - Database statistics

## 🎨 UI Components

### NetworkGraph
- Interactive D3.js force-directed graph
- Clickable nodes to change central token
- Volume-based edge thickness
- Real-time data updates

### TokenSearch
- Search input with autocomplete
- Popular tokens quick selection
- Form validation and error handling

### TokenStats
- Token volume and swap statistics
- Inflow/outflow data display
- Last updated timestamp

## 🔄 Data Flow

1. **Initial Load**: App loads with WETH as default central token
2. **Data Fetching**: React Query fetches token pairs data from API
3. **Transformation**: Raw API data is transformed into D3.js format
4. **Visualization**: Network graph renders with interactive nodes
5. **User Interaction**: Clicking nodes updates central token and re-fetches data
6. **Auto-refresh**: Data updates every 30 seconds automatically

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Adding New Features

1. **New API Endpoint**: Add to `src/services/api.ts`
2. **New Component**: Create in appropriate `src/components/` directory
3. **New Hook**: Add to `src/hooks/` directory
4. **New Type**: Define in `src/types/` directory

### Styling

The project uses Tailwind CSS for styling. Custom styles can be added to:
- `src/styles/globals.css` for global styles
- Component-specific CSS modules if needed

## 📊 Data Visualization

### Network Graph Features

- **Nodes**: Represent tokens with size based on trading volume
- **Edges**: Represent trading pairs with thickness based on volume
- **Colors**: Central node (blue), connected nodes (purple)
- **Interactions**: Click to center, hover for details

### Performance Optimizations

- React Query for efficient data caching
- D3.js force simulation for smooth animations
- Debounced search input
- Optimized re-renders with React.memo

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Environment Setup

Ensure your production environment has:
- Backend API accessible
- Environment variables configured
- Static file hosting (Netlify, Vercel, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🔗 Related Projects

- **Backend API**: Node.js/Express server serving Uniswap data
- **Data Pipeline**: Scripts for fetching and aggregating trading data

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team. 