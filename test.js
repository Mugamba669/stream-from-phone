import * as mm from 'music-metadata-browser';

async function fetchSongs() {
    try {
        // Initial fetch of file listing
        const response = await fetch(
            "http://" + this.serverAddress + ":8080?path=" + this.pathURL
        );
        const data = await response.json();
        this.items = data.items;

        // Filter MP3 files and directories
        const mp3Files = data.items.filter(
            item => item.type === "file" && item.extension === ".mp3"
        );
        this.folders = data.items.filter(
            item => item.type === "directory"
        );

        // Fetch metadata for each MP3 file
        this.playlist = await Promise.all(mp3Files.map(async (file) => {
            try {
                // Fetch the actual file content
                const audioResponse = await fetch(
                    `http://${this.serverAddress}:8080/file?path=${encodeURIComponent(file.path)}`
                );

                if (!audioResponse.ok) {
                    throw new Error(`HTTP error! status: ${audioResponse.status}`);
                }

                const blob = await audioResponse.blob();
                const metadata = await mm.parseBlob(blob);

                // Extract common metadata with fallbacks
                const {
                    title = file.name.replace('.mp3', ''),
                    artist = 'Unknown Artist',
                    album = 'Unknown Album',
                    year = '',
                    genre = [],
                    picture = []
                } = metadata.common;

                // Create artwork URL if available
                let artworkUrl = null;
                if (picture && picture[0]) {
                    const { data, format } = picture[0];
                    const artworkBlob = new Blob([data], { type: format });
                    artworkUrl = URL.createObjectURL(artworkBlob);
                }

                // Return enhanced file object with metadata
                return {
                    ...file,
                    metadata: {
                        title,
                        artist: Array.isArray(artist) ? artist.join(', ') : artist,
                        album: Array.isArray(album) ? album.join(', ') : album,
                        year,
                        genre: Array.isArray(genre) ? genre.join(', ') : genre,
                        artworkUrl,
                        duration: metadata.format.duration,
                        bitrate: metadata.format.bitrate,
                        sampleRate: metadata.format.sampleRate
                    }
                };
            } catch (error) {
                console.error(`Error fetching metadata for ${file.name}:`, error);
                // Return file object with basic metadata if parsing fails
                return {
                    ...file,
                    metadata: {
                        title: file.name.replace('.mp3', ''),
                        artist: 'Unknown Artist',
                        album: 'Unknown Album',
                        year: '',
                        genre: '',
                        artworkUrl: null,
                        duration: 0,
                        bitrate: 0,
                        sampleRate: 0
                    }
                };
            }
        }));

    } catch (error) {
        console.error("Error fetching songs:", error);
        this.items = [];
        this.playlist = [];
        this.folders = [];
    }

    // Clean up artwork URLs when component is destroyed
    this.$once('hook:beforeDestroy', () => {
        this.playlist.forEach(song => {
            if (song.metadata?.artworkUrl) {
                URL.revokeObjectURL(song.metadata.artworkUrl);
            }
        });
    });
}