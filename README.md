# listenbrainz.js

A simple TypeScript/JavaScript library for the
[ListenBrainz Web API](https://listenbrainz.readthedocs.io/en/production/dev/api/).

listenbrainz.js will help you start getting data from and submitting data to
[ListenBrainz](https://listenbrainz.org) very quickly.

Here's an example of getting the listening history of a ListenBrainz user:

```ts
import { ListenBrainz } from 'listenbrainz.js';

const client = new ListenBrainz();
const listens = await client.get_listens('iliekcomputers');
for (const listen of listens) {
    console.log('Track name:', listen.track_name);
    console.log('Artist name:', listen.artist_name);
}
```

More examples can be found in the [examples](./examples) directory.

More detailed documentation is available
at [Read The Docs](https://liblistenbrainz.readthedocs.io/en/latest/) (for the API).

## Features

listenbrainz.js provides easy access to all ListenBrainz endpoints, handles
ratelimits automatically and supports the ListenBrainz authorization flow.

For details on the API endpoints that can be used via listenbrainz.js, take
a look at the [ListenBrainz API Documentation](https://listenbrainz.readthedocs.io/en/production/dev/api/).

## Installation

```bash
npm install listenbrainz.js
```
