import { ListenBrainz } from '../src/client.js';

const client = new ListenBrainz();
const listen = await client.get_playing_now('iliekcomputers');
if (listen) {
	console.log('Track name:', listen.track_name);
	console.log('Artist name:', listen.artist_name);
} else {
	console.log('User is not currently listening to anything.');
}
