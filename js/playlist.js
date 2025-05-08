export class Playlist {
    constructor() {
        this.tracks = [];
        this.currentTrackIndex = 0;
        this.shuffle = false;
        this.repeat = false;
        this.originalOrder = []; // For shuffle functionality
    }

    addTrack(track) {
        if (!track.id) {
            track.id = Date.now();
        }
        this.tracks.push(track);
    }


 getCurrentTrack() {
        return this.tracks[this.currentTrackIndex];
    }

    nextTrack() {
        if (this.tracks.length === 0) return null;

        if (this.repeat && this.currentTrackIndex === this.tracks.length - 1) {
            this.currentTrackIndex = 0;
        } else if (this.currentTrackIndex < this.tracks.length - 1) {
            this.currentTrackIndex++;
        } else {
            return null; // End of playlist
        }

        return this.getCurrentTrack();
    }

    previousTrack() {
        if (this.tracks.length === 0) return null;

        if (this.currentTrackIndex > 0) {
            this.currentTrackIndex--;
            return this.getCurrentTrack();
        }
        return null;
    }

    shuffleTracks() {
        if (this.tracks.length === 0) return;

        // Save original order if first shuffle
        if (this.originalOrder.length === 0) {
            this.originalOrder = [...this.tracks];
        }

        // Fisher-Yates shuffle algorithm
        for (let i = this.tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
        }

        // Update current track index after shuffle
        const currentTrackId = this.getCurrentTrack()?.id;
        if (currentTrackId) {
            this.currentTrackIndex = this.tracks.findIndex(t => t.id === currentTrackId);
        }
    }

    resetShuffle() {
        if (this.originalOrder.length > 0) {
            const currentTrackId = this.getCurrentTrack()?.id;
            this.tracks = [...this.originalOrder];
            this.originalOrder = [];
            
            if (currentTrackId) {
                this.currentTrackIndex = this.tracks.findIndex(t => t.id === currentTrackId);
            }
        }
    }

    nextTrack() {
        if (this.shuffle && this.originalOrder.length === 0) {
            this.shuffleTracks();
        }
        
        if (this.repeat && this.currentTrackIndex === this.tracks.length - 1) {
            this.currentTrackIndex = 0;
        } else if (this.currentTrackIndex < this.tracks.length - 1) {
            this.currentTrackIndex++;
        } else {
            if (this.shuffle) {
                this.resetShuffle();
            }
            return null; // End of playlist
        }
        
        return this.getCurrentTrack();
    }

    previousTrack() {
        if (this.currentTrackIndex > 0) {
            this.currentTrackIndex--;
            return this.getCurrentTrack();
        }
        return null;
    }
}