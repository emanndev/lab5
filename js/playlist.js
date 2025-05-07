export class Playlist {
    constructor() {
        this.tracks = [];
        this.currentTrackIndex = 0;
    }

    addTrack(track) {
        this.tracks.push(track);
    }

    getCurrentTrack() {
        return this.tracks[this.currentTrackIndex];
    }

    nextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        return this.getCurrentTrack();
    }

    previousTrack() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        return this.getCurrentTrack();
    }
}