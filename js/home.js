export class HomePage {
    constructor(player, playlist, playlistManagement) {
        this.player = player;
        this.playlist = playlist;
        this.playlistManagement = playlistManagement;
        this.currentTab = 'songs';
        this.initialize();
        
        // Connect player to playlist management
        this.player.setPlaylist(playlist);
    }

    initialize() {
        this.setupTabSwitching();
        this.renderSongList();
        this.renderPlaylistGrid();
        this.setupSongInteractions();
        this.setupPlaylistModals();
        this.setupArtistAndAlbumClickHandlers();
        this.setupSearch();
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => { 
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                document.querySelectorAll('.content-section').forEach(section => {
                    section.classList.add('hidden');
                });
                this.currentTab = button.dataset.tab;
                document.getElementById(`${this.currentTab}-tab`).classList.remove('hidden');
                switch(this.currentTab) {
                    case 'songs':
                        this.renderSongList();
                        break;
                    case 'artists':
                        this.renderArtistGrid();
                        break;
                    case 'albums':
                        this.renderAlbumGrid();
                        break;
                    case 'playlists':
                        this.renderPlaylistGrid();
                        break;
                }
            });
        });
    }

    renderSongList() {
        const songList = document.querySelector('#songs-tab .song-list');
        songList.innerHTML = '';
        
        this.playlist.tracks.forEach((track, index) => {
            const songItem = document.createElement('div');
            songItem.className = 'song-list-item';
            songItem.dataset.index = index;
            
            songItem.innerHTML = `
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
                    <button class="add-to-playlist-btn" title="Add to playlist">
                        <i class="fas fa-list"></i>
                    </button>
                    <div class="song-duration">${this.formatTime(track.duration || 180)}</div>
                </div>
            `;
            
            songList.appendChild(songItem);
        });

        this.setupSongInteractions();
    }

    setupSongInteractions() {
        document.querySelectorAll('.song-list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.add-to-playlist-btn')) {
                    const index = parseInt(item.dataset.index);
                    this.playTrack(index);
                }
            });
        });
    
        document.querySelectorAll('.add-to-playlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const songItem = e.target.closest('.song-list-item');
                const songId = parseInt(songItem.dataset.index);
                this.showAddToPlaylistModal(songId);
            });
        });
    }

    showAddToPlaylistModal(songId) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Add to Playlist</h3>
                <button class="btn create-playlist-btn">Create New Playlist</button>
                <div class="playlist-options">
                    ${this.playlistManagement.userPlaylists.map(playlist => `
                        <div class="playlist-option" data-playlist-id="${playlist.id}">
                            <img src="${playlist.image}" alt="${playlist.name}">
                            <div>
                                <div class="playlist-name">${playlist.name}</div>
                                <div class="playlist-count">${playlist.songs.length} songs</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        
        modal.querySelectorAll('.playlist-option').forEach(option => {
            option.addEventListener('click', () => {
                const playlistId = parseInt(option.dataset.playlistId);
                this.playlistManagement.addSongsToPlaylist(playlistId, [songId]);
                this.showToast(`Added "${this.playlist.tracks[songId].title}" to ${this.playlistManagement.userPlaylists.find(p => p.id === playlistId).name}`);
                modal.remove();
                this.renderPlaylistGrid();
            });
        });

        modal.querySelector('.create-playlist-btn').addEventListener('click', () => {
            modal.remove();
            this.showCreatePlaylistModal(songId);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    showCreatePlaylistModal(songId = null) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Create New Playlist</h3>
                <div class="form-group">
                    <label for="playlist-name-input">Playlist Name</label>
                    <input type="text" id="playlist-name-input" placeholder="My Awesome Playlist">
                </div>
                <div class="modal-actions">
                    <button class="btn cancel-btn">Cancel</button>
                    <button class="btn primary confirm-btn">Create</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        
        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            const name = modal.querySelector('#playlist-name-input').value.trim();
            if (name) {
                const songIds = songId !== null ? [songId] : [];
                this.playlistManagement.createNewPlaylist(name, songIds);
                this.showToast(`Created playlist "${name}"${songId !== null ? ` and added "${this.playlist.tracks[songId].title}"` : ''}`);
                this.renderPlaylistGrid();
                modal.remove();
            }
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    renderPlaylistGrid() {
        const playlistGrid = document.querySelector('.playlist-grid');
        playlistGrid.innerHTML = '';

        const newPlaylistCard = document.createElement('div');
        newPlaylistCard.className = 'grid-item new-playlist';
        newPlaylistCard.innerHTML = `
            <div class="new-playlist-icon"><i class="fas fa-plus"></i></div>
            <div class="grid-item-title">New Playlist</div>
        `;
        newPlaylistCard.addEventListener('click', () => this.showCreatePlaylistModal());
        playlistGrid.appendChild(newPlaylistCard);

        this.playlistManagement.userPlaylists.forEach(playlist => {
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
            
            playlistItem.addEventListener('click', (e) => {
                if (!e.target.closest('.playlist-actions')) {
                    this.viewPlaylist(playlist.id);
                }
            });
            
            playlistItem.querySelector('.edit-playlist-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.editPlaylist(playlist.id);
            });
            
            playlistItem.querySelector('.delete-playlist-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deletePlaylist(playlist.id);
            });
            
            playlistGrid.appendChild(playlistItem);
        });
    }

    viewPlaylist(playlistId) {
        const playlist = this.playlistManagement.userPlaylists.find(p => p.id === playlistId);
        if (!playlist) return;

        const modal = document.createElement('div');
        modal.className = 'modal active playlist-view-modal';
        modal.innerHTML = `
            <div class="modal-content large-modal">
                <span class="close-modal">&times;</span>
                <div class="playlist-header">
                    <img src="${playlist.image}" alt="${playlist.name}" class="playlist-cover">
                    <div class="playlist-info">
                        <h2 contenteditable="true" class="editable-playlist-name">${playlist.name}</h2>
                        <p>${playlist.songs.length} songs</p>
                        <div class="playlist-actions">
                            <button class="btn play-all-btn">
                                <i class="fas fa-play"></i> Play All
                            </button>
                            <button class="btn add-songs-btn">
                                <i class="fas fa-plus"></i> Add Songs
                            </button>
                            <button class="btn delete-playlist-btn danger">
                                <i class="fas fa-trash"></i> Delete Playlist
                            </button>
                        </div>
                    </div>
                </div>
                <div class="playlist-songs">
                    ${playlist.songs.length > 0 ? 
                        playlist.songs.map((songId, index) => {
                            const track = this.playlist.tracks.find(t => t.id === songId);
                            return track ? `
                                <div class="song-item" data-song-id="${songId}">
                                    <div class="song-number">${index + 1}</div>
                                    <div class="song-info">
                                        <img src="${track.cover}" alt="${track.title}">
                                        <div>
                                            <div class="song-title">${track.title}</div>
                                            <div class="song-artist">${track.artist}</div>
                                        </div>
                                    </div>
                                    <div class="song-duration">${this.formatTime(track.duration)}</div>
                                    <button class="remove-song-btn"><i class="fas fa-times"></i></button>
                                </div>
                            ` : '';
                        }).join('') : 
                        '<div class="empty-message">This playlist is empty</div>'
                    }
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        
        modal.querySelector('.play-all-btn').addEventListener('click', () => {
            this.playPlaylist(playlistId);
            modal.remove();
        });

        modal.querySelector('.add-songs-btn').addEventListener('click', () => {
            this.showAddSongsModal(playlistId);
        });

        modal.querySelector('.delete-playlist-btn').addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
                this.deletePlaylist(playlistId);
                modal.remove();
            }
        });

        const nameElement = modal.querySelector('.editable-playlist-name');
        nameElement.addEventListener('blur', () => {
            const newName = nameElement.textContent.trim();
            if (newName && newName !== playlist.name) {
                this.playlistManagement.editPlaylistName(playlistId, newName);
                this.showToast(`Renamed playlist to "${newName}"`);
                this.renderPlaylistGrid();
            }
        });

        modal.querySelectorAll('.song-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.remove-song-btn')) {
                    const songId = parseInt(item.dataset.songId);
                    this.playSongFromPlaylist(playlistId, songId);
                }
            });

            item.querySelector('.remove-song-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const songId = parseInt(item.dataset.songId);
                this.playlistManagement.removeSongsFromPlaylist(playlistId, [songId]);
                item.remove();
                const countElement = modal.querySelector('.playlist-info p');
                const currentCount = parseInt(countElement.textContent);
                countElement.textContent = `${currentCount - 1} songs`;
                this.showToast(`Removed "${this.playlist.tracks.find(t => t.id === songId).title}" from "${playlist.name}"`);
                this.renderPlaylistGrid();
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    showAddSongsModal(playlistId) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Add Songs to Playlist</h3>
                <div class="modal-songs-list">
                    ${this.playlist.tracks.map((track, index) => `
                        <div class="modal-song-item" data-index="${index}">
                            <div class="song-checkbox">
                                <input type="checkbox" class="song-select-checkbox" data-song-index="${index}">
                            </div>
                            <div class="song-info">
                                <div class="song-title">${track.title}</div>
                                <div class="song-artist">${track.artist}</div>
                            </div>
                            <div class="song-duration">${this.formatTime(track.duration)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="modal-actions">
                    <button class="btn select-all-btn">Select All</button>
                    <button class="btn primary add-selected-btn">Add Selected</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const selectAllBtn = modal.querySelector('.select-all-btn');
        const addSelectedBtn = modal.querySelector('.add-selected-btn');

        selectAllBtn.addEventListener('click', () => {
            const checkboxes = modal.querySelectorAll('.song-select-checkbox');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            checkboxes.forEach(cb => cb.checked = !allChecked);
        });

        addSelectedBtn.addEventListener('click', () => {
            const selectedCheckboxes = modal.querySelectorAll('.song-select-checkbox:checked');
            const songIndices = Array.from(selectedCheckboxes).map(cb => parseInt(cb.dataset.songIndex));
            if (songIndices.length > 0) {
                this.playlistManagement.addSongsToPlaylist(playlistId, songIndices.map(index => this.playlist.tracks[index].id));
                this.showToast(`Added ${songIndices.length} song${songIndices.length > 1 ? 's' : ''} to "${this.playlistManagement.userPlaylists.find(p => p.id === playlistId).name}"`);
                this.renderPlaylistGrid();
            }
            modal.remove();
        });

        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    playSongFromPlaylist(playlistId, songId) {
        const playlistTracks = this.playlistManagement.getPlaylistTracks(playlistId);
        const trackIndex = playlistTracks.findIndex(t => t.id === songId);
        
        if (trackIndex !== -1) {
            const tempPlaylist = new Playlist();
            playlistTracks.forEach(track => tempPlaylist.addTrack(track));
            tempPlaylist.currentTrackIndex = trackIndex;
            
            this.player.setPlaylist(tempPlaylist);
            this.player.play(tempPlaylist.getCurrentTrack());
            this.updatePlayerInfo();
        }
    }

    playPlaylist(playlistId) {
        const tracks = this.playlistManagement.getPlaylistTracks(playlistId);
        if (tracks.length > 0) {
            const tempPlaylist = new Playlist();
            tracks.forEach(track => tempPlaylist.addTrack(track));
            tempPlaylist.currentTrackIndex = 0;
            
            this.player.setPlaylist(tempPlaylist);
            this.player.play(tempPlaylist.getCurrentTrack());
            this.updatePlayerInfo();
        }
    }

    editPlaylist(playlistId) {
        const playlist = this.playlistManagement.userPlaylists.find(p => p.id === playlistId);
        if (!playlist) return;

        this.showCreatePlaylistModal(null, playlist.name);
        const modal = document.querySelector('.modal');
        modal.querySelector('h3').textContent = 'Edit Playlist';
        modal.querySelector('.confirm-btn').textContent = 'Save';
        modal.querySelector('#playlist-name-input').value = playlist.name;

        modal.querySelector('.confirm-btn').replaceWith(modal.querySelector('.confirm-btn').cloneNode(true));
        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            const newName = modal.querySelector('#playlist-name-input').value.trim();
            if (newName && newName !== playlist.name) {
                this.playlistManagement.editPlaylistName(playlistId, newName);
                this.showToast(`Renamed playlist to "${newName}"`);
                this.renderPlaylistGrid();
            }
            modal.remove();
        });
    }

    deletePlaylist(playlistId) {
        const playlist = this.playlistManagement.userPlaylists.find(p => p.id === playlistId);
        if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
            this.playlistManagement.deletePlaylist(playlistId);
            this.showToast(`Deleted playlist "${playlist.name}"`);
            this.renderPlaylistGrid();
        }
    }

    updatePlayerInfo() {
        const track = this.player.currentTrack || this.playlist.getCurrentTrack();
        if (track) {
            this.player.updatePlayerUI(track);
            const playerBar = document.querySelector('.player-controls-bar');
            if (playerBar) {
                playerBar.classList.remove('hidden');
                playerBar.style.display = 'flex';
            }
        }
    }

    setupArtistAndAlbumClickHandlers() {
        document.querySelector('.artist-grid')?.addEventListener('click', (e) => {
            const artistItem = e.target.closest('.grid-item');
            if (artistItem) {
                const artistName = artistItem.querySelector('.grid-item-title').textContent;
                this.showArtistModal(artistName);
            }
        });
    
        document.querySelector('.album-grid')?.addEventListener('click', (e) => {
            const albumItem = e.target.closest('.grid-item');
            if (albumItem) {
                const albumTitle = albumItem.querySelector('.grid-item-title').textContent;
                const albumArtist = albumItem.querySelector('.grid-item-subtitle').textContent;
                this.showAlbumModal(albumTitle, albumArtist);
            }
        });
    }

    showArtistModal(artistName) {
        const modal = document.querySelector('.content-modal');
        if (!modal) return;

        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');

        modal.querySelector('.close-modal').replaceWith(modal.querySelector('.close-modal').cloneNode(true));

        const artistSongs = this.playlist.tracks.filter(track => track.artist === artistName);
        modal.querySelector('#modal-cover').src = artistSongs[0]?.cover || 'assets/default-artist.jpg';
        modal.querySelector('#modal-title').textContent = artistName;
        modal.querySelector('#modal-subtitle').textContent = `${artistSongs.length} ${artistSongs.length === 1 ? 'song' : 'songs'}`;
        this.renderModalSongsList(artistSongs);
        this.setupModalActions(artistSongs);
        
        this.setupModalCloseHandler();
    }

    showAlbumModal(albumTitle, albumArtist) {
        const modal = document.querySelector('.content-modal');
        if (!modal) return;

        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');

        modal.querySelector('.close-modal').replaceWith(modal.querySelector('.close-modal').cloneNode(true));

        const albumSongs = this.playlist.tracks.filter(track => 
            track.album === albumTitle && track.artist === albumArtist
        );
        
        modal.querySelector('#modal-cover').src = albumSongs[0]?.cover || 'assets/default-cover.jpg';
        modal.querySelector('#modal-title').textContent = albumTitle;
        modal.querySelector('#modal-subtitle').textContent = albumArtist;

        this.renderModalSongsList(albumSongs);
        this.setupModalActions(albumSongs);

        this.setupModalCloseHandler();
    }

    renderModalSongsList(songs) {
        const songsList = document.querySelector('.modal-songs-list');
        songsList.innerHTML = '';
        
        songs.forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.className = 'modal-song-item';
            songItem.dataset.index = this.playlist.tracks.findIndex(t => t.url === song.url);
            if (this.playlist.currentTrackIndex === this.playlist.tracks.findIndex(t => t.url === song.url)) {
                songItem.classList.add('playing');
            }
            
            songItem.innerHTML = `
                <div class="song-checkbox">
                    <input type="checkbox" class="song-select-checkbox" data-song-index="${index}">
                </div>
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
                <div class="song-duration">${this.formatTime(song.duration)}</div>
                <button class="song-play-btn">
                    <i class="fas fa-play"></i>
                </button>
            `;
            
            songsList.appendChild(songItem);
        });
        
        this.setupModalSongInteractions();
    }

    setupModalActions(songs) {
        const modal = document.querySelector('.content-modal');
        const selectAllCheckbox = modal.querySelector('#select-all-checkbox');
        const playAllBtn = modal.querySelector('#play-all-btn');
        const addAllBtn = modal.querySelector('#add-all-btn');
        
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = modal.querySelectorAll('.song-select-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
        });
        
        playAllBtn.addEventListener('click', () => {
            const firstSongIndex = this.playlist.tracks.findIndex(t => t.url === songs[0].url);
            this.playlist.currentTrackIndex = firstSongIndex;
            this.player.play(this.playlist.getCurrentTrack());
        });
        
        addAllBtn.addEventListener('click', () => {
            const selectedCheckboxes = modal.querySelectorAll('.song-select-checkbox:checked');
            const songIndices = [];
            
            if (selectedCheckboxes.length === 0) {
                songs.forEach(song => {
                    songIndices.push(this.playlist.tracks.findIndex(t => t.url === song.url));
                });
            } else {
                selectedCheckboxes.forEach(checkbox => {
                    const index = parseInt(checkbox.dataset.songIndex);
                    songIndices.push(this.playlist.tracks.findIndex(t => t.url === songs[index].url));
                });
            }
            
            this.showAddMultipleToPlaylistModal(songIndices);
        });
    }

    setupModalSongInteractions() {
        const modal = document.querySelector('.content-modal');
        
        modal.querySelectorAll('.song-play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const songItem = e.target.closest('.modal-song-item');
                const index = parseInt(songItem.dataset.index);
                this.playTrack(index);
            });
        });
        
        modal.querySelectorAll('.modal-song-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('song-select-checkbox') && 
                    !e.target.closest('.song-play-btn')) {
                    const index = parseInt(item.dataset.index);
                    this.playTrack(index);
                }
            });
        });
    }

    setupModalCloseHandler() {
        const modal = document.querySelector('.content-modal');
        if (!modal) return;
    
        modal.querySelector('.close-modal').replaceWith(modal.querySelector('.close-modal').cloneNode(true));
        
        modal.querySelector('.close-modal').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeModal();
        });
    
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    closeModal() {
        const modal = document.querySelector('.content-modal');
        if (!modal) return;
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.body.classList.remove('modal-open');
    }

    showAddMultipleToPlaylistModal(songIndices) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Add to Playlist</h3>
                <div class="playlist-options">
                    ${this.playlistManagement.userPlaylists.map(playlist => `
                        <div class="playlist-option" data-playlist-id="${playlist.id}">
                            <img src="${playlist.image}" alt="${playlist.name}">
                            <div>
                                <div class="playlist-name">${playlist.name}</div>
                                <div class="playlist-count">${playlist.songs.length} songs</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        
        modal.querySelectorAll('.playlist-option').forEach(option => {
            option.addEventListener('click', () => {
                const playlistId = parseInt(option.dataset.playlistId);
                this.playlistManagement.addSongsToPlaylist(playlistId, songIndices.map(index => this.playlist.tracks[index].id));
                this.showToast(`Added ${songIndices.length} songs to ${this.playlistManagement.userPlaylists.find(p => p.id === playlistId).name}`);
                modal.remove();
                this.renderPlaylistGrid();
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    setupPlaylistModals() {
        // No static button needed; handled by renderPlaylistGrid
    }

    setupSearch() {
        const searchInput = document.querySelector('.search-bar input');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            this.filterContent(searchTerm);
        });
    }

    filterContent(searchTerm) {
        switch(this.currentTab) {
            case 'songs':
                this.filterSongs(searchTerm);
                break;
            case 'artists':
                this.filterArtists(searchTerm);
                break;
            case 'albums':
                this.filterAlbums(searchTerm);
                break;
            case 'playlists':
                this.filterPlaylists(searchTerm);
                break;
        }
    }

    filterSongs(searchTerm) {
        const songItems = document.querySelectorAll('.song-list-item');
        songItems.forEach(item => {
            const title = item.querySelector('.song-title').textContent.toLowerCase();
            const artist = item.querySelector('.song-artist').textContent.toLowerCase();
            const matches = title.includes(searchTerm) || artist.includes(searchTerm);
            item.style.display = matches ? 'flex' : 'none';
        });
    }

    filterArtists(searchTerm) {
        const artistItems = document.querySelectorAll('.artist-grid .grid-item');
        artistItems.forEach(item => {
            const name = item.querySelector('.grid-item-title').textContent.toLowerCase();
            item.style.display = name.includes(searchTerm) ? 'block' : 'none';
        });
    }

    filterAlbums(searchTerm) {
        const albumItems = document.querySelectorAll('.album-grid .grid-item');
        albumItems.forEach(item => {
            const title = item.querySelector('.grid-item-title').textContent.toLowerCase();
            const artist = item.querySelector('.grid-item-subtitle').textContent.toLowerCase();
            const matches = title.includes(searchTerm) || artist.includes(searchTerm);
            item.style.display = matches ? 'block' : 'none';
        });
    }

    filterPlaylists(searchTerm) {
        const playlistItems = document.querySelectorAll('.playlist-grid .grid-item');
        playlistItems.forEach(item => {
            const name = item.querySelector('.grid-item-title').textContent.toLowerCase();
            item.style.display = name.includes(searchTerm) ? 'block' : 'none';
        });
    }

    renderArtistGrid() {
        const artists = {};
        this.playlist.tracks.forEach(track => {
            if (!artists[track.artist]) {
                artists[track.artist] = {
                    name: track.artist,
                    image: track.cover || 'assets/default-artist.jpg',
                    songCount: 0
                };
            }
            artists[track.artist].songCount++;
        });

        const artistGrid = document.querySelector('.artist-grid');
        artistGrid.innerHTML = '';
        
        Object.values(artists).forEach(artist => {
            const artistItem = document.createElement('div');
            artistItem.className = 'grid-item';
            
            artistItem.innerHTML = `
                <img src="${artist.image}" alt="${artist.name}">
                <div class="grid-item-info">
                    <div class="grid-item-title">${artist.name}</div>
                    <div class="grid-item-subtitle">${artist.songCount} ${artist.songCount === 1 ? 'song' : 'songs'}</div>
                </div>
            `;
            
            artistGrid.appendChild(artistItem);
        });
        this.setupArtistAndAlbumClickHandlers();
    }

    renderAlbumGrid() {
        const albums = {};
        this.playlist.tracks.forEach(track => {
            const albumName = track.album || 'Unknown Album';
            if (!albums[albumName]) {
                albums[albumName] = {
                    name: albumName,
                    artist: track.artist,
                    cover: track.cover || 'assets/default-cover.jpg',
                    songCount: 0
                };
            }
            albums[albumName].songCount++;
        });

        const albumGrid = document.querySelector('.album-grid');
        albumGrid.innerHTML = '';
        
        Object.values(albums).forEach(album => {
            const albumItem = document.createElement('div');
            albumItem.className = 'grid-item';
            
            albumItem.innerHTML = `
                <img src="${album.cover}" alt="${album.name}">
                <div class="grid-item-info">
                    <div class="grid-item-title">${album.name}</div>
                    <div class="grid-item-subtitle">${album.artist}</div>
                </div>
            `;
            
            albumGrid.appendChild(albumItem);
        });
        this.setupArtistAndAlbumClickHandlers();
    }

    playTrack(index) {
        this.playlist.currentTrackIndex = index;
        const track = this.playlist.getCurrentTrack();
        this.player.play(track);
        this.updatePlayerInfo();
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}