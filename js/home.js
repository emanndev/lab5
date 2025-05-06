export class HomePage {

    constructor(player, playlist, playlistManagement) {
        this.player = player;
        this.playlist = playlist;
        this.playlistManagement = playlistManagement;
        this.currentTab = 'songs';
        this.initialize();
        this.setupSearch();
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

    initialize() {
        this.setupTabSwitching();
        this.renderSongList();
        this.setupSongClickHandlers();
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
        this.player.play(this.playlist.getCurrentTrack());
        document.querySelector('.player-controls-bar').classList.remove('hidden');
        this.updatePlayerInfo();
    }

    updatePlayerInfo() {
        const track = this.playlist.getCurrentTrack();
        const playerBar = document.querySelector('.player-controls-bar');
        
        playerBar.querySelector('.mini-cover').src = track.cover || 'assets/default-cover.jpg';
        playerBar.querySelector('.track-title').textContent = track.title;
        playerBar.querySelector('.track-artist').textContent = track.artist;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}