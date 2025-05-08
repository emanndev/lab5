export class HomePage {

    constructor(player, playlist, playlistManagement) {
        this.player = player;
        this.playlist = playlist;
        this.playlistManagement = playlistManagement;
        this.currentTab = 'songs';
        this.initialize();
    }

    initialize() {
        this.setupTabSwitching();
        this.renderSongList();
        this.setupSongInteractions();
        this.setupSongClickHandlers();
        this.setupPlaylistModals();
        this.setupArtistAndAlbumClickHandlers(); 
    }

    setupArtistAndAlbumClickHandlers() {
        console.log('Setting up artist and album click handlers');

        // Artist click handler
        document.querySelector('.artist-grid')?.addEventListener('click', (e) => {
            console.log('Artist grid clicked');
            const artistItem = e.target.closest('.grid-item');
            if (artistItem) {
                console.log('Artist item clicked:', artistItem);
                const artistName = artistItem.querySelector('.grid-item-title').textContent;
                this.showArtistModal(artistName);
            }
        });
    
        // Album click handler
        document.querySelector('.album-grid')?.addEventListener('click', (e) => {
            console.log('Album grid clicked');   
            const albumItem = e.target.closest('.grid-item');
            if (albumItem) {
                console.log('Album item clicked:', albumItem);
                const albumTitle = albumItem.querySelector('.grid-item-title').textContent;
                const albumArtist = albumItem.querySelector('.grid-item-subtitle').textContent;
                this.showAlbumModal(albumTitle, albumArtist);
            }
        });
    }

    showArtistModal(artistName) {
        console.log('Showing artist modal for:', artistName);
        const modal = document.querySelector('.content-modal');
        if (!modal) return;
        console.log('Modal element:', modal);

         // Reset modal state
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

         // Prevent double listeners
    modal.querySelector('.close-modal').replaceWith(modal.querySelector('.close-modal').cloneNode(true));
    
 
  document.body.classList.add('modal-open');

        const artistSongs = this.playlist.tracks.filter(track => track.artist === artistName);
        console.log('Artist songs:', artistSongs);    
        // Set modal header
        modal.querySelector('#modal-cover').src = artistSongs[0]?.cover || 'assets/default-artist.jpg';
        modal.querySelector('#modal-title').textContent = artistName;
        modal.querySelector('#modal-subtitle').textContent = `${artistSongs.length} ${artistSongs.length === 1 ? 'song' : 'songs'}`;
        this.renderModalSongsList(artistSongs);
        this.setupModalActions(artistSongs);
        
        // Show modal
        modal.classList.add('active');
        modal.style.display = 'flex';  
    
        this.setupModalCloseHandler();
    }

    showAlbumModal(albumTitle, albumArtist) {
        console.log('Showing album modal for:', albumTitle, 'by', albumArtist);
        const modal = document.querySelector('.content-modal');
        if (!modal) return;
        console.log('Modal element:', modal);

    // Reset modal state
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

            // Prevent double listeners
    modal.querySelector('.close-modal').replaceWith(modal.querySelector('.close-modal').cloneNode(true));

    document.body.classList.add('modal-open');

        const albumSongs = this.playlist.tracks.filter(track => 
            track.album === albumTitle && track.artist === albumArtist
        );
        
        // Set modal header
        modal.querySelector('#modal-cover').src = albumSongs[0]?.cover || 'assets/default-cover.jpg';
        modal.querySelector('#modal-title').textContent = albumTitle;
        modal.querySelector('#modal-subtitle').textContent = albumArtist;

        this.renderModalSongsList(albumSongs);
        this.setupModalActions(albumSongs);

        modal.classList.add('active');
        modal.style.display = 'flex'; 
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
        
        // Setup song click handlers
        this.setupModalSongInteractions();
    }

    setupModalActions(songs) {
        const modal = document.querySelector('.content-modal');
        const selectAllCheckbox = modal.querySelector('#select-all-checkbox');
        const playAllBtn = modal.querySelector('#play-all-btn');
        const addAllBtn = modal.querySelector('#add-all-btn');
        
        // Select all checkbox
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = modal.querySelectorAll('.song-select-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
        });
        
        // Play all button
        playAllBtn.addEventListener('click', () => {
            const firstSongIndex = this.playlist.tracks.findIndex(t => t.url === songs[0].url);
            this.playlist.currentTrackIndex = firstSongIndex;
            this.player.play(this.playlist.getCurrentTrack());
            
            // Queue the rest of the songs
            for (let i = 1; i < songs.length; i++) {
                this.playlist.queue.push(this.playlist.tracks.findIndex(t => t.url === songs[i].url));
            }
        });
        
        // Add to playlist button
        addAllBtn.addEventListener('click', () => {
            const selectedCheckboxes = modal.querySelectorAll('.song-select-checkbox:checked');
            const songIndices = [];
            
            if (selectedCheckboxes.length === 0) {
                songs.forEach(song => {
                    songIndices.push(this.playlist.tracks.findIndex(t => t.url === song.url));
                });
            } else {
                // Add selected songs
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
        
        // Play individual song
        modal.querySelectorAll('.song-play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const songItem = e.target.closest('.modal-song-item');
                const index = parseInt(songItem.dataset.index);
                this.playTrack(index);
            });
        });
        
        // Click song row
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
    
        // Remove existing listeners to prevent duplicates
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.replaceWith(closeBtn.cloneNode(true));
        
        modal.querySelector('.close-modal').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeModal();
        });
    
        // Click outside listener
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
        document.body.style.pointerEvents = 'auto';
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
        
        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        // Add to playlist
        modal.querySelectorAll('.playlist-option').forEach(option => {
            option.addEventListener('click', () => {
                const playlistId = parseInt(option.dataset.playlistId);
                songIndices.forEach(songIndex => {
                    this.playlistManagement.addSongToPlaylist(playlistId, songIndex);
                });
                modal.remove();
                document.querySelector('.content-modal').classList.add('hidden');
                this.showToast(`Added ${songIndices.length} songs to ${this.playlistManagement.userPlaylists.find(p => p.id === playlistId).name}`);
            });
        });
    }  

   setupPlaylistModals() {
    document.getElementById('create-playlist-btn')?.addEventListener('click', () => {
        document.querySelector('.playlist-modal').classList.remove('hidden');
    });

    document.getElementById('confirm-create-playlist')?.addEventListener('click', () => {
        this.createNewPlaylist();
    });
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
        const songItems = document.querySelectorAll('.song-item');
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
    }
    
    setupSongInteractions() {
        // Play song on click
        document.querySelectorAll('.song-list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.add-to-playlist-btn')) {
                    const index = parseInt(item.dataset.index);
                    this.playTrack(index);
                }
            });
        });
    
        // Add to playlist button
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
        
        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        // Add to playlist
        modal.querySelectorAll('.playlist-option').forEach(option => {
            option.addEventListener('click', () => {
                const playlistId = parseInt(option.dataset.playlistId);
                this.playlistManagement.addSongToPlaylist(playlistId, songId);
                modal.remove();
                this.showToast(`Added to ${this.playlistManagement.userPlaylists.find(p => p.id === playlistId).name}`);
            });
        });
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

    renderArtistGrid() {
        // Group tracks by artist
        const artists = {};
        this.playlist.tracks.forEach(track => {
            if (!artists[track.artist]) {
                artists[track.artist] = {
                    name: track.artist,
                    image: track.cover || 'assets/covers/default-artist.jpg',
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
        // Group tracks by album 
        const albums = {};
        this.playlist.tracks.forEach(track => {
            const albumName = track.album || 'Unknown Album';
            if (!albums[albumName]) {
                albums[albumName] = {
                    name: albumName,
                    artist: track.artist,
                    cover: track.cover || 'assets/covers/default-cover.jpg',
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

    renderPlaylistGrid() {
        // static data for playlist display
        const playlists = [
            { name: 'Favorites', songCount: 12, image: 'assets/playlist-favorites.jpg' },
            { name: 'Workout Mix', songCount: 8, image: 'assets/playlist-workout.jpg' },
            { name: 'Chill Vibes', songCount: 15, image: 'assets/playlist-chill.jpg' },
            { name: 'Road Trip', songCount: 20, image: 'assets/playlist-roadtrip.jpg' }
        ];

        const playlistGrid = document.querySelector('.playlist-grid');
        playlistGrid.innerHTML = '';
        
        playlists.forEach(playlist => {
            const playlistItem = document.createElement('div');
            playlistItem.className = 'grid-item';
            
            playlistItem.innerHTML = `
                <img src="${playlist.image}" alt="${playlist.name}">
                <div class="grid-item-info">
                    <div class="grid-item-title">${playlist.name}</div>
                    <div class="grid-item-subtitle">${playlist.songCount} songs</div>
                </div>
            `;
            
            playlistGrid.appendChild(playlistItem);
        });
    }

    setupSongClickHandlers() {
        document.querySelector('.song-list').addEventListener('click', (e) => {
            const songItem = e.target.closest('.song-item');
            if (songItem) {
                const index = parseInt(songItem.dataset.index);
                this.playTrack(index);
            }
        });
    }

    playTrack(index) {
        this.playlist.currentTrackIndex = index;
        const track = this.playlist.getCurrentTrack();
        this.player.play(track);

         const playerBar = document.querySelector('.player-controls-bar');
        if (playerBar) {
            playerBar.classList.remove('hidden');
            playerBar.style.display = 'flex';

         playerBar.querySelector('.mini-cover').src = track.cover || 'assets/default-cover.jpg';
         playerBar.querySelector('.track-title').textContent = track.title;
         playerBar.querySelector('.track-artist').textContent = track.artist;
        }
        this.updatePlayerInfo();
        this.player.play(track).catch(error => {
            console.error("Playback failed:", error);
        });
    }

    updatePlayerInfo() {
        const track = this.playlist.getCurrentTrack();
        if (this.player.updatePlayerUI) {
            this.player.updatePlayerUI(track); 
        } else {
            const playerBar = document.querySelector('.player-controls-bar');
            if (playerBar && track) {
                playerBar.querySelector('.mini-cover').src = track.cover || 'assets/default-cover.jpg';
                playerBar.querySelector('.track-title').textContent = track.title;
                playerBar.querySelector('.track-artist').textContent = track.artist;
            }
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}