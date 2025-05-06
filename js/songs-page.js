import { AudioPlayer } from './player.js';
import { Playlist } from './playlist.js';
import { PlayerUI } from './ui.js';

// Initialize components
const player = new AudioPlayer();
const playlist = new Playlist();


// Load tracks from localStorage or default
const savedTracks = JSON.parse(localStorage.getItem('tracks')) || [
    {
        title: "Next to You",
        artist: "Chris Brown",
        album: "Unknown",
        url: "assets/audio/Chris-Brown-Next-to-You-Feat-Justin-Bieber.mp3",
        cover: "assets/covers/next-to-u.jpeg",
        duration: 425
    },
    {
        title: "Residual",
        artist: "Chris Brown",
        album: "11:11",
        url: "assets/audio/Chris brown - Residual.mp3",
        cover: "assets/covers/residuals.jpeg",
        duration: 336
    },
    {
        title: "A Thousand Years",
        artist: "Christina Perri",
        album: "Unknown",
        url: "assets/audio/Christina_perri_-_-_A_Thousand_Years.mp3",
        cover: "assets/covers/a thousand years.jpeg",
        duration: 447
    },
    {
        title: "Back n Forth",
        artist: "Fireboy DML",
        album: "Iseoluwa",
        url: "assets/audio/Fireboy_DML_-_Back_n_Forth_feat_Lagbaja__Vistanaij.com.ng.mp3",
        cover: "assets/covers/Fireboy-DML-Adedamola-Album-EP.jpg",
        duration: 332
    },
    {
        title: "Hell and Back",
        artist: "Fireboy DML",
        album: "Iseoluwa",
        url: "assets/audio/Fireboy_DML_-_Hell_And_Back_Vistanaij.com.ng.mp3",
        cover: "assets/covers/Fireboy-DML-Adedamola-Album-EP.jpg",
        duration: 241
    },
    {
        title: "Letting Go",
        artist: "Fireboy DML",
        album: "Iseoluwa",
        url: "assets/audio/Fireboy_DML_-_Letting_Go_feat_Lojay__Vistanaij.com.ng.mp3",
        cover: "assets/covers/Fireboy-DML-Adedamola-Album-EP.jpg",
        duration: 236
    },
    {
        title: "Luther",
        artist: "Kendrick Lamar",
        album: "GNX",
        url: "assets/audio/Kendrick-Lamar-luther-(HipHopKit.com).mp3",
        cover: "assets/covers/Kendrick-Lamar-Luther-artwork.jpeg",
        duration: 257
    },
    {
        title: "Not Like Us",
        artist: "Kendrick Lamar",
        album: "GNX",
        url: "assets/audio/Kendrick-Lamar-Not-Like-Us-drake-Diss-(HipHopKit.com).mp3",
        cover: "assets/covers/Kendrick-Lamar-Luther-artwork.jpeg",
        duration: 434
    },
    {
        title: "TV Off",
        artist: "Kendrick Lamar",
        album: "GNX",
        url: "assets/audio/Kendrick-Lamar-tv-off-(HipHopKit.com).mp3",
        cover: "assets/covers/Kendrick-Lamar-Luther-artwork.jpeg",
        duration: 340
    },
    {
        title: "Is it a Crime",
        artist: "Rema",
        album: "Unknown",
        url: "assets/audio/Rema-Baby-Is-it-a-Crime-(Vistanaij.com).mp3",
        cover: "assets/covers/is it a crime.jpeg",
        duration: 244
    },
    {
        title: "Bout U",
        artist: "Rema",
        album: "Unknown",
        url: "assets/audio/Rema-Bout-U-(Vistanaij.com).mp3",
        cover: "assets/covers/Rema-Bout-U-Artwork.webp",
        duration: 243
    }
];
savedTracks.forEach(track => playlist.addTrack(track));

// Initialize UI
const ui = new PlayerUI(player, playlist);

// Restore player state on page load
document.addEventListener('DOMContentLoaded', () => {
    player.restoreState();
    renderSongs();
});

// Restore playback state on page load
function initPlayerState() {
    const savedState = JSON.parse(localStorage.getItem('currentPlayback'));
    if (savedState) {
        playlist.currentTrackIndex = savedState.index;
        player.audio.currentTime = savedState.currentTime || 0;
        
        if (savedState.isPlaying) {
            player.play(playlist.getCurrentTrack())
                .then(() => {
                    document.querySelector('.player-controls-bar').classList.remove('hidden');
                    document.querySelector('.play-btn').innerHTML = '<i class="fas fa-pause"></i>';
                });
        }
    }
}
initPlayerState();
renderSongs();


function renderSongs() {
    const songList = document.querySelector('.song-list');
    if (!songList) {
        console.error("Song list element not found!");
        return;
    }
    
    songList.innerHTML = '';
    
    if (!playlist.tracks || playlist.tracks.length === 0) {
        songList.innerHTML = '<div class="empty-message">No songs available</div>';
        return;
    }
    
    playlist.tracks.forEach((track, index) => {
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
                <div class="song-duration">${formatTime(track.duration || 180)}</div>
            </div>
        `;
        
        songList.appendChild(songItem);
    });
    
    setupSongInteractions();
}

function setupSongInteractions() {
    // Play song on click
    document.querySelectorAll('.song-list-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-playlist-btn')) {
                const index = parseInt(item.dataset.index);
                playSong(index);
            }
        });
    });

    // Add to playlist button
    document.querySelectorAll('.add-to-playlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const songItem = e.target.closest('.song-list-item');
            const songId = parseInt(songItem.dataset.index);
            showAddToPlaylistModal(songId);
        });
    });
}

function showAddToPlaylistModal(songId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>Add to Playlist</h3>
            <div class="playlist-options">
                ${playlistManagement.userPlaylists.map(playlist => `
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
    
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    // Add to playlist
    modal.querySelectorAll('.playlist-option').forEach(option => {
        option.addEventListener('click', () => {
            const playlistId = parseInt(option.dataset.playlistId);
            playlistManagement.addSongToPlaylist(playlistId, songId);
            modal.remove();
            showToast(`Added to ${playlistManagement.userPlaylists.find(p => p.id === playlistId).name}`);
        });
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function playSong(index) {
    playlist.currentTrackIndex = index;
    player.play(playlist.getCurrentTrack());
    document.querySelector('.player-controls-bar').classList.remove('hidden');
    ui.updatePlayerInfo();
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Search functionality
document.querySelector('.search-bar input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filterSongs(searchTerm);
});

function filterSongs(searchTerm) {
    const songItems = document.querySelectorAll('.song-list-item');
    songItems.forEach(item => {
        const title = item.querySelector('.song-title').textContent.toLowerCase();
        const artist = item.querySelector('.song-artist').textContent.toLowerCase();
        const album = item.querySelector('.song-album').textContent.toLowerCase();
        const matches = title.includes(searchTerm) || artist.includes(searchTerm) || album.includes(searchTerm);
        item.style.display = matches ? 'flex' : 'none';
    });
}