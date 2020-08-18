export interface StreamData {
  _id: number;
  average_fps: number;
  channel: Channel;
  created_at: string;
  delay: number;
  game: string;
  is_playlist: boolean;
  preview: Preview;
  video_height: number;
  viewers: number;
}
export interface Channel {
  _id: number;
  broadcaster_language: string;
  created_at: string;
  display_name: string;
  followers: number;
  game: string;
  language: string;
  logo: string;
  mature: boolean;
  name: string;
  partner: boolean;
  profile_banner: string;
  profile_banner_background_color?: null;
  status: string;
  updated_at: string;
  url: string;
  video_banner: string;
  views: number;
}
export interface Preview {
  large: string;
  medium: string;
  small: string;
  template: string;
}

export interface V5StreamersPayload {
  _total: number;
  streams?: StreamData[];
}

export interface TopGames {
  _total: number;
  top?: TopEntity[] | null;
}
interface TopEntity {
  channels: number;
  viewers: number;
  game: Game;
}
interface Game {
  _id: number;
  box: BoxOrLogo;
  giantbomb_id: number;
  logo: BoxOrLogo;
  name: string;
  popularity: number;
}
interface BoxOrLogo {
  large: string;
  medium: string;
  small: string;
  template: string;
}

export interface V5StreamsConfig {
  [key: string]: any;
  channel?: string;
  game?: string;
  language?: string;
  stream_type?: string;
  limit?: number;
  offset?: number;
}
export interface V5TopGames {
  limit?: number;
  offset?: number;
}
