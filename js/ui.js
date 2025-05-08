export class PlayerUI {
    constructor(player, playlist) {
        this.player = player;
        this.playlist = playlist;
        this.isShuffled = false;
        this.isRepeatOn = false;
        this.originalPlaylistOrder = [...playlist.tracks]; 
        this.shuffledOrder = [];
        
        // Main player controls
        this.playBtn = document.querySelector('.player-controls-bar .play-btn');
        this.prevBtn = document.querySelector('.player-controls-bar .prev-btn');
        this.nextBtn = document.querySelector('.player-controls-bar .next-btn');
        this.progressBar = document.querySelector('.player-controls-bar .progress-bar');
        this.volumeSlider = document.querySelector('.player-controls-bar .volume-slider');
        this.shuffleBtn = document.querySelector('.player-controls-bar .shuffle-btn');
        this.repeatBtn = document.querySelector('.player-controls-bar .repeat-btn');
        
        // Time displays
        this.currentTimeDisplay = document.querySelector('.player-controls-bar .current-time');
        this.durationDisplay = document.querySelector('.player-controls-bar .duration');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        this.progressBar.addEventListener('input', (e) => this.seekTrack(e.target.value));
        this.volumeSlider.addEventListener('input', (e) => this.player.setVolume(e.target.value));
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());

        this.player.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.player.audio.addEventListener('ended', () => this.handleTrackEnd());
    }

    togglePlay() {
        if (this.player.isPlaying) {
            this.player.pause();
            this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            this.player.play(this.playlist.getCurrentTrack())
                .then(() => {
                    this.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                });
        }
    }

    setupPlaybackStateListener() {
        this.player.audio.addEventListener('play', () => {
            this.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            this.player.isPlaying = true;
            this.savePlaybackState();
        });

        this.player.audio.addEventListener('pause', () => {
            this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.player.isPlaying = false;
            this.savePlaybackState();
        });

        this.player.audio.addEventListener('ended', () => {
            this.playNext();
        });
    }

    savePlaybackState() {
        const state = {
            index: this.playlist.currentTrackIndex,
            currentTime: this.player.audio.currentTime,
            isPlaying: this.player.isPlaying
        };
        localStorage.setItem('currentPlayback', JSON.stringify(state));
    }
    
    playNext() {
        let nextIndex;
        
        if (this.isShuffled) {
            const currentPosition = this.getCurrentShuffledIndex();
            nextIndex = this.shuffledOrder[(currentPosition + 1) % this.shuffledOrder.length];
        } else {
            nextIndex = (this.playlist.currentTrackIndex + 1) % this.playlist.tracks.length;
        }
        
        this.playlist.currentTrackIndex = nextIndex;
        this.player.play(this.playlist.getCurrentTrack());
        this.updatePlayerInfo();
    }

    playPrevious() {
        let prevIndex;
        
        if (this.isShuffled) {
            const currentPosition = this.getCurrentShuffledIndex();
            prevIndex = this.shuffledOrder[
                (currentPosition - 1 + this.shuffledOrder.length) % this.shuffledOrder.length
            ];
        } else {
            prevIndex = (this.playlist.currentTrackIndex - 1 + this.playlist.tracks.length) % 
                        this.playlist.tracks.length;
        }
        
        this.playlist.currentTrackIndex = prevIndex;
        this.player.play(this.playlist.getCurrentTrack());
        this.updatePlayerInfo();
    }

    seekTrack(percent) {
        const time = (percent / 100) * this.player.audio.duration;
        this.player.seek(time);
    }

    updateProgress() {
        const { currentTime, duration } = this.player.audio;
        const progressPercent = (currentTime / duration) * 100;
        this.progressBar.value = progressPercent;
        this.currentTimeDisplay.textContent = this.formatTime(currentTime);
        this.durationDisplay.textContent = this.formatTime(duration);
    }

    updatePlayerInfo() {
        const track = this.playlist.getCurrentTrack();
        const playerBar = document.querySelector('.player-controls-bar');
        
        playerBar.querySelector('.mini-cover').src = track.cover || 'assets/default-cover.jpg';
        playerBar.querySelector('.track-title').textContent = track.title;
        playerBar.querySelector('.track-artist').textContent = track.artist;
        
        // Show player bar when a track is selected
        playerBar.classList.remove('hidden');
    }

    updatePlayButton() {
        const icon = this.player.isPlaying ? 'pause' : 'play';
        this.playBtn.innerHTML = `<i class="fas fa-${icon}"></i>`;
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        this.shuffleBtn.classList.toggle('active');
        
        if (this.isShuffled) {
            if (this.shuffledOrder.length === 0) {
                this.createShuffledOrder();
            }
            this.playlist.currentTrackIndex = this.getCurrentShuffledIndex();
        } else {
            const currentTrack = this.playlist.getCurrentTrack();
            this.playlist.currentTrackIndex = this.originalPlaylistOrder.findIndex(
                track => track.url === currentTrack.url
            );
        }
    }

    createShuffledOrder() {
        // shuffling the original order of the playlist by creating an array of indices
        this.shuffledOrder = [...Array(this.playlist.tracks.length).keys()];
        
        // Fisher-Yates shuffle algorithm
        for (let i = this.shuffledOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffledOrder[i], this.shuffledOrder[j]] = [this.shuffledOrder[j], this.shuffledOrder[i]];
        }
        const currentIndex = this.shuffledOrder.indexOf(this.playlist.currentTrackIndex);
        if (currentIndex > 0) {
            [this.shuffledOrder[0], this.shuffledOrder[currentIndex]] = 
            [this.shuffledOrder[currentIndex], this.shuffledOrder[0]];
        }
    }

    getCurrentShuffledIndex() {
        if (!this.isShuffled) return this.playlist.currentTrackIndex;
        const currentPosition = this.shuffledOrder.indexOf(this.playlist.currentTrackIndex);
        return currentPosition >= 0 ? currentPosition : 0;
    }


    toggleRepeat() {
        this.isRepeatOn = !this.isRepeatOn;
        this.repeatBtn.classList.toggle('active');
        this.player.audio.loop = this.isRepeatOn;
    }

    handleTrackEnd() {
        if (this.repeatBtn.classList.contains('active')) {
            this.player.audio.currentTime = 0;
            this.player.audio.play();
        } else {
            this.playNext();
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}