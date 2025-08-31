import { ListenBrainz } from '../src/client';

const client = new ListenBrainz();
const listens = await client.get_listens('iliekcomputers');
for (const listen of listens) {
	console.log('Track name:', listen.track_name);
	console.log('Artist name:', listen.artist_name);
}
