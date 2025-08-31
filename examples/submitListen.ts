import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { ListenBrainz } from '../src/client';
import { Listen } from '../src/listen';

const rl = createInterface({ input, output });
const auth_token = await rl.question('Please enter your auth token: ');
rl.close();

const listen = new Listen({
	track_name: 'Fade',
	artist_name: 'Kanye West',
	release_name: 'The Life of Pablo',
	listened_at: Math.floor(Date.now() / 1000),
});

const client = new ListenBrainz();
await client.set_auth_token(auth_token);

let response = await client.submit_single_listen(listen);
console.log(response);

const listen_2 = new Listen({
	track_name: 'Contact',
	artist_name: 'Daft Punk',
	release_name: 'Random Access Memories',
	listened_at: Math.floor(Date.now() / 1000),
});

const listen_3 = new Listen({
	track_name: 'Get Lucky',
	artist_name: 'Daft Punk',
	release_name: 'Random Access Memories',
	listened_at: Math.floor(Date.now() / 1000),
});

response = await client.submit_multiple_listens([listen_2, listen_3]);
console.log(response);
