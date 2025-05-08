import { AudioPlayer } from './player.js';
import { Playlist } from './playlist.js';
import { PlayerUI } from './ui.js';
import { PlaylistManagement } from './playlist-management.js';


// Initialize components
const player = new AudioPlayer();
const mainPlaylist = new Playlist();
const ui = new PlayerUI(player, mainPlaylist);
const playlistManagement = new PlaylistManagement(mainPlaylist);


// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load tracks
    const savedTracks = JSON.parse(localStorage.getItem('tracks')) || [];
    savedTracks.forEach(track => mainPlaylist.addTrack(track));

    // Restore playback state
    const savedState = JSON.parse(localStorage.getItem('currentTrack'));
    if (savedState) {
        mainPlaylist.currentTrackIndex = savedState.index;
        player.audio.currentTime = savedState.currentTime;
        if (savedState.isPlaying) {
            player.play(mainPlaylist.getCurrentTrack());
            document.querySelector('.player-controls-bar').classList.remove('hidden');
            ui.updatePlayerInfo();
        }
    }
    playlistManagement.initialize();
    renderPlaylists();
});

// Modal Setup
document.getElementById('create-playlist-btn').addEventListener('click', () => {
    document.querySelector('.playlist-modal').classList.remove('hidden');
});

document.getElementById('confirm-create-playlist').addEventListener('click', createNewPlaylist);

document.querySelector('.close-modal').addEventListener('click', () => {
    document.querySelector('.playlist-modal').classList.add('hidden');
});

function renderPlaylists() {
    // Focus only on playlist display and management
    const playlistGrid = document.querySelector('.playlist-grid');
    if (!playlistGrid) return;

    playlistGrid.innerHTML = '';

  // Create New Playlist card
  const newPlaylistCard = document.createElement('div');
  newPlaylistCard.className = 'grid-item new-playlist';
  newPlaylistCard.innerHTML = `
      <div class="new-playlist-icon">
          <i class="fas fa-plus"></i>
      </div>
      <div class="grid-item-info">
          <div class="grid-item-title">New Playlist</div>
      </div>
  `;
  playlistGrid.appendChild(newPlaylistCard);

   // user playlists
   playlistManagement.userPlaylists.forEach(playlist => {
    const playlistItem = document.createElement('div');
    playlistItem.className = 'grid-item';
    playlistItem.dataset.playlistId = playlist.id;
    
    playlistItem.innerHTML = `
        <img src="${playlist.image}" alt="${playlist.name}">
        <div class="grid-item-info">
            <div class="grid-item-title">${playlist.name}</div>
            <div class="grid-item-subtitle">${playlist.songs.length} songs</div>
        </div>
        <div class="playlist-actions">
            <button class="edit-playlist-btn"><i class="fas fa-pen"></i></button>
            <button class="delete-playlist-btn"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    playlistGrid.appendChild(playlistItem);
});

    setupPlaylistInteractions();
}

function setupPlaylistInteractions() {
    // View playlist
    document.querySelectorAll('.grid-item:not(.new-playlist)').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.playlist-actions')) {
                const playlistId = parseInt(item.dataset.playlistId);
                viewPlaylist(playlistId);
            }
        });
    });

    // Edit playlist
    document.querySelectorAll('.edit-playlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const playlistId = parseInt(btn.closest('.grid-item').dataset.playlistId);
            editPlaylist(playlistId);
        });
    });

    // Delete playlist
    document.querySelectorAll('.delete-playlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const playlistId = parseInt(btn.closest('.grid-item').dataset.playlistId);
            deletePlaylist(playlistId);
        });
    });
}

function createNewPlaylist() {
    const nameInput = document.getElementById('playlist-name');
    const name = nameInput.value.trim();
    
    if (name) {
        playlistManagement.createNewPlaylist(name);
        nameInput.value = '';
        document.querySelector('.playlist-modal').classList.add('hidden');
        renderPlaylists();
    }
}

function viewPlaylist(playlistId) {
    // Find the playlist
    const playlist = playlistManagement.userPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;

    // Create modal for playlist view
    const modal = document.createElement('div');
    modal.className = 'modal playlist-view-modal';
    modal.innerHTML = `
        <div class="modal-content large-modal">
            <span class="close-modal">&times;</span>
            <div class="playlist-header">
                <img src="${playlist.image || 'assets/default-playlist.jpg'}" alt="${playlist.name}" class="playlist-cover">
                <div class="playlist-info">
                    <h2>${playlist.name}</h2>
                    <p>${playlist.songs.length} ${playlist.songs.length === 1 ? 'song' : 'songs'}</p>
                    <div class="playlist-header-actions">
                        <button class="btn-primary play-all-btn">
                            <i class="fas fa-play"></i> Play All
                        </button>
                        <button class="btn-secondary edit-playlist-btn">
                            <i class="fas fa-pen"></i> Edit
                        </button>
                    </div>
                </div>
            </div>
            <div class="playlist-songs">
                <div class="song-list-header">
                    <div class="header-item">#</div>
                    <div class="header-item">Title</div>
                    <div class="header-item">Artist</div>
                    <div class="header-item">Album</div>
                    <div class="header-item"><i class="far fa-clock"></i></div>
                </div>
                <div class="song-list">
                    ${playlist.songs.length > 0 ? 
                        playlist.songs.map((songId, index) => {
                            const track = mainPlaylist.tracks.find(t => t.id === songId);
                            if (!track) return '';
                            return `
                                <div class="song-list-item" data-index="${index}">
                                    <div class="song-number">${index + 1}</div>
                                    <div class="song-title-artist">
                                        <img src="${track.cover || 'assets/default-cover.jpg'}" alt="${track.title}">
                                        <div>
                                            <div class="song-title">${track.title}</div>
                                            <div class="song-artist">${track.artist}</div>
                                        </div>
                                    </div>
                                    <div class="song-album">${track.album || 'Unknown Album'}</div>
                                    <div class="song-actions">
                                        <button class="remove-from-playlist-btn" title="Remove from playlist">
                                            <i class="fas fa-times"></i>
                                        </button>
                                        <div class="song-duration">${formatTime(track.duration || 180)}</div>
                                    </div>
                                </div>
                            `;
                        }).join('') : 
                        '<div class="empty-playlist">This playlist is empty</div>'
                    }
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    // Prevent scrolling behind modal
    document.body.style.overflow = 'hidden'; 

    
 // Close modal handler
 modal.querySelector('.close-modal').addEventListener('click', () => {
    modal.remove();
    document.body.style.overflow = '';
});

// Play all songs
modal.querySelector('.play-all-btn').addEventListener('click', () => {
    if (playlist.songs.length > 0) {
        const tracksToPlay = playlist.songs.map(songId => 
            mainPlaylist.tracks.find(t => t.id === songId)
        ).filter(Boolean);
        
        if (tracksToPlay.length > 0) {
            player.playlist = new Playlist();
            tracksToPlay.forEach(track => player.playlist.addTrack(track));
            player.playlist.currentTrackIndex = 0;
            player.play(player.playlist.getCurrentTrack());
            document.querySelector('.player-controls-bar').classList.remove('hidden');
            ui.updatePlayerInfo();
        }
    }
});

    // Edit playlist
    modal.querySelector('.edit-playlist-btn').addEventListener('click', () => {
        modal.remove();
        editPlaylist(playlistId);
    });


    // Song click handlers
    modal.querySelectorAll('.song-list-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-from-playlist-btn')) {
                const index = parseInt(item.dataset.index);
                const songId = playlist.songs[index];
                const track = mainPlaylist.tracks.find(t => t.id === songId);
                if (track) {
                    player.play(track);
                    document.querySelector('.player-controls-bar').classList.remove('hidden');
                    ui.updatePlayerInfo();
                }
            }
        });


         // Remove from playlist
         item.querySelector('.remove-from-playlist-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(item.dataset.index);
            removeSongFromPlaylist(playlistId, playlist.songs[index], modal);
        });
    });
}

function removeSongFromPlaylist(playlistId, songId, modal) {
    const playlist = playlistManagement.userPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;

    const songIndex = playlist.songs.indexOf(songId);
    if (songIndex !== -1) {
        playlist.songs.splice(songIndex, 1);
        playlistManagement.savePlaylists();
        modal.remove();
        viewPlaylist(playlistId);
        const track = mainPlaylist.tracks[songId];
        if (track) {
            showToast(`Removed "${track.title}" from playlist`);
        }
    }
}

function editPlaylist(playlistId) {
    const playlist = playlistManagement.userPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>Edit Playlist</h3>
            <div class="form-group">
                <label for="edit-playlist-name">Playlist Name</label>
                <input type="text" id="edit-playlist-name" value="${playlist.name}">
            </div>
            <button id="save-playlist-changes" class="btn-primary">Save Changes</button>
        </div>
    `;
    
    document.body.appendChild(modal);

    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    // Save changes
    modal.querySelector('#save-playlist-changes').addEventListener('click', () => {
        const newName = modal.querySelector('#edit-playlist-name').value.trim();
        if (newName) {
            playlist.name = newName;
            playlistManagement.savePlaylists();
            renderPlaylists();
            modal.remove();
        }
    });
}

function deletePlaylist(playlistId) {
    if (confirm('Are you sure you want to delete this playlist?')) {
        playlistManagement.userPlaylists = playlistManagement.userPlaylists.filter(
            p => p.id !== playlistId
        );
        playlistManagement.savePlaylists();
        renderPlaylists();
    }
}

