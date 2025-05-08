export class PlaylistManagement {
    constructor(playlist) {
        this.playlist = playlist;
        this.userPlaylists = JSON.parse(localStorage.getItem('userPlaylists')) || [];
        this.currentPlaylistId = null;
    }

    createNewPlaylist(name, songs = []) {
        const newPlaylist = {
            id: Date.now(),
            name,
            songs,
            image: this.getRandomPlaylistCover()
        };
        this.userPlaylists.push(newPlaylist);
        this.savePlaylists();
        return newPlaylist;
    }

    addSongsToPlaylist(playlistId, songIds) {
        const playlist = this.userPlaylists.find(p => p.id === playlistId);
        if (playlist) {
            songIds.forEach(songId => {
                if (!playlist.songs.includes(songId)) {
                    playlist.songs.push(songId);
                }
            });
            this.savePlaylists();
            return true;
        }
        return false;
    }

    removeSongsFromPlaylist(playlistId, songIds) {
        const playlist = this.userPlaylists.find(p => p.id === playlistId);
        if (playlist) {
            playlist.songs = playlist.songs.filter(id => !songIds.includes(id));
            this.savePlaylists();
            return true;
        }
        return false;
    }

    editPlaylistName(playlistId, newName) {
        const playlist = this.userPlaylists.find(p => p.id === playlistId);
        if (playlist) {
            playlist.name = newName;
            this.savePlaylists();
            return true;
        }
        return false;
    }

    deletePlaylist(playlistId) {
        this.userPlaylists = this.userPlaylists.filter(p => p.id !== playlistId);
        this.savePlaylists();
    }

    getPlaylistTracks(playlistId) {
        const playlist = this.userPlaylists.find(p => p.id === playlistId);
        if (!playlist) return [];
        
        return playlist.songs
            .map(songId => this.playlist.tracks.find(t => t.id === songId))
            .filter(Boolean);
    }

    savePlaylists() {
        localStorage.setItem('userPlaylists', JSON.stringify(this.userPlaylists));
    }

    getRandomPlaylistCover() {
        const covers = [
            'assets/covers/playlist1.jpg',
            'assets/covers/playlist2.jpg',
            'assets/covers/playlist3.jpg'
        ];
        return covers[Math.floor(Math.random() * covers.length)];
    }
}