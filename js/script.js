import { HomePage } from './home.js';
import { AudioPlayer } from './player.js';
import { PlayerUI } from './ui.js';
import { Playlist } from './playlist.js';
import { PlaylistManagement } from './playlist-management.js';

// Initialize components
const player = new AudioPlayer();
const playlist = new Playlist();
const playlistManagement = new PlaylistManagement(playlist);


// Shared state in localStorage
if (!localStorage.getItem('currentTrack')) {
    localStorage.setItem('currentTrack', JSON.stringify({
        index: 0,
        currentTime: 0,
        isPlaying: false
    }));
}

// Static songs data
const tracks = [
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
tracks.forEach(track => playlist.addTrack(track));



// Initialize UI components
const ui = new PlayerUI(player, playlist);
const homePage = new HomePage(player, playlist, playlistManagement);


function initPlayerState() {
    const savedState = JSON.parse(localStorage.getItem('currentTrack')); 
    if (savedState) {
        playlist.currentTrackIndex = savedState.index;
        player.audio.currentTime = savedState.currentTime || 0;
        
        if (savedState.isPlaying) {
            player.play(playlist.getCurrentTrack())
                .then(() => {
                    const playerBar = document.querySelector('.player-controls-bar');
                    if (playerBar) {
                        playerBar.classList.remove('hidden');
                        playerBar.style.display = 'flex';
                    }
                    document.querySelector('.play-btn').innerHTML = '<i class="fas fa-pause"></i>';
                });
        }
    }
}


initPlayerState();

// Save state before page unload
window.addEventListener('beforeunload', () => {
    localStorage.setItem('currentTrack', JSON.stringify({
        index: playlist.currentTrackIndex,
        currentTime: player.audio.currentTime,
        isPlaying: player.isPlaying
    }));
});


// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');
    
    // Toggle sidebar
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
    
    // Close sidebar when a nav link is clicked for mobile
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('active');
            }
        });
    });
    
    // Close sidebar when window is resized to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            sidebar.classList.remove('active');
        }
    });
});