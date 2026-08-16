export interface Song {
  id: string;
  song: string;
  artist: string;
  year: number | null;
  genre: string[];
  vibe: string[];
  energy: string | null;
  crowdAppeal: string | null;
  performanceStyle: string[];
  venueFit: string[];
  duration: string | null;
  status: string | null;
  attachments: Attachment[];
  playlistNames: string[];
}

export interface Attachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  thumbnails?: {
    small: { url: string; width: number; height: number };
    large: { url: string; width: number; height: number };
    full: { url: string; width: number; height: number };
  };
}

export interface Playlist {
  id: string;
  playlistName: string;
  description: string | null;
  createdDate: string | null;
  updatedDate: string | null;
  songCount: number;
}

export interface PlaylistSong {
  id: string;
  playlist: string[];
  song: string[];
  order: number | null;
}