/* eslint-disable */
// @ts-nocheck

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";
import type { Song, Playlist } from "./declarations/backend.did.d";

export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export class ExternalBlob {
    _blob?: Uint8Array<ArrayBuffer> | null;
    directURL: string;
    onProgress?: (percentage: number) => void = undefined;
    private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null){
        if (blob) {
            this._blob = blob;
        }
        this.directURL = directURL;
    }
    static fromURL(url: string): ExternalBlob {
        return new ExternalBlob(url, null);
    }
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
        const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }));
        return new ExternalBlob(url, blob);
    }
    public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
        if (this._blob) return this._blob;
        const response = await fetch(this.directURL);
        const blob = await response.blob();
        this._blob = new Uint8Array(await blob.arrayBuffer());
        return this._blob;
    }
    public getDirectURL(): string {
        return this.directURL;
    }
    public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
        this.onProgress = onProgress;
        return this;
    }
}

export interface backendInterface {
    addRecentlyPlayed(song: Song): Promise<void>;
    getRecentlyPlayed(): Promise<Song[]>;
    toggleFavorite(song: Song): Promise<boolean>;
    getFavorites(): Promise<Song[]>;
    isFavorite(songId: string): Promise<boolean>;
    createPlaylist(name: string): Promise<Playlist>;
    addSongToPlaylist(playlistId: string, song: Song): Promise<boolean>;
    removeSongFromPlaylist(playlistId: string, songId: string): Promise<boolean>;
    deletePlaylist(playlistId: string): Promise<boolean>;
    getPlaylists(): Promise<Playlist[]>;
}

export class Backend implements backendInterface {
    constructor(
        private actor: ActorSubclass<_SERVICE>,
        private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
        private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
        private processError?: (error: unknown) => never
    ){}

    async addRecentlyPlayed(song: Song): Promise<void> {
        return this.actor.addRecentlyPlayed(song);
    }
    async getRecentlyPlayed(): Promise<Song[]> {
        return this.actor.getRecentlyPlayed();
    }
    async toggleFavorite(song: Song): Promise<boolean> {
        return this.actor.toggleFavorite(song);
    }
    async getFavorites(): Promise<Song[]> {
        return this.actor.getFavorites();
    }
    async isFavorite(songId: string): Promise<boolean> {
        return this.actor.isFavorite(songId);
    }
    async createPlaylist(name: string): Promise<Playlist> {
        return this.actor.createPlaylist(name);
    }
    async addSongToPlaylist(playlistId: string, song: Song): Promise<boolean> {
        return this.actor.addSongToPlaylist(playlistId, song);
    }
    async removeSongFromPlaylist(playlistId: string, songId: string): Promise<boolean> {
        return this.actor.removeSongFromPlaylist(playlistId, songId);
    }
    async deletePlaylist(playlistId: string): Promise<boolean> {
        return this.actor.deletePlaylist(playlistId);
    }
    async getPlaylists(): Promise<Playlist[]> {
        return this.actor.getPlaylists();
    }
}

export interface CreateActorOptions {
    agent?: Agent;
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
    processError?: (error: unknown) => never;
}

export function createActor(
    canisterId: string,
    _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    options: CreateActorOptions = {}
): Backend {
    const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions });
    if (options.agent && options.agentOptions) {
        console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.");
    }
    const actor = Actor.createActor<_SERVICE>(idlFactory, {
        agent,
        canisterId: canisterId,
        ...options.actorOptions
    });
    return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
