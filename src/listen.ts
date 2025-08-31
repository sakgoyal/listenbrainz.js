import type { AdditionalInfo, ListenConstructorArgs, SubmitPayloadItem, TrackMetadata } from './types';

export class Listen {
	track_name: string;
	artist_name: string;
	listened_at?: number;
	release_name?: string;
	recording_mbid?: string;
	artist_mbids: string[];
	release_mbid?: string;
	tags: string[];
	release_group_mbid: string[];
	work_mbids: string[];
	tracknumber?: number;
	spotify_id?: string;
	listening_from?: string;
	isrc?: string;
	additional_info: Record<string, any>;
	username?: string;
	recording_msid?: string;

	constructor(args: ListenConstructorArgs) {
		this.track_name = args.track_name;
		this.artist_name = args.artist_name;
		this.listened_at = args.listened_at;
		this.release_name = args.release_name;
		this.recording_mbid = args.recording_mbid;
		this.artist_mbids = args.artist_mbids ?? [];
		this.release_mbid = args.release_mbid;
		this.tags = args.tags ?? [];
		this.release_group_mbid = args.release_group_mbid ?? [];
		this.work_mbids = args.work_mbids ?? [];
		this.tracknumber = args.tracknumber;
		this.spotify_id = args.spotify_id;
		this.listening_from = args.listening_from;
		this.isrc = args.isrc;
		this.additional_info = args.additional_info ?? {};
		this.username = args.username;
		this.recording_msid = args.recording_msid;
	}

	toSubmitPayload(): SubmitPayloadItem {
		const additional_info: AdditionalInfo = { ...this.additional_info };
		if (this.recording_mbid) {
			additional_info.recording_mbid = this.recording_mbid;
		}
		if (this.artist_mbids.length > 0) {
			additional_info.artist_mbids = this.artist_mbids;
		}
		if (this.release_mbid) {
			additional_info.release_mbid = this.release_mbid;
		}
		if (this.tags.length > 0) {
			additional_info.tags = this.tags;
		}
		if (this.release_group_mbid.length > 0) {
			additional_info.release_group_mbid = this.release_group_mbid;
		}
		if (this.work_mbids.length > 0) {
			additional_info.work_mbids = this.work_mbids;
		}
		if (this.tracknumber !== undefined) {
			additional_info.tracknumber = this.tracknumber;
		}
		if (this.spotify_id) {
			additional_info.spotify_id = this.spotify_id;
		}
		if (this.listening_from) {
			additional_info.listening_from = this.listening_from;
		}
		if (this.isrc) {
			additional_info.isrc = this.isrc;
		}

		const track_metadata: TrackMetadata = {
			track_name: this.track_name,
			artist_name: this.artist_name,
		};
		if (this.release_name) {
			track_metadata.release_name = this.release_name;
		}
		if (Object.keys(additional_info).length > 0) {
			track_metadata.additional_info = additional_info;
		}

		const payload: SubmitPayloadItem = {
			track_metadata: track_metadata,
		};
		if (this.listened_at !== undefined) {
			payload.listened_at = this.listened_at;
		}
		return payload;
	}
}
