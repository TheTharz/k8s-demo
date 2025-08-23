# Notes App Frontend

A simple, modern frontend for the Notes application built with vanilla HTML, CSS, and JavaScript.

## Features

- ✨ **Clean & Modern UI** - Beautiful gradient design with glassmorphism effects
- 📝 **Full CRUD Operations** - Create, read, update, and delete notes
- 🔍 **Search Functionality** - Search through your notes in real-time
- 📊 **Sorting Options** - Sort by date created, updated, or title
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Real-time Updates** - Instant feedback for all operations
- 🎨 **Smooth Animations** - Polished user experience with CSS animations
- 📄 **Pagination** - Handle large numbers of notes efficiently

## Getting Started

### Prerequisites

- Docker and Docker Compose (for containerized deployment)
- Or any web server to serve static files

### Running with Docker Compose

The frontend is automatically served when you run the complete application:

```bash
# Make sure you have a .env file with the required variables
cp .env.example .env

# Start the entire application (MongoDB, Backend, Frontend)
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

### Running Standalone

If you want to run just the frontend for development:

```bash
# Using Python's built-in server
cd frontend
python3 -m http.server 8000

# Using Node.js serve package
npx serve .

# Using any other static file server
```

## Usage

### Creating Notes

1. Click the "Add Note" button
2. Fill in the title and content
3. Click "Save Note"

### Editing Notes

1. Hover over a note card
2. Click the edit icon (pencil)
3. Modify the content
4. Click "Save Note"

### Deleting Notes

1. Hover over a note card
2. Click the delete icon (trash)
3. Confirm the deletion

### Searching Notes

- Use the search box to find notes by title or content
- Search is performed in real-time as you type

### Sorting Notes

- Use the sort dropdown to organize notes by:
  - Updated date (default)
  - Created date
  - Title (alphabetical)
- Choose ascending or descending order

## API Integration

The frontend communicates with the backend API at `http://localhost:3001/api`. Key endpoints used:

- `GET /api/notes` - Fetch notes with pagination and sorting
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update an existing note
- `DELETE /api/notes/:id` - Delete a note

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## File Structure

```
frontend/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── script.js           # JavaScript functionality
└── README.md          # This file
```

## Customization

### Changing Colors

Edit the CSS variables in `styles.css`:

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea, #764ba2);
  --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Modifying API Endpoint

Update the `API_BASE_URL` in `script.js`:

```javascript
const API_BASE_URL = 'http://your-backend-url/api';
```

## Troubleshooting

### Frontend not loading

- Check that the frontend container is running: `docker-compose ps`
- Verify port 3000 is not blocked by firewall

### Can't connect to backend

- Ensure backend is running on port 3001
- Check CORS is enabled in backend
- Verify network connectivity between containers

### Notes not displaying

- Check browser console for JavaScript errors
- Verify backend API is responding: `curl http://localhost:3001/api/health`
- Check backend logs: `docker-compose logs backend`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
