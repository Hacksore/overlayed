import { getSelectedChannel, RPCCommand } from "./command";
import { fetch, Body } from '@tauri-apps/api/http';
import { RPCEvent, voiceChannelSelect } from "./event";
import * as uuid from "uuid";
import WebSocket from "tauri-plugin-websocket-api";
import { AppState, useAppStore as appStore } from "../store";

interface TokenResponse {
  access_token: string;
}

/**
 * Collection of events that are needed to sub to for voice states
 */
const SUBSCRIBABLE_EVENTS = [
  RPCEvent.SPEAKING_START,
  RPCEvent.SPEAKING_STOP,
  RPCEvent.VOICE_STATE_CREATE,
  RPCEvent.VOICE_STATE_DELETE,
  RPCEvent.VOICE_STATE_DELETE,
];

const STREAM_KIT_APP_ID = "207646673902501888";
const WEBSOCKET_URL = "ws://127.0.0.1:6463";

interface DiscordPayload {
  cmd: `${RPCCommand}`;
  args?: any;
  evt?: `${RPCEvent}`;
  nonce?: string;
}

/**
 * A generic manager the socket
 */
class SocketManager {
  public socket: WebSocket | null = null;
  public currentChannelId = null;
  public store: AppState | null = null;
  /**
   * Setup the tauri IPC socket
   */
  async init() {
    this.store = appStore.getState();

    const connectionUrl = `${WEBSOCKET_URL}/?v=1&client_id=${STREAM_KIT_APP_ID}`;
    this.socket = await WebSocket.connect(connectionUrl, {
      headers: {
        // we need to set the origin header to the discord streamkit domain
        origin: "https://streamkit.discord.com",
      },
    });

    this.socket.addListener(this.onMessage.bind(this));

    this.send(voiceChannelSelect());
    this.send(getSelectedChannel());
  }

  /**
   * Message listener when we get message from discord
   * @param payload a JSON object of the parsed message
   */
  private async onMessage(event: any) {
    const payload: any = JSON.parse(event.data);
    console.log("debug", payload);

    if (payload.evt === RPCEvent.READY) {
      this.send({
        args: {
          client_id: STREAM_KIT_APP_ID,
          scopes: ["rpc"],
        },
        cmd: "AUTHORIZE",
      });
      console.log(appStore.getState());
    }

    if (payload.cmd === RPCCommand.AUTHORIZE) {
      const { code } = payload.data;
      const res = await fetch<TokenResponse>(
        "https://streamkit.discord.com/overlay/token",
        {
          method: "POST",
          body: Body.json({ code }),
        },
      );

      console.log("got token", res.data.access_token);

      this.store?.setAccessToken(res.data.access_token);
    }

    if (payload.cmd === RPCCommand.GET_SELECTED_VOICE_CHANNEL) {
      // console.log(payload);

      // sub to channels events - do we always want to do this????
      this.channelEvents(RPCCommand.SUBSCRIBE, payload.data.id);
    }

    if (
      payload.evt === RPCEvent.SPEAKING_START ||
      payload.evt === RPCEvent.SPEAKING_STOP
    ) {
      // update the store
    }

    if (payload.evt === RPCEvent.VOICE_STATE_DELETE) {
      // remove user from store
    }

    if (payload.evt === RPCEvent.VOICE_CHANNEL_SELECT) {
      // update the store
      this.store?.setCurrentChannel(payload.data.channel_id);
    }
  }

  private send(payload: DiscordPayload) {
    this.socket?.send(
      JSON.stringify({
        ...payload,
        nonce: uuid.v4(),
      }),
    );
  }

  /**
   * These method will allow you to sub/unsub to channel events
   * that are defined in SUBSCRIBABLE_EVENTS
   * @param cmd {RPCCommand} SUBSCRIBE or SUBSCRIBE
   * @param channelId The channel to subscribe to events in
   */
  channelEvents(
    cmd: RPCCommand.SUBSCRIBE | RPCCommand.UNSUBSCRIBE,
    channelId: String,
  ) {
    SUBSCRIBABLE_EVENTS.map((eventName) =>
      this.send({
        cmd,
        args: { channel_id: channelId },
        evt: eventName,
        nonce: uuid.v4(),
      }),
    );
  }
}

export default new SocketManager();
