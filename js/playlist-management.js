export class PlaylistManagement {
    constructor(playlist) {
        this.playlist = playlist;
        this.userPlaylists = JSON.parse(localStorage.getItem('userPlaylists')) || [
            { id: 1, name: 'Favorites', songs: [], image: 'assets/playlist-favorites.jpg' },
            { id: 2, name: 'Workout Mix', songs: [], image: 'assets/playlist-workout.jpg' }
        ];
        this.initialize();
    }

    initialize() {
        this.renderPlaylists();
        this.setupPlaylistModal();
        this.setupPlaylistClickHandlers();
    }

    renderPlaylists() {
        const playlistGrid = document.querySelector('.playlist-grid');
        playlistGrid.innerHTML = '';

        // Add "Create New Playlist" card
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

        // Add user playlists
        this.userPlaylists.forEach(playlist => {
            const playlistItem = document.createElement('div');
            playlistItem.className = 'grid-item';
            playlistItem.dataset.playlistId = playlist.id;
            
            playlistItem.innerHTML = `
                <img src="${playlist.image}" alt="${playlist.name}">
                <div class="grid-item-info">
                    <div class="grid-item-title">${playlist.name}</div>
                    <div class="grid-item-subtitle">${playlist.songs.length} songs</div>
                </div>
                <button class="playlist-edit-btn"><i class="fas fa-ellipsis-h"></i></button>
            `;
            
            playlistGrid.appendChild(playlistItem);
        });
    }

    setupPlaylistModal() {
        // Create modal HTML
        const modalHTML = `
            <div class="modal playlist-modal hidden">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h3>Create New Playlist</h3>
                    <div class="form-group">
                        <label for="playlist-name">Playlist Name</label>
                        <input type="text" id="playlist-name" placeholder="My Awesome Playlist">
                    </div>
                    <button id="create-playlist-btn" class="btn-primary">Create Playlist</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Event listeners for modal
        document.querySelectorAll('.new-playlist').forEach(el => {
            el.addEventListener('click', () => {
                document.querySelector('.playlist-modal').classList.remove('hidden');
            });
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            document.querySelector('.playlist-modal').classList.add('hidden');
        });

        document.getElementById('create-playlist-btn').addEventListener('click', () => {
            this.createNewPlaylist();
        });
    }

    createNewPlaylist() {
        const nameInput = document.getElementById('playlist-name');
        const name = nameInput.value.trim();
        
        if (name) {
            const newPlaylist = {
                id: Date.now(), // Simple unique ID
                name,
                songs: [],
                image: 'assets/default-playlist.jpg'
            };
            
            this.userPlaylists.push(newPlaylist);
            this.savePlaylists();
            this.renderPlaylists();
            
            nameInput.value = '';
            document.querySelector('.playlist-modal').classList.add('hidden');
        }
    }

    savePlaylists() {
        localStorage.setItem('userPlaylists', JSON.stringify(this.userPlaylists));
    }

    setupPlaylistClickHandlers() {
        document.querySelector('.playlist-grid').addEventListener('click', (e) => {
            const playlistItem = e.target.closest('.grid-item');
            const editBtn = e.target.closest('.playlist-edit-btn');
            
            if (editBtn) {
                e.stopPropagation();
                this.showPlaylistOptions(playlistItem.dataset.playlistId);
            } else if (playlistItem && !playlistItem.classList.contains('new-playlist')) {
                this.viewPlaylistDetails(playlistItem.dataset.playlistId);
            }
        });
    }

    showPlaylistOptions(playlistId) {
        // Implement context menu for playlist options
        console.log(`Show options for playlist ${playlistId}`);
        // Would include: Rename, Delete, Add Songs, etc.
    }

    viewPlaylistDetails(playlistId) {
        // Implement view for a specific playlist
        console.log(`View details for playlist ${playlistId}`);
        // Would show songs in this playlist and allow playing
    }

    addSongToPlaylist(playlistId, songId) {
        const playlist = this.userPlaylists.find(p => p.id === playlistId);
        if (playlist && !playlist.songs.includes(songId)) {
            playlist.songs.push(songId);
            this.savePlaylists();
            return true;
        }
        return false;
    }
}