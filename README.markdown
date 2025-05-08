# Music Player

A modern, web-based music player application built with HTML, CSS, and JavaScript. The application allows users to browse songs, artists, albums, and playlists, create and manage custom playlists, and play music with a sleek, responsive user interface. The project integrates local storage for persistent playlist data and includes a modular architecture for easy maintenance and extensibility.

## Features

### Core Functionality

- **Song Playback**: Play, pause, skip, and navigate through songs with a responsive player interface.
- **Browse Content**: View songs, artists, albums, and playlists in dedicated tabs.
- **Search**: Filter songs, artists, albums, or playlists by keyword.
- **Responsive Design**: Optimized for both desktop and mobile devices.

### Playlist Tab

- **Create Playlists**: Create new playlists with custom names.
- **Edit Playlists**: Rename existing playlists via an editable modal or grid button.
- **Delete Playlists**: Remove playlists with a confirmation prompt.
- **View Playlist Details**: Open a modal to view playlist songs, with options to:
  - Add songs from the full song library.
  - Remove individual songs.
  - Play all songs or a specific song, ensuring only playlist tracks are played until paused/stopped or another playlist/song is selected.
- **Persistent Storage**: Playlists are saved in `localStorage` for persistence across sessions.

### Songs Tab

- **Song List**: Displays all available songs with title, artist, album, and duration.
- **Add to Playlist**: Each song has a playlist icon (`<i class="fas fa-list">`) that opens a modal to:
  - Add the song to an existing playlist.
  - Create a new playlist and add the song to it.
- **Dynamic Updates**: New playlists created from the songs tab appear in the playlist tab immediately.

### User Feedback

- **Pop Up Modals**: Displayed for actions like creating, editing, deleting playlists, or adding/removing songs.
- **Interactive UI**: Modals, buttons, and grids provide a seamless user experience with hover effects and clear visuals.

## Project Structure

project/
├── __tests__/
│   └── player.test.js          # Unit tests for AudioPlayer
├── css/
│   ├── homepage-modal.css     # Styles for modals (playlists, songs, etc.)
│   ├── player-overlay.css     # Styles for player controls
│   ├── responsive.css         # Mobile-responsive styles
│   └── style.css              # General application styles
├── js/
│   ├── home.js                # Main UI logic for tabs and interactions
│   ├── player.js              # AudioPlayer class for playback
│   ├── playlist.js            # Playlist class for track management
│   ├── playlist-management.js # PlaylistManagement class for CRUD operations
│   ├── script.js              # Initialization and data setup
│   └── ui.js                  # Additional UI utilities (if applicable)
├── index.html                 # Main HTML file
├── package.json               # Node.js dependencies and scripts
└── jest.config.js             # Jest configuration for testing

## Installation

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- A modern web browser (Chrome, Firefox, Edge, etc.)

### Setup

1. **Clone the Repository**:
bash
   git clone "repository-url"
   cd music-player

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Run the Application**:

   Use a local development server to serve the application:
   bash
   npx http-server
   Open your browser and navigate to `http://localhost:8080`

## Usage

1. **Launch the Application**:
   Open `http://localhost:8080` after starting the server. The application loads with the songs tab active by default.

2. **Navigate Tabs**:
   - **Songs**: View all songs, play a track by clicking it, or click the playlist icon to add to a playlist.
   - **Playlists**: Create, edit, or delete playlists. Click a playlist to view its songs and manage them.
   - **Artists/Albums**: Browse artists or albums and view their songs in a modal.

3. **Manage Playlists**:
   - In the **Playlists** tab:
     - Click “New Playlist” to create a playlist.
     - Click a playlist to open its modal, where you can add/remove songs, play tracks, or edit/delete the playlist.
     - Use the edit (`<i class="fas fa-pen">`) or delete (`<i class="fas fa-trash">`) buttons on playlist cards.
   - In the **Songs** tab:
     - Click the playlist icon on a song to add it to an existing playlist or create a new one.

4. **Play Music**:
   - Click a song to play it immediately.
   - In a playlist modal, click “Play All” to play the entire playlist or click a song to start from it.
   - Use the player controls (bottom bar) to pause, skip, or adjust playback.

## Development

### Known Limitations

- Songs are loaded from a predefined list in `script.js`. Dynamic song loading (e.g., from a server) is not implemented.
- Playlist images are static or derived from song covers. Custom image uploads are not supported.
- No backend integration; all data is stored in `localStorage`.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-feature`).
3. Commit changes (`git commit -m "Add my feature"`).
4. Push to the branch (`git push origin feature/my-feature`).
5. Open a pull request.

## License

No license
