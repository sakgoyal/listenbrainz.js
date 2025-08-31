import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { ListenBrainz } from '../src/client.js';
import { Listen } from '../src/listen.js';

const rl = createInterface({ input, output });
const auth_token = await rl.question('Please enter your auth token: ');
rl.close();

const listen = new Listen({
	track_name: 'Fade',
	artist_name: 'Kanye West',
	release_name: 'The Life of Pablo',
});

const client = new ListenBrainz();
await client.set_auth_token(auth_token);
const response = await client.submit_playing_now(listen);
console.log(response);
