import { AudioPlayer } from './player.js';
import { Playlist } from './playlist.js';
import { PlayerUI } from './ui.js';
import { PlaylistManagement } from './playlist-management.js';
import { tracks } from './tracks.js';

// Initialize components
const player = new AudioPlayer();
const mainPlaylist = new Playlist();
const playlistManagement = new PlaylistManagement(mainPlaylist);
const ui = new PlayerUI(player, mainPlaylist);

// Load all tracks
tracks.forEach(track => mainPlaylist.addTrack(track));

// Global modal reference
let currentViewPlaylistModal = null;

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});

function initializePage() {
    renderPlaylists();
    setupCreatePlaylistModal();
    setupGlobalEventListeners();
    restorePlayerState();
}

function setupGlobalEventListeners() {
    document.body.addEventListener('click', (e) => {
        // Handle new playlist button
        if (e.target.closest('.new-playlist')) {
            showCreatePlaylistModal();
            return;
        }

        // Handle playlist item clicks
        const playlistItem = e.target.closest('.grid-item[data-playlist-id]');
        if (playlistItem) {
            const playlistId = parseInt(playlistItem.dataset.playlistId);
            
            if (e.target.closest('.edit-playlist-btn')) {
                e.preventDefault();
                e.stopPropagation();
                editPlaylist(playlistId);
                return;
            }
            
            if (e.target.closest('.delete-playlist-btn')) {
                e.preventDefault();
                e.stopPropagation();
                deletePlaylist(playlistId);
                return;
            }
            
            viewPlaylist(playlistId);
        }
    });
}

function renderPlaylists() {
    const playlistGrid = document.querySelector('.playlist-grid');
    if (!playlistGrid) return;

    playlistGrid.innerHTML = '';

    // Add "Create New Playlist" card
    const newPlaylistCard = document.createElement('div');
    newPlaylistCard.className = 'grid-item new-playlist';
    newPlaylistCard.innerHTML = `
        <div class="new-playlist-icon"><i class="fas fa-plus"></i></div>
        <div class="grid-item-title">New Playlist</div>
    `;
    playlistGrid.appendChild(newPlaylistCard);

    // Render user playlists
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
}

function showCreatePlaylistModal() {
    const modal = document.getElementById('create-playlist-modal');
    if (!modal) return;

    modal.classList.add('active');
    document.getElementById('playlist-name-input').focus();

    // Close on escape key
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') hideCreatePlaylistModal();
    };
    document.addEventListener('keydown', handleKeyDown);
}

function hideCreatePlaylistModal() {
    const modal = document.getElementById('create-playlist-modal');
    if (modal) modal.classList.remove('active');
}

function setupCreatePlaylistModal() {
    const modal = document.getElementById('create-playlist-modal');
    if (!modal) return;

    const createBtn = document.getElementById('confirm-create-playlist');
    const cancelBtn = document.getElementById('cancel-create-playlist');
    
    createBtn?.addEventListener('click', () => {
        const name = document.getElementById('playlist-name-input')?.value.trim();
        if (name) {
            playlistManagement.createNewPlaylist(name);
            renderPlaylists();
            hideCreatePlaylistModal();
            document.getElementById('playlist-name-input').value = '';
        }
    });
    
    cancelBtn?.addEventListener('click', hideCreatePlaylistModal);
    modal.querySelector('.close-modal')?.addEventListener('click', hideCreatePlaylistModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideCreatePlaylistModal();
    });
}

function viewPlaylist(playlistId) {
    // Close any existing modal first
    if (currentViewPlaylistModal) {
        currentViewPlaylistModal.remove();
    }

    const playlist = playlistManagement.userPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;

    const modal = document.createElement('div');
    modal.className = 'modal active playlist-view-modal';
    currentViewPlaylistModal = modal;
    
    // Get the actual track objects
    const playlistTracks = playlistManagement.getPlaylistTracks(playlistId);

    modal.innerHTML = `
        <div class="modal-content large-modal">
            <span class="close-modal">&times;</span>
            <div class="playlist-header">
                <img src="${playlist.image}" alt="${playlist.name}" class="playlist-cover">
                <div class="playlist-info">
                    <h2>${playlist.name}</h2>
                    <p>${playlistTracks.length} songs</p>
                    <div class="playlist-actions">
                        <button class="btn play-all-btn">
                            <i class="fas fa-play"></i> Play All
                        </button>
                        <button class="btn add-songs-btn">
                            <i class="fas fa-plus"></i> Add Songs
                        </button>
                    </div>
                </div>
            </div>
            <div class="playlist-songs">
                ${playlistTracks.length > 0 ? 
                    playlistTracks.map((track, index) => `
                        <div class="song-item" data-song-id="${track.id}">
                            <div class="song-number">${index + 1}</div>
                            <div class="song-info">
                                <img src="${track.cover}" alt="${track.title}">
                                <div>
                                    <div class="song-title">${track.title}</div>
                                    <div class="song-artist">${track.artist}</div>
                                </div>
                            </div>
                            <div class="song-duration">${formatTime(track.duration)}</div>
                            <button class="remove-song-btn"><i class="fas fa-times"></i></button>
                        </div>
                    `).join('') : 
                    '<div class="empty-message">This playlist is empty</div>'
                }
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Close modal when clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close button
    modal.querySelector('.close-modal').addEventListener('click', closeModal);

    // Play all button
    modal.querySelector('.play-all-btn').addEventListener('click', () => {
        playPlaylist(playlistId);
        closeModal();
    });

    // Add songs button
    modal.querySelector('.add-songs-btn').addEventListener('click', () => {
        showAddSongsModal(playlistId);
    });

    // Song item interactions
    modal.querySelectorAll('.song-item').forEach(item => {
        const songId = parseInt(item.dataset.songId);
        
        // Play song when clicked
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-song-btn')) {
                playSong(songId);
            }
        });

        // Remove song button
        const removeBtn = item.querySelector('.remove-song-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeSongFromPlaylist(playlistId, songId);
            });
        }
    });

    // Close on escape key
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);

    function closeModal() {
        modal.remove();
        document.body.style.overflow = '';
        currentViewPlaylistModal = null;
        document.removeEventListener('keydown', handleKeyDown);
    }
}

function playPlaylist(playlistId) {
    const tracks = playlistManagement.getPlaylistTracks(playlistId);
    if (tracks.length > 0) {
        // Create temporary playlist for playback
        const tempPlaylist = new Playlist();
        tracks.forEach(track => tempPlaylist.addTrack(track));
        
        // Set as current playlist
        player.playlist = tempPlaylist;
        player.playlist.currentTrackIndex = 0;
        
        // Play first track
        player.play(player.playlist.getCurrentTrack());
        
        // Update UI
        document.querySelector('.player-controls-bar').classList.remove('hidden');
        ui.updatePlayerInfo();
    }
}

function playSong(songId) {
    const track = mainPlaylist.tracks.find(t => t.id === songId);
    if (track) {
        player.play(track);
        document.querySelector('.player-controls-bar').classList.remove('hidden');
        ui.updatePlayerInfo();
    }
}

function removeSongFromPlaylist(playlistId, songId) {
    playlistManagement.removeSongsFromPlaylist(playlistId, [songId]);
    
    // Refresh the view
    if (currentViewPlaylistModal) {
        viewPlaylist(playlistId);
    } else {
        renderPlaylists();
    }
}

function editPlaylist(playlistId) {
    const playlist = playlistManagement.userPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;

    const modal = document.createElement('div');
    modal.className = 'modal edit-playlist-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>Edit Playlist</h3>
            <div class="form-group">
                <label>Playlist Name</label>
                <input type="text" id="edit-playlist-name" value="${playlist.name}">
            </div>
            <div class="modal-actions">
                <button class="btn cancel-btn">Cancel</button>
                <button class="btn save-btn">Save Changes</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('edit-playlist-name').focus();

    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
    
    modal.querySelector('.save-btn').addEventListener('click', () => {
        const newName = document.getElementById('edit-playlist-name').value.trim();
        if (newName) {
            playlistManagement.editPlaylistName(playlistId, newName);
            renderPlaylists();
            modal.remove();
        }
    });
}

function deletePlaylist(playlistId) {
    if (confirm('Are you sure you want to delete this playlist?')) {
        playlistManagement.deletePlaylist(playlistId);
        renderPlaylists();
    }
}

function showAddSongsModal(playlistId) {
    const modal = document.createElement('div');
    modal.className = 'modal active add-songs-modal';
    
    modal.innerHTML = `
        <div class="modal-content large-modal">
            <span class="close-modal">&times;</span>
            <h3>Add Songs to Playlist</h3>
            <div class="search-box">
                <input type="text" placeholder="Search songs..." id="song-search">
            </div>
            <div class="song-list">
                ${mainPlaylist.tracks.map(track => `
                    <div class="song-item" data-song-id="${track.id}">
                        <input type="checkbox" id="song-${track.id}">
                        <label for="song-${track.id}"></label>
                        <div class="song-info">
                            <img src="${track.cover}" alt="${track.title}">
                            <div>
                                <div class="song-title">${track.title}</div>
                                <div class="song-artist">${track.artist}</div>
                            </div>
                        </div>
                        <div class="song-duration">${formatTime(track.duration)}</div>
                    </div>
                `).join('')}
            </div>
            <div class="modal-actions">
                <button class="btn cancel-btn">Cancel</button>
                <button class="btn add-songs-btn">Add Selected Songs</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal
    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
    };

    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
    
    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Add songs button
    modal.querySelector('.add-songs-btn').addEventListener('click', () => {
        const selectedSongs = [];
        modal.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            selectedSongs.push(parseInt(checkbox.id.replace('song-', '')));
        });
        
        if (selectedSongs.length > 0) {
            playlistManagement.addSongsToPlaylist(playlistId, selectedSongs);
            closeModal();
            viewPlaylist(playlistId); // Refresh the playlist view
        }
    });

    // Search functionality
    document.getElementById('song-search').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        modal.querySelectorAll('.song-item').forEach(item => {
            const title = item.querySelector('.song-title').textContent.toLowerCase();
            const artist = item.querySelector('.song-artist').textContent.toLowerCase();
            item.style.display = (title.includes(searchTerm) || artist.includes(searchTerm)) ? 'flex' : 'none';
        });
    });

    // Close on escape key
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);
}

function restorePlayerState() {
    const savedState = JSON.parse(localStorage.getItem('playerState'));
    if (savedState) {
        player.audio.currentTime = savedState.currentTime || 0;
        if (savedState.isPlaying) {
            const track = mainPlaylist.tracks[savedState.trackIndex];
            if (track) {
                player.play(track);
            }
        }
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export { initializePage };