export class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.setupTimeUpdateListener();
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