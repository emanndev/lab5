const { TextEncoder, TextDecoder } = require('text-encoding');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { AudioPlayer } = require('../js/player');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Mock HTML structure for DOM interactions
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
    <div class="player-controls-bar">
        <button class="play-btn"><i class="fas fa-play"></i></button>
        <button class="prev-btn"></button>
        <button class="next-btn"></button>
        <input type="range" class="progress-bar" min="0" max="100" value="0">
        <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="0.7">
        <button class="shuffle-btn"></button>
        <button class="repeat-btn"></button>
        <span class="current-time">0:00</span>
        <span class="duration">0:00</span>
        <img class="mini-cover" src="">
        <h4 class="track-title"></h4>
        <p class="track-artist"></p>
        <div class="player-info"></div>
    </div>
    <div class="player-overlay">
        <img class="overlay-album-art" src="">
        <h3 class="overlay-track-title"></h3>
        <p class="overlay-track-artist"></p>
        <div class="wave-progress"></div>
        <div class="album-art-container"></div>
        <button class="overlay-control-btn play-btn"><i class="fas fa-play"></i></button>
        <button class="overlay-control-btn prev-btn"></button>
        <button class="overlay-control-btn next-btn"></button>
        <button class="overlay-control-btn shuffle-btn"></button>
        <button class="overlay-control-btn repeat-btn"></button>
    </div>
</body>
</html>
`, { url: 'http://localhost' });

global.document = dom.window.document;
global.window = dom.window;

// Mock Event for dispatching
const Event = dom.window.Event;

// Mock Audio API
const mockAudio = {
    play: jest.fn(),
    pause: jest.fn(),
    currentTime: 0,
    duration: 180,
    volume: 0.7,
    src: '',
    loop: false,
    paused: true,
    addEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
};
global.Audio = jest.fn(() => mockAudio);

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock Playlist class
class MockPlaylist {
    constructor() {
        this.tracks = [];
        this.currentTrackIndex = -1;
        this.shuffle = false;
        this.repeat = false;
    }
    addTrack(track) {
        this.tracks.push(track);
    }
    nextTrack() {
        if (this.currentTrackIndex < this.tracks.length - 1) {
            this.currentTrackIndex++;
            return this.tracks[this.currentTrackIndex];
        }
        if (this.repeat) {
            this.currentTrackIndex = 0;
            return this.tracks[0];
        }
        return null;
    }
    previousTrack() {
        if (this.currentTrackIndex > 0) {
            this.currentTrackIndex--;
            return this.tracks[this.currentTrackIndex];
        }
        return null;
    }
    shuffleTracks() {}
    resetShuffle() {}
}

// Mock tracks
const mockTracks = [
    { id: 1, title: 'Song 1', artist: 'Artist 1', url: 'song1.mp3', cover: 'cover1.jpg', duration: 180 },
    { id: 2, title: 'Song 2', artist: 'Artist 2', url: 'song2.mp3', cover: 'cover2.jpg', duration: 200 },
];

describe('Music Player UI Tests', () => {
    let player, playlist;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        document.body.innerHTML = dom.window.document.body.innerHTML;
        localStorageMock.getItem.mockReset();
        localStorageMock.setItem.mockReset();

        // Initialize classes
        playlist = new MockPlaylist();
        mockTracks.forEach(track => playlist.addTrack(track));
        player = new AudioPlayer();
        player.setPlaylist(playlist);

        // Store event listeners
        const eventListeners = {};
        mockAudio.addEventListener.mockImplementation((event, callback) => {
            eventListeners[event] = eventListeners[event] || [];
            eventListeners[event].push(callback);
        });

        // Simulate play/pause events
        mockAudio.play.mockImplementation(() => {
            mockAudio.paused = false;
            if (eventListeners['play']) {
                eventListeners['play'].forEach(callback => callback());
                mockAudio.dispatchEvent(new Event('play'));
            }
            return Promise.resolve();
        });
        mockAudio.pause.mockImplementation(() => {
            mockAudio.paused = true;
            if (eventListeners['pause']) {
                eventListeners['pause'].forEach(callback => callback());
                mockAudio.dispatchEvent(new Event('pause'));
            }
        });
    });

    describe('Play/Pause UI Updates', () => {
        test('should update play button to pause icon when playing', async () => {
            player.isPlaying = false;
            mockAudio.paused = true;

            await player.togglePlay();

            expect(mockAudio.play).toHaveBeenCalled();
            expect(player.isPlaying).toBe(true);
            expect(document.querySelector('.play-btn').innerHTML).toBe('<i class="fas fa-pause"></i>');
            expect(document.querySelector('.overlay-control-btn.play-btn').innerHTML).toBe('<i class="fas fa-pause"></i>');
        });

        test('should update play button to play icon when paused', async () => {
            player.isPlaying = true;
            mockAudio.paused = false;

            await player.togglePlay();

            expect(mockAudio.pause).toHaveBeenCalled();
            expect(player.isPlaying).toBe(false);
            expect(document.querySelector('.play-btn').innerHTML).toBe('<i class="fas fa-play"></i>');
            expect(document.querySelector('.overlay-control-btn.play-btn').innerHTML).toBe('<i class="fas fa-play"></i>');
        });
    });

    describe('Progress Bar and Time UI Updates', () => {
        test('should update progress bar and time displays', () => {
            mockAudio.currentTime = 90;
            mockAudio.duration = 180;

            player.updateProgressBar();

            expect(parseFloat(document.querySelector('.progress-bar').value)).toBe(50);
            expect(document.querySelector('.current-time').textContent).toBe('1:30');
            expect(document.querySelector('.duration').textContent).toBe('3:00');
        });

        test('should handle zero duration', () => {
            mockAudio.duration = 0;
            mockAudio.currentTime = 0;

            player.updateProgressBar();

            expect(parseFloat(document.querySelector('.progress-bar').value)).toBe(0);
            expect(document.querySelector('.current-time').textContent).toBe('0:00');
            expect(document.querySelector('.duration').textContent).toBe('0:00');
        });
    });

    describe('Overlay Control States', () => {
        test('should update shuffle button state', () => {
            player.toggleShuffle();

            expect(playlist.shuffle).toBe(true);
            expect(document.querySelector('.shuffle-btn').classList.contains('active')).toBe(true);

            player.toggleShuffle();

            expect(playlist.shuffle).toBe(false);
            expect(document.querySelector('.shuffle-btn').classList.contains('active')).toBe(false);
        });

        test('should update repeat button state', () => {
            player.toggleRepeat();

            expect(playlist.repeat).toBe(true);
            expect(document.querySelector('.repeat-btn').classList.contains('active')).toBe(true);

            player.toggleRepeat();

            expect(playlist.repeat).toBe(false);
            expect(document.querySelector('.repeat-btn').classList.contains('active')).toBe(false);
        });
    });

    describe('Track Navigation UI Updates', () => {
        test('should update UI when navigating to next track', async () => {
            playlist.currentTrackIndex = 0;
            await player.playNext();

            expect(playlist.currentTrackIndex).toBe(1);
            expect(document.querySelector('.track-title').textContent).toBe('Song 2');
            expect(document.querySelector('.track-artist').textContent).toBe('Artist 2');
            expect(document.querySelector('.mini-cover').src).toMatch(/cover2\.jpg$/);
        });

        test('should update UI when navigating to previous track', async () => {
            playlist.currentTrackIndex = 1;
            await player.playPrevious();

            expect(playlist.currentTrackIndex).toBe(0);
            expect(document.querySelector('.track-title').textContent).toBe('Song 1');
            expect(document.querySelector('.track-artist').textContent).toBe('Artist 1');
            expect(document.querySelector('.mini-cover').src).toMatch(/cover1\.jpg$/);
        });

        test('should restart track UI if currentTime > 3 seconds', () => {
            mockAudio.currentTime = 5;
            playlist.currentTrackIndex = 1;
            player.currentTrack = mockTracks[1];

            player.playPrevious();

            expect(mockAudio.currentTime).toBe(0);
            expect(playlist.currentTrackIndex).toBe(1);
            expect(document.querySelector('.track-title').textContent).toBe('Song 2');
        });

        test('should update UI when looping to first track with repeat on', async () => {
            playlist.repeat = true;
            playlist.currentTrackIndex = 1;

            await player.playNext();

            expect(playlist.currentTrackIndex).toBe(0);
            expect(document.querySelector('.track-title').textContent).toBe('Song 1');
            expect(document.querySelector('.track-artist').textContent).toBe('Artist 1');
            expect(document.querySelector('.mini-cover').src).toMatch(/cover1\.jpg$/);
        });
    });
});