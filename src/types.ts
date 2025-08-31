export const LISTEN_TYPE_SINGLE = 'single';
export const LISTEN_TYPE_IMPORT = 'import';
export const LISTEN_TYPE_PLAYING_NOW = 'playing_now';

export const LISTEN_TYPES = [
	LISTEN_TYPE_SINGLE,
	LISTEN_TYPE_IMPORT,
	LISTEN_TYPE_PLAYING_NOW,
] as const;

export type ListenType = typeof LISTEN_TYPES[number];

export const STATS_SUPPORTED_TIME_RANGES = [
	'week',
	'month',
	'quarter',
	'half_yearly',
	'year',
	'all_time',
	'this_week',
	'this_month',
	'this_year',
] as const;

export type StatsTimeRange = typeof STATS_SUPPORTED_TIME_RANGES[number];

export interface ListenConstructorArgs {
	track_name: string;
	artist_name: string;
	listened_at?: number;
	release_name?: string;
	recording_mbid?: string;
	artist_mbids?: string[];
	release_mbid?: string;
	tags?: string[];
	release_group_mbid?: string[];
	work_mbids?: string[];
	tracknumber?: number;
	spotify_id?: string;
	listening_from?: string;
	isrc?: string;
	additional_info?: Record<string, any>;
	username?: string;
	recording_msid?: string;
}

export interface AdditionalInfo {
	recording_mbid?: string;
	artist_mbids?: string[];
	release_mbid?: string;
	tags?: string[];
	release_group_mbid?: string[];
	work_mbids?: string[];
	tracknumber?: number;
	spotify_id?: string;
	listening_from?: string;
	isrc?: string;
	[key: string]: any;
}

export interface TrackMetadata {
	track_name: string;
	artist_name: string;
	release_name?: string;
	additional_info?: AdditionalInfo;
}

export interface SubmitPayloadItem {
	listened_at?: number;
	track_metadata: TrackMetadata;
}

export interface APIListen {
	listened_at?: number;
	recording_msid?: string;
	track_metadata: TrackMetadata;
	username?: string;
}

export interface GetListensResponse {
	payload: {
		count: number;
		latest_listen_ts: number;
		listens: APIListen[];
		user_id: string;
	};
}

export interface PlayingNowResponse {
	payload: {
		count: number;
		listens: APIListen[];
		user_id: string;
	};
}

export interface ValidateTokenResponse {
	valid: boolean;
	message?: string;
	user_name?: string;
}

export interface SubmitListenResponse {
	status: 'ok' | 'error';
	error?: string;
}

export interface ListenCountResponse {
	payload: {
		count: number;
	};
}
