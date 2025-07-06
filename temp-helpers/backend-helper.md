# TokenSignals - Server Project Guide

## Project Overview
This is a Node.js/Express API server that processes and serves Uniswap trading data for network graph visualisation. The system fetches swap data from Uniswap's GraphQL API, stores it in SQLite, aggregates it, and provides REST endpoints for D3.js network visualisation dashboards.

## Core Architecture

### Database Schema (SQLite)
- **`swaps`** - Raw individual swap transactions
- **`tokens`** - Aggregated token statistics (volume, swaps, flows)
- **`token_pairs`** - Aggregated pair statistics (volume, swaps, flows per pair)

### Key Components

#### 1. Data Pipeline (`scripts/core/`)
- `fetchData.js` - Fetches new swaps from Uniswap GraphQL API
- `aggregateData.js` - Aggregates raw swaps into tokens and token_pairs tables

#### 2. API Server (`src/api/`)
- `server.js` - Main Express server with all endpoints
- `index.js` - Server startup and graceful shutdown

#### 3. Database Layer (`src/services/storage/`)
- `database.js` - SQLite database operations
- `repositories/` - Entity-specific data access (swaps.js, tokens.js, tokenPairs.js)
- `queries/` - SQL files organized by entity (swaps/, tokens/, tokenPairs/)
- `utils/` - Utility functions (cleanup.js, fetchTime.js)

#### 4. Data Services (`src/services/data/`)
- `fetcher.js` - GraphQL client for Uniswap data
- `aggregator.js` - Data aggregation logic
- `transformer.js` - Data transformation utilities

## API Endpoints

### Live Data Endpoints (All return current database data)

#### 1. **`GET /api/health`** - Health check
**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok"
  },
  "timestamp": "2025-07-06T09:31:16.675Z"
}
```

#### 2. **`GET /api/tokens/:symbol`** - Get specific token data
**Example:** `GET /api/tokens/WETH`
**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "WETH",
    "total_volume_usd": 130265208.30245538,
    "total_swaps": 70195,
    "inflow_usd": 64283753.07321647,
    "outflow_usd": 65981455.22923831,
    "last_updated": "2025-07-06 08:28:44"
  },
  "timestamp": "2025-07-06T09:31:20.143Z"
}
```

#### 3. **`GET /api/tokens/top?limit=N`** - Get top tokens by volume
**Example:** `GET /api/tokens/top?limit=3`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "WETH",
      "total_volume_usd": 130265208.30245538,
      "total_swaps": 70195,
      "inflow_usd": 64283753.07321647,
      "outflow_usd": 65981455.22923831,
      "last_updated": "2025-07-06 08:28:44"
    },
    {
      "symbol": "USDC",
      "total_volume_usd": 76365343.13215269,
      "total_swaps": 18966,
      "inflow_usd": 38725815.362039395,
      "outflow_usd": 37639527.770113036,
      "last_updated": "2025-07-06 08:28:44"
    },
    {
      "symbol": "USDT",
      "total_volume_usd": 63207860.78524368,
      "total_swaps": 15978,
      "inflow_usd": 31414015.566069696,
      "outflow_usd": 31793845.219173867,
      "last_updated": "2025-07-06 08:28:44"
    }
  ],
  "timestamp": "2025-07-06T09:31:22.971Z"
}
```

#### 4. **`GET /api/token-pairs/:symbol`** - Get all pairs for a token (graph data)
**Example:** `GET /api/token-pairs/WETH`
**Response:** See detailed structure in "Graph Visualisation Data" section below

#### 5. **`GET /api/pairs/:token0/:token1/swaps?hours=24`** - Get swaps for a specific pair
**Example:** `GET /api/pairs/USDC/WETH/swaps?hours=24`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "0xa1392bcfaab4349ba27868500a5ec029e712f7489d5040624acb46a61b3a9f70#2694820",
      "timestamp": 1751789927,
      "token0": "USDC",
      "token1": "WETH",
      "amount0": 2644.0,
      "amount1": -0.000999770810212421,
      "amountUSD": 2.519166382008289,
      "pool": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
      "created_at": "2025-07-05 18:49:56"
    }
    // ... many more swaps
  ],
  "timestamp": "2025-07-06T09:31:25.947Z"
}
```

#### 6. **`GET /api/swaps/from/:timestamp?limit=100`** - Get swaps from timestamp
**Note:** This endpoint currently returns an error and needs debugging

#### 7. **`GET /api/stats`** - Database statistics
**Response:**
```json
{
  "success": true,
  "data": {
    "totalSwaps": 83565,
    "topTokens": [
      {
        "symbol": "WETH",
        "total_volume_usd": 130265208.30245538,
        "total_swaps": 70195,
        "inflow_usd": 64283753.07321647,
        "outflow_usd": 65981455.22923831,
        "last_updated": "2025-07-06 08:28:44"
      },
      {
        "symbol": "USDC",
        "total_volume_usd": 76365343.13215269,
        "total_swaps": 18966,
        "inflow_usd": 38725815.362039395,
        "outflow_usd": 37639527.770113036,
        "last_updated": "2025-07-06 08:28:44"
      }
      // ... more tokens
    ]
  },
  "timestamp": "2025-07-06T09:32:41.790Z"
}
```

### Key Features
- **Dynamic Central Node**: `/api/token-pairs/:symbol` allows any token to be the central node for network visualisation
- **Live Data**: All endpoints query the database in real-time (no static files)
- **Consistent Format**: Token pairs endpoint returns ETH-pairs style format for any token
- **Error Handling**: Proper 404 responses for missing tokens, 500 for server errors

## Frontend Core Behavior

### Network Graph Visualization
The frontend displays an interactive network graph where:

1. **Default State**: Shows WETH as the central node with all its trading pairs
2. **Dynamic Central Node**: When user clicks any token node, it becomes the new central node
3. **Graph Updates**: The entire network graph re-renders to show the new central token's pairs
4. **Data Source**: Uses `/api/token-pairs/:symbol` endpoint to fetch pairs for any token

### User Interaction Flow
```
Default Load → WETH Central Node → User clicks USDC → USDC Central Node → User clicks MATIC → MATIC Central Node
```

### Graph Structure
- **Central Node**: Selected token (larger, highlighted)
- **Connected Nodes**: All tokens that trade with the central token
- **Edges**: Represent trading pairs with volume-based thickness
- **Node Sizes**: Based on trading volume or swap count

## Database Operations

### Token Operations
- `getTopTokens(limit)` - Get top tokens by volume
- `getTokenBySymbol(symbol)` - Get specific token data

### Token Pair Operations
- `getTokenPairsForToken(symbol)` - Get all pairs where token is either token_a or token_b

### Swap Operations
- `getSwapsForTokenPair(token0, token1, hours)` - Get swaps for specific pair
- `getSwapsFromTimestamp(timestamp, limit)` - Get swaps from timestamp
- `getAllSwaps()` - Get all swaps
- `getSwapCount()` - Get total swap count

## Data Flow

1. **Fetch**: `npm run fetch` - Gets new swaps from Uniswap
2. **Aggregate**: `npm run aggregate` - Processes raw swaps into aggregated tables
3. **Serve**: API endpoints serve live data from SQLite database

## Business Rules

### Token Pair Aggregation Logic

#### Token Position Convention (Normalised):
- **`token0` position** = Token being **sold by user** (OUTFLOW) - always positive amount
- **`token1` position** = Token being **received by user** (INFLOW) - always negative amount
- **Data is normalised during insertion** to ensure consistent structure
- **Amount signs** are standardised:
  - **`amount0` > 0** = Token being sold (outflow)
  - **`amount1` < 0** = Token being received (inflow)

#### Aggregation Process:
1. **Normalised swaps** are loaded from database (token0 = outflow, token1 = inflow)
2. **Token pair keys** are created using alphabetical ordering (e.g., USDC-WETH, not WETH-USDC)
3. **Flow mapping** maps normalised swap data to alphabetical pair positions
4. **USD values** are aggregated for each token's inflow/outflow patterns

#### Token Aggregation Logic:
- **token0** (always outflow) → `totalOutflowUSD`
- **token1** (always inflow) → `totalInflowUSD`

#### Token Pair Aggregation Logic:
- **If token0 maps to firstToken**: firstToken = outflow, secondToken = inflow
- **If token0 maps to secondToken**: secondToken = outflow, firstToken = inflow

#### Example Transformation:
```
Raw Swap Data (before normalisation):
- Swap 1: token0=WETH, token1=USDC, amount0=-1.0, amount1=3000, amountUSD=3000
  (User sold 1.0 WETH to receive 3000 USDC)

Normalised Swap Data (after insertion):
- Swap 1: token0=WETH, token1=USDC, amount0=1.0, amount1=-3000, amountUSD=3000
  (token0 = outflow, token1 = inflow)

Aggregated Token Pair (USDC-WETH):
- token0: USDC (alphabetically first)
- token1: WETH (alphabetically second)
- total_volume_usd: 3000
- total_swaps: 1
- token_a_inflow_usd: 3000 (USDC received)
- token_a_outflow_usd: 0 (USDC not sold in this pair)
- token_b_inflow_usd: 0 (WETH not received in this pair)
- token_b_outflow_usd: 3000 (WETH sold)
```

#### Expected Output Format:
```javascript
{
  "USDC-WETH": {
    tokenA: "USDC",
    tokenB: "WETH", 
    totalVolumeUSD: 6000,
    totalSwaps: 2,
    tokenAInflowUSD: 3000,   // USDC received (negative amounts)
    tokenAOutflowUSD: 3000,  // USDC sold (positive amounts)
    tokenBInflowUSD: 3000,   // WETH received (negative amounts)
    tokenBOutflowUSD: 3000   // WETH sold (positive amounts)
  }
}
```

### Data Retention Policy
- **24-hour retention only**: Database automatically cleans up data older than 24 hours
- **Rolling window**: Always maintains exactly 24 hours of recent swap data
- **No historical data**: Older data is permanently deleted to keep database size manageable
- **Real-time focus**: System designed for current market analysis, not historical trends

### Fetch Limitations
- **Batch size**: 1000 swaps per GraphQL API call
- **Batch limit**: 200 API calls maximum (200,000 swaps total per fetch cycle)
- **Time range**: Only fetches swaps from last timestamp to current time
- **First run**: Fetches last 24 hours of data

### Data Volume Expectations
- **Expected daily volume**: 60,000-120,000 swaps on Uniswap V3 Ethereum mainnet
- **Current system performance**: ~115,000 swaps in 24-hour rolling window (within expected range)
- **Data source**: Ethereum mainnet only (excludes Layer 2 networks like Polygon, Optimism)
- **Volume validation**: System captures full mainnet volume according to market data
- **Incremental fetching**: Each run adds only new swaps since last timestamp (typically 500-1000 swaps per run)

## Development Commands

```bash
npm start              # Start API server
npm run fetch          # Fetch new data from Uniswap
npm run aggregate      # Aggregate data
npm run pipeline       # Run fetch + aggregate
npm run test:db        # Test database connectivity
npm run check:db       # Check database statistics
```

## Important Notes

### When Adding New Endpoints
1. Add the route in `src/api/server.js`
2. Add corresponding database method in appropriate repository file (`src/services/storage/repositories/`)
3. Create SQL file in appropriate `src/services/storage/queries/` entity subdirectory
4. Test with curl commands

### Database Method Pattern
All database methods follow this pattern in repository files:
```javascript
async methodName(params) {
    if (!this.db.isInitialized) throw new Error('Database not initialized');
    try {
        const sql = await this.db.loadSQLFile('filename.sql', 'entityFolder');
        return new Promise((resolve, reject) => {
            this.db.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    } catch (error) {
        throw error;
    }
}
```

### API Response Format
All endpoints return:
```javascript
{
    success: true/false,
    data: {...}, // or error message
    timestamp: "ISO string"
}
```

### Graph Visualisation Data
The `/api/token-pairs/:symbol` endpoint returns data formatted for D3.js network graphs:

#### Complete API Response Structure
```json
{
  "success": true,
  "data": {
    "USDC-WETH": {
      "tokenA": "USDC",
      "tokenB": "WETH", 
      "totalVolumeUSD": 48785570.06425195,
      "totalSwaps": 12396,
      "tokenAInflowUSD": 24307143.75790967,
      "tokenAOutflowUSD": 24478426.306342326,
      "tokenBInflowUSD": 24478426.306342326,
      "tokenBOutflowUSD": 24307143.75790967
    },
    "USDT-WETH": {
      "tokenA": "USDT",
      "tokenB": "WETH",
      "totalVolumeUSD": 40694085.20522174,
      "totalSwaps": 11314,
      "tokenAInflowUSD": 20551715.35459715,
      "tokenAOutflowUSD": 20142369.850624796,
      "tokenBInflowUSD": 20142369.850624796,
      "tokenBOutflowUSD": 20551715.35459715
    },
    "WBTC-WETH": {
      "tokenA": "WBTC",
      "tokenB": "WETH",
      "totalVolumeUSD": 5803751.796518673,
      "totalSwaps": 837,
      "tokenAInflowUSD": 2957888.194058016,
      "tokenAOutflowUSD": 2845863.6024606517,
      "tokenBInflowUSD": 2845863.6024606517,
      "tokenBOutflowUSD": 2957888.194058016
    }
  },
  "timestamp": "2025-07-06T09:28:06.707Z"
}
```

#### Field Descriptions
- **`success`**: Boolean indicating API call success
- **`data`**: Object containing all token pairs for the requested symbol
- **`timestamp`**: ISO string of when the response was generated
- **Pair Key**: `"TOKEN0-TOKEN1"` format (alphabetical ordering)
- **`tokenA`**: First token in alphabetical order
- **`tokenB`**: Second token in alphabetical order
- **`totalVolumeUSD`**: Total trading volume in USD for this pair
- **`totalSwaps`**: Number of swap transactions for this pair
- **`tokenAInflowUSD`**: USD value of tokenA received (inflow)
- **`tokenAOutflowUSD`**: USD value of tokenA sold (outflow)
- **`tokenBInflowUSD`**: USD value of tokenB received (inflow)
- **`tokenBOutflowUSD`**: USD value of tokenB sold (outflow)

#### Example Usage
```bash
# Get all pairs for WETH (WETH as central node)
GET /api/token-pairs/WETH

# Get all pairs for USDC (USDC as central node)  
GET /api/token-pairs/USDC

# Get all pairs for any token
GET /api/token-pairs/DAI
```

#### Data Volume
- **WETH pairs**: ~1,215 pairs returned
- **Total database pairs**: ~1,818 pairs
- **Response size**: ~500KB for WETH (all pairs)
- **Performance**: Sub-second response time

### Frontend Data Flow
1. **Initial Load**: Fetch `/api/token-pairs/WETH` → Display WETH as central node
2. **Node Click**: User clicks USDC node → Fetch `/api/token-pairs/USDC` → Display USDC as central node
3. **Graph Re-render**: Transform new data and update D3.js visualization
4. **URL Update**: Update browser URL to reflect current central token (optional)

### Required Frontend Components
- **NetworkGraph**: D3.js force-directed graph with clickable nodes
- **TokenSearch**: Input field to manually search for tokens
- **TokenStats**: Display current central token's statistics
- **LoadingStates**: Show loading during API calls
- **ErrorHandling**: Display errors for invalid tokens or network issues

## Common Tasks

### Adding New Endpoint
1. Identify which table(s) to query
2. Add route to `server.js`
3. Add database method to `database.js`
4. Create SQL file
5. Test with curl

### Debugging Issues
1. Check server logs for errors
2. Verify database method exists
3. Check SQL file syntax
4. Test database connectivity with `npm run check:db`
5. **Volume analysis**: Use detailed logging in fetcher.js to analyse fetch patterns
6. **Data completeness**: Monitor batch counts and swap totals per fetch cycle
7. **Time range validation**: Verify fetch time ranges match expected intervals

### Performance Considerations
- Database queries are optimised with indexes
- Large datasets use pagination (limit parameter)
- Time-based queries use timestamp filtering
- **System capacity**: Easily handles 200,000+ swaps per fetch cycle
- **Memory efficiency**: Streams data in 1000-swap batches to avoid memory issues
- **Database size**: Maintains manageable size with 24-hour retention policy

## File Structure Reference
```
TokenSignals - Server/
├── src/
│   ├── api/
│   │   ├── server.js          # Main API server
│   │   └── index.js           # Server startup
│   └── services/
│       ├── storage/
│       │   ├── database.js    # Database connection & core methods
│       │   ├── repositories/  # Entity-specific data access
│       │   │   ├── swaps.js
│       │   │   ├── tokens.js
│       │   │   └── tokenPairs.js
│       │   ├── queries/       # SQL files organized by entity
│       │   │   ├── swaps/     # All swaps-related queries
│       │   │   ├── tokens/    # All tokens-related queries
│       │   │   ├── tokenPairs/ # All tokenPairs-related queries
│       │   │   └── [general files] # Schema and utility queries
│       │   └── utils/         # Utility functions
│       │       ├── cleanup.js
│       │       └── fetchTime.js
│       └── data/
│           ├── fetcher.js     # GraphQL client
│           └── aggregator.js  # Data aggregation
├── scripts/
│   ├── core/                  # Data pipeline
│   └── utils/                 # Utility scripts
└── data/                      # Generated data files
```

This project is designed for real-time network graph visualisation of Uniswap trading data with any token as the central node. 