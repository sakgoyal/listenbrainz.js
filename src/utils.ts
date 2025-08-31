import { Listen } from './listen';
import { type APIListen, LISTEN_TYPE_IMPORT, LISTEN_TYPE_PLAYING_NOW, LISTEN_TYPES, type ListenType } from './types';

export function validateSubmitListensPayload(listen_type: ListenType, listens: Listen[]): void {
	if (!listens || listens.length === 0) {
		throw new Error("EmptyPayloadException: Can't submit empty list of listens");
	}

	if (!LISTEN_TYPES.includes(listen_type)) {
		throw new Error(`UnknownListenTypeException: Invalid listen type: ${listen_type}`);
	}

	if (listen_type !== LISTEN_TYPE_IMPORT && listens.length !== 1) {
		throw new Error(`TooManyListensException: Too many listens for listen type ${listen_type}: ${listens.length}`);
	}

	if (listen_type === LISTEN_TYPE_PLAYING_NOW && listens[0].listened_at !== undefined) {
		throw new Error('ListenedAtInPlayingNowException: There is a listened_at field in a listen meant to be sent as `playing_now`');
	}
}

export function convertApiPayloadToListen(data: APIListen): Listen {
	const track_metadata = data.track_metadata;
	const additional_info = track_metadata.additional_info ?? {};

	return new Listen({
		track_name: track_metadata.track_name,
		artist_name: track_metadata.artist_name,
		listened_at: data.listened_at,
		release_name: track_metadata.release_name,
		recording_mbid: additional_info.recording_mbid,
		artist_mbids: additional_info.artist_mbids ?? [],
		release_mbid: additional_info.release_mbid,
		tags: additional_info.tags ?? [],
		release_group_mbid: additional_info.release_group_mbid ?? [],
		work_mbids: additional_info.work_mbids ?? [],
		tracknumber: additional_info.tracknumber,
		spotify_id: additional_info.spotify_id,
		listening_from: additional_info.listening_from,
		isrc: additional_info.isrc,
		additional_info: additional_info,
		username: data.username,
		recording_msid: data.recording_msid,
	});
}
