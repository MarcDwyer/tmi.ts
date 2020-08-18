import { V5StreamersPayload } from "./twitch_api_types.ts";

export class TwitchAPI {
  constructor(private client_id: string, private oauth: string) {
  }
  async getFollowers(): Promise<V5StreamersPayload> {
    const follows: V5StreamersPayload = await this.fetchV5TwitchData(
      `https://api.twitch.tv/kraken/streams/followed`,
    );
    return follows;
  }
  async fetchV5TwitchData(url: string): Promise<any> {
    const { client_id, oauth } = this;
    const token = "OAuth " + oauth;
    try {
      const fetchThis = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/vnd.twitchtv.v5+json",
          "Client-ID": client_id,
          Authorization: token,
        },
      });
      const data = await fetchThis.json();
      return data;
    } catch (err) {
      console.log(`Error: ${err}`);
      return null;
    }
  }
}
