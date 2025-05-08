export class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.currentTrack = null;
        this.playlist = null;
        this.updateProgressBar = this.updateProgressBar.bind(this);
        this.handlePlayError = this.handlePlayError.bind(this);

        // Setup event listeners
        this.audio.addEventListener('timeupdate', this.updateProgressBar);
        this.audio.addEventListener('error', this.handlePlayError);
        this.audio.addEventListener('play', () => {
            const playerBar = document.querySelector('.player-controls-bar');
            if (playerBar) {
                playerBar.classList.remove('hidden');
                playerBar.style.display = 'flex';
            }
        });

        this.setupTimeUpdateListener();
        this.setupOverlayPlayer();
    }

    setPlaylist(playlist) {
        this.playlist = playlist;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    updateProgressBar() {
        if (!this.audio.duration) return;

        const progressPercent = (this.audio.currentTime / this.audio.duration) * 100;
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.value = progressPercent;
        }
        const currentTimeDisplay = document.querySelector('.current-time');
        const durationDisplay = document.querySelector('.duration');
        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = this.formatTime(this.audio.currentTime);
        }
        if (durationDisplay) {
            durationDisplay.textContent = this.formatTime(this.audio.duration);
        }
    }

    handlePlayError(error) {
        console.error('Playback error:', error);
        this.isPlaying = false;
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
        if (!this.audio.duration) return;

        const progressPercent = (this.audio.currentTime / this.audio.duration) * 100;

        if (this.progressBar) {
            this.progressBar.value = progressPercent;
        }

        if (this.currentTimeDisplay) {
            this.currentTimeDisplay.textContent = this.formatTime(this.audio.currentTime);
        }

        this.updateWaveProgress(progressPercent);
    }

    updateWaveProgress(progress) {
        const waveProgress = document.querySelector('.wave-progress');
        if (waveProgress) {
            waveProgress.style.transform = `translateX(-${100 - progress}%) translateY(50%)`;
        }
    }

    setupOverlayPlayer() {
        const playerBar = document.querySelector('.player-controls-bar');
        const overlay = document.querySelector('.player-overlay');
        const overlayAlbumArt = document.querySelector('.overlay-album-art');
        const overlayTrackTitle = document.querySelector('.overlay-track-title');
        const overlayTrackArtist = document.querySelector('.overlay-track-artist');
        const albumArtContainer = document.querySelector('.album-art-container');

        // Update overlay when track changes
        const updateOverlayInfo = () => {
            if (this.currentTrack) {
                overlayAlbumArt.src = this.currentTrack.cover || 'assets/default-cover.jpg';
                overlayTrackTitle.textContent = this.currentTrack.title;
                overlayTrackArtist.textContent = this.currentTrack.artist;

                if (this.isPlaying) {
                    albumArtContainer.classList.add('playing');
                } else {
                    albumArtContainer.classList.remove('playing');
                }
            }
        };

        const updateControlStates = () => {
            const shuffleBtn = document.querySelector('.shuffle-btn');
            const repeatBtn = document.querySelector('.repeat-btn');

            if (shuffleBtn) {
                shuffleBtn.classList.toggle('active', this.playlist?.shuffle || false);
            }
            if (repeatBtn) {
                repeatBtn.classList.toggle('active', this.playlist?.repeat || false);
            }
        };
        updateControlStates();
        this.audio.addEventListener('play', updateControlStates);

        playerBar.addEventListener('click', (e) => {
            if (e.target.closest('.player-info, .mini-cover')) {
                updateOverlayInfo();
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
        this.audio.addEventListener('play', updateOverlayInfo);

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
        this.currentTrack = track;
        this.audio.src = track.url;

        this.updatePlayerUI(track);

        return this.audio.play()
            .then(() => {
                this.isPlaying = true;
                this.saveState();
                return true;
            })
            .catch(error => {
                console.error("Playback failed:", error);
                this.isPlaying = false;
                return false;
            });
    }

    updatePlayerUI(track) {
        const playerBar = document.querySelector('.player-controls-bar');
        if (playerBar && track) {
            const cover = playerBar.querySelector('.mini-cover');
            const title = playerBar.querySelector('.track-title');
            const artist = playerBar.querySelector('.track-artist');

            if (cover) cover.src = track.cover || 'assets/default-cover.jpg';
            if (title) title.textContent = track.title;
            if (artist) artist.textContent = track.artist;
        }
    }

    playNext() {
        if (!this.playlist) {
            console.error('No playlist available');
            return;
        }

        const nextTrack = this.playlist.nextTrack();
        if (nextTrack) {
            this.play(nextTrack);
        } else {
            this.pause();
            this.audio.currentTime = 0;
            if (this.playlist.repeat) {
                this.playlist.currentTrackIndex = -1; 
                this.playNext(); 
            }
        }
    }

    playPrevious() {
        if (!this.playlist) {
            console.error('No playlist available');
            return;
        }

        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            if (this.currentTrack) {
                this.updatePlayerUI(this.currentTrack);
            }
            return;
        }

        const prevTrack = this.playlist.previousTrack();
        if (prevTrack) {
            this.play(prevTrack);
        }
    }

    toggleShuffle() {
        if (!this.playlist) return;

        this.playlist.shuffle = !this.playlist.shuffle;
        const shuffleBtn = document.querySelector('.shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.classList.toggle('active', this.playlist.shuffle);
        }

        // Handle shuffle logic
        if (this.playlist.shuffle) {
            this.playlist.shuffleTracks();
        } else {
            this.playlist.resetShuffle();
        }
    }

    toggleRepeat() {
        if (!this.playlist) return;

        this.playlist.repeat = !this.playlist.repeat;
        const repeatBtn = document.querySelector('.repeat-btn');
        if (repeatBtn) {
            repeatBtn.classList.toggle('active', this.playlist.repeat);
        }
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