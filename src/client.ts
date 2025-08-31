import { Listen } from './listen';
import { convertApiPayloadToListen, validateSubmitListensPayload } from './utils';
import { type GetListensResponse, LISTEN_TYPE_IMPORT, LISTEN_TYPE_PLAYING_NOW, LISTEN_TYPE_SINGLE, type ListenCountResponse, type ListenType, type PlayingNowResponse, STATS_SUPPORTED_TIME_RANGES, type StatsTimeRange, type SubmitListenResponse, type ValidateTokenResponse } from './types';

const API_BASE_URL = 'https://api.listenbrainz.org';
const RETRY_STATUS_CODES = [429, 500, 502, 503, 504];
const MAX_RETRIES = 5;

export class ListenBrainz {
	#auth_token: string | null = null;
	#last_request_ts: number | null = null;
	#remaining_requests: number | null = null;
	#ratelimit_reset_in: number | null = null;

	#require_auth_token(): void {
		if (!this.#auth_token) {
			throw Error('AuthTokenRequiredException: This endpoint requires an auth token.');
		}
	}

	async #wait_until_rate_limit(): Promise<void> {
		if (this.#last_request_ts === null) {
			return;
		}
		if (this.#remaining_requests && this.#remaining_requests > 0) {
			return;
		}
		if (this.#ratelimit_reset_in !== null) {
			const reset_ts = this.#last_request_ts + this.#ratelimit_reset_in;
			const current_ts = Math.floor(Date.now() / 1000);
			if (current_ts < reset_ts) {
				const waitTime = (reset_ts - current_ts) * 1000;
				await new Promise((resolve) => setTimeout(resolve, waitTime));
			}
		}
	}

	#update_rate_limit_variables(response: Response): void {
		this.#last_request_ts = Math.floor(Date.now() / 1000);
		const remaining = response.headers.get('X-RateLimit-Remaining');
		this.#remaining_requests = remaining ? parseInt(remaining, 10) : null;
		const resetIn = response.headers.get('X-RateLimit-Reset-In');
		this.#ratelimit_reset_in = resetIn ? parseInt(resetIn, 10) : null;
	}

	async #request<T>(
		endpoint: string,
		method: 'GET' | 'POST',
		params?: Record<string, any>,
		body?: any,
		headers?: Record<string, string>,
	): Promise<T> {
		const url = new URL(endpoint, API_BASE_URL);
		if (method === 'GET' && params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					url.searchParams.append(key, String(value));
				}
			});
		}

		const finalHeaders = { ...headers };
		if (this.#auth_token) {
			finalHeaders['Authorization'] = `Token ${this.#auth_token}`;
		}
		if (method === 'POST' && body) {
			finalHeaders['Content-Type'] = 'application/json';
		}

		for (let i = 0; i <= MAX_RETRIES; i++) {
			await this.#wait_until_rate_limit();

			const response = await fetch(url.toString(), {
				method: method,
				headers: finalHeaders,
				body: body ? JSON.stringify(body) : undefined,
			});

			this.#update_rate_limit_variables(response);

			if (response.ok) {
				if (response.status === 204) {
					return null as T;
				}
				return response.json() as Promise<T>;
			}

			if (RETRY_STATUS_CODES.includes(response.status) && i < MAX_RETRIES) {
				const retryAfter = response.headers.get('Retry-After');
				const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : (2 ** i) * 1000;
				await new Promise((resolve) => setTimeout(resolve, waitTime));
				continue;
			}

			let message: string | null = null;
			try {
				const errorJson = await response.json();
				message = errorJson?.error ?? errorJson?.message ?? null;
			} catch (_e) {
				message = response.statusText;
			}
			throw new Error(`ListenBrainzAPIException: ${response.status} ${message ?? ''}`.trim());
		}
		throw new Error('ListenBrainzAPIException: 504 Request failed after multiple retries.', { cause: { status: 504 } });
	}

	#get<T>(endpoint: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
		return this.#request<T>(endpoint, 'GET', params, undefined, headers);
	}

	#post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
		return this.#request<T>(endpoint, 'POST', undefined, data, headers);
	}

	#post_submit_listens(listens: Listen[], listen_type: ListenType): Promise<SubmitListenResponse> {
		this.#require_auth_token();
		validateSubmitListensPayload(listen_type, listens);
		const listen_payload = listens.map((listen) => listen.toSubmitPayload());
		const submit_json = {
			listen_type: listen_type,
			payload: listen_payload,
		};
		return this.#post<SubmitListenResponse>('/1/submit-listens', submit_json);
	}

	async set_auth_token(auth_token: string, check_validity: boolean = true): Promise<void> {
		this.#auth_token = auth_token;
		if (check_validity) {
			const response = await this.#get<ValidateTokenResponse>(
				'/1/validate-token',
			);
			if (!response.valid) {
				throw Error('InvalidAuthTokenException: The provided auth token is invalid.');
			}
		}
	}

	submit_multiple_listens(listens: Listen[]): Promise<SubmitListenResponse> {
		return this.#post_submit_listens(listens, LISTEN_TYPE_IMPORT);
	}

	submit_single_listen(listen: Listen): Promise<SubmitListenResponse> {
		return this.#post_submit_listens([listen], LISTEN_TYPE_SINGLE);
	}

	submit_playing_now(listen: Listen): Promise<SubmitListenResponse> {
		return this.#post_submit_listens([listen], LISTEN_TYPE_PLAYING_NOW);
	}

	submit_user_feedback(feedback: 1 | -1 | 0, recording_mbid: string): Promise<any> {
		const data = {
			score: feedback,
			recording_mbid: recording_mbid,
		};
		return this.#post('/1/feedback/recording-feedback', data);
	}

	delete_listen(listen: Listen): Promise<any> {
		const data = {
			listened_at: listen.listened_at,
			recording_msid: listen.recording_msid,
		};
		return this.#post('/1/delete-listen', data);
	}

	async get_playing_now(username: string): Promise<Listen | null> {
		const data = await this.#get<PlayingNowResponse>(`/1/user/${username}/playing-now`);
		const listens = data.payload.listens;
		if (listens.length > 0)
			return convertApiPayloadToListen(listens[0]);
		return null;
	}

	async get_listens(username: string, options?: { max_ts?: number; min_ts?: number; count?: number }): Promise<Listen[]> {
		const params = {
			max_ts: options?.max_ts,
			min_ts: options?.min_ts,
			count: options?.count,
		};
		const data = await this.#get<GetListensResponse>(`/1/user/${username}/listens`, params);
		const listens = data.payload.listens;
		return listens.map((listen_data) => convertApiPayloadToListen(listen_data));
	}

	#get_user_entity(username: string, entity: 'artists' | 'recordings' | 'releases', count: number = 25, offset: number = 0, time_range: StatsTimeRange = 'all_time'): Promise<any> {
		if (!STATS_SUPPORTED_TIME_RANGES.includes(time_range)) {
			throw new Error(`ListenBrainzException: Invalid time range: ${time_range}`);
		}
		const params = { count, offset, range: time_range };
		return this.#get(`/1/stats/user/${username}/${entity}`, params);
	}

	get_user_artists(username: string, count: number = 25, offset: number = 0, time_range: StatsTimeRange = 'all_time'): Promise<any> {
		return this.#get_user_entity(
			username,
			'artists',
			count,
			offset,
			time_range,
		);
	}

	get_user_recordings(username: string, count: number = 25, offset: number = 0, time_range: StatsTimeRange = 'all_time'): Promise<any> {
		return this.#get_user_entity(
			username,
			'recordings',
			count,
			offset,
			time_range,
		);
	}

	get_user_releases(username: string, count: number = 25, offset: number = 0, time_range: StatsTimeRange = 'all_time'): Promise<any> {
		return this.#get_user_entity(
			username,
			'releases',
			count,
			offset,
			time_range,
		);
	}

	get_user_recommendation_recordings(username: string, artist_type: 'top' | 'similar' | 'raw' = 'top', count: number = 25, offset: number = 0): Promise<any> {
		if (!['top', 'similar', 'raw'].includes(artist_type)) {
			throw new Error('artist_type must be either top or similar or raw.');
		}
		const params = { artist_type, count, offset };
		return this.#get(`/1/cf/recommendation/user/${username}/recording`, params);
	}

	async get_user_listen_count(username: string): Promise<number | null> {
		const response = await this.#get<ListenCountResponse>(`/1/user/${username}/listen-count`);
		return response?.payload?.count ?? null;
	}

	get_user_feedback(username: string, score: 1 | -1, metadata: boolean, count: number = 100, offset: number = 0): Promise<any> {
		const params = { count, offset, score, metadata };
		return this.#get(`/1/feedback/user/${username}/get-feedback`, params);
	}
}
