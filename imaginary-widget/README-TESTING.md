# Testing the ImaginaryWidget

## Quick Test Setup

### Option 1: Using Mock Server (Recommended for quick testing)

1. **Build the widget:**
   ```bash
   npm run build
   ```

2. **Install test dependencies:**
   ```bash
   npm install express cors multer
   ```

3. **Start mock server:**
   ```bash
   node tmp_rovodev_test_server.js
   ```

4. **Start file server (in another terminal):**
   ```bash
   npm run serve
   ```

5. **Open test page:**
   ```
   http://localhost:8080/test.html
   ```

### Option 2: Using the Automated Script

```bash
chmod +x test-widget.sh
./test-widget.sh
```

This will:
- Build the widget
- Install dependencies  
- Start mock server on port 3001
- Start file server on port 8080
- Open both servers automatically

### Option 3: Using Real NestJS Backend

1. **Start the NestJS backend:**
   ```bash
   cd ../apps/nest-backend
   npm run start:dev
   ```

2. **Create a test API key** (using the backend API)

3. **Update test.html** with your real API key

4. **Build and serve widget:**
   ```bash
   npm run build
   npm run serve
   ```

## Expected Test Flow

1. **Widget Initialization:** Should show "Widget initialized successfully!"
2. **Click "Open Upload Widget":** Modal should open
3. **Drag/drop files or click to select:** File validation should work
4. **Upload files:** Progress should show, then success message
5. **Check console:** Should show upload results with file URLs

## Troubleshooting

- **Connection Refused:** Make sure backend/mock server is running on port 3001
- **CORS Errors:** Mock server includes CORS headers, real backend may need CORS configuration
- **Widget not loading:** Check that `dist/widget.js` exists after running `npm run build`
- **API Key errors:** Make sure you're using a valid API key from the backend

## Mock Server Endpoints

- `GET /api-keys/constraints/:publicKey` - Returns upload constraints
- `POST /upload/token` - Returns mock upload token  
- `POST /upload` - Accepts file uploads and returns mock response