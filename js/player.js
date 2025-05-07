export class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.setupTimeUpdateListener();
        this.setupOverlayPlayer();
    }


    setupEventListeners() {
        this.audio.addEventListener('timeupdate', this.updateProgress.bind(this));
        this.audio.addEventListener('play', this.onPlay.bind(this));
        this.audio.addEventListener('pause', this.onPause.bind(this));
        this.audio.addEventListener('ended', this.onEnded.bind(this));
    }

    setupTimeUpdateListener() {
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgressBar();
            this.saveCurrentTime();
        });
    }
    updateProgress() {
        const progressPercent = (this.audio.currentTime / this.audio.duration) * 100;
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) progressBar.value = progressPercent;
        
        const currentTimeDisplay = document.querySelector('.current-time');
        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = this.formatTime(this.audio.currentTime);
        }
        
        this.saveState();
    }

     setupOverlayPlayer() {
        const playerBar = document.querySelector('.player-controls-bar');
        const overlay = document.querySelector('.player-overlay');
        const overlayAlbumArt = document.querySelector('.overlay-album-art');
        const overlayTrackTitle = document.querySelector('.overlay-track-title');
        const overlayTrackArtist = document.querySelector('.overlay-track-artist');
        const albumArtContainer = document.querySelector('.album-art-container');
        
        // Toggle overlay when player bar is clicked
        playerBar.addEventListener('click', (e) => {
            if (e.target.closest('.player-info, .mini-cover')) {
                overlay.classList.add('active');
            }
        });
        
        // Close overlay when clicked outside content
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
        
        // Update overlay when track changes
        this.audio.addEventListener('play', () => {
            const track = this.currentTrack;
            if (track) {
                overlayAlbumArt.src = track.cover || 'assets/default-cover.jpg';
                overlayTrackTitle.textContent = track.title;
                overlayTrackArtist.textContent = track.artist;
                
                if (this.isPlaying) {
                    albumArtContainer.classList.add('playing');
                } else {
                    albumArtContainer.classList.remove('playing');
                }
            }
        });
        
        // Sync play/pause with overlay
        this.audio.addEventListener('play', () => {
            document.querySelector('.overlay-control-btn.play-btn').innerHTML = '<i class="fas fa-pause"></i>';
            albumArtContainer.classList.add('playing');
        });
        
        this.audio.addEventListener('pause', () => {
            document.querySelector('.overlay-control-btn.play-btn').innerHTML = '<i class="fas fa-play"></i>';
            albumArtContainer.classList.remove('playing');
        });
        
        // Connect overlay controls
        document.querySelector('.overlay-control-btn.play-btn').addEventListener('click', () => this.togglePlay());
        document.querySelector('.overlay-control-btn.prev-btn').addEventListener('click', () => this.playPrevious());
        document.querySelector('.overlay-control-btn.next-btn').addEventListener('click', () => this.playNext());
        document.querySelector('.overlay-control-btn.shuffle-btn').addEventListener('click', () => this.toggleShuffle());
        document.querySelector('.overlay-control-btn.repeat-btn').addEventListener('click', () => this.toggleRepeat());
        
        // Update wave progress
        this.audio.addEventListener('timeupdate', () => {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            document.querySelector('.wave-progress').style.transform = `translateX(-${100 - progress}%) translateY(50%)`;
        });
    }

    onPlay() {
        this.isPlaying = true;
        document.querySelector('.play-btn').innerHTML = '<i class="fas fa-pause"></i>';
        this.saveState();
    }

    onPause() {
        this.isPlaying = false;
        document.querySelector('.play-btn').innerHTML = '<i class="fas fa-play"></i>';
        this.saveState();
    }

    onEnded() {
        this.isPlaying = false;
        this.saveState();
    }

    saveState() {
        const state = {
            src: this.audio.src,
            currentTime: this.audio.currentTime,
            isPlaying: this.isPlaying,
            volume: this.audio.volume
        };
        localStorage.setItem('audioPlayerState', JSON.stringify(state));
    }

    restoreState() {
        const savedState = JSON.parse(localStorage.getItem('audioPlayerState'));
        if (savedState) {
            this.audio.src = savedState.src;
            this.audio.currentTime = savedState.currentTime || 0;
            this.audio.volume = savedState.volume || 0.7;
            
            if (savedState.isPlaying) {
                this.audio.play().catch(e => console.log("Autoplay prevented:", e));
            }
            
            document.querySelector('.player-controls-bar').classList.remove('hidden');
            document.querySelector('.play-btn').innerHTML = 
                savedState.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        }
    }


    saveCurrentTime() {
        localStorage.setItem('currentTime', this.audio.currentTime);
    }
    play(track) {
        this.audio.src = track.url;
        return this.audio.play()
            .then(() => {
                this.isPlaying = true;
                this.saveState();
            })
            .catch(error => {
                console.error("Playback failed:", error);
                this.isPlaying = false;
            });
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.audio.play()
                .then(() => this.isPlaying = true);
        }
    }

    setVolume(volume) {
        this.audio.volume = volume;
    }

    seek(time) {
        this.audio.currentTime = time;
    }
   
}