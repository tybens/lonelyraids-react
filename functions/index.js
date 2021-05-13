const functions = require("firebase-functions");

const cors = require("cors");
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");

// The Firebase Admin SDK to access Firestore.
const firebase = require("firebase-admin");

const config = {
  apiKey: "apiKey", // what is this
  authDomain: "lonelyraids.firebaseapp.com",
  databaseURL: "https://lonelyraids-default-rtdb.firebaseio.com/",
  storageBucket: "bucket.appspot.com", // what is this
};

firebase.initializeApp(config);

// Get a reference to the database service
const db = firebase.database();

const MAX_VIEWERS = 5; // number of viewers to be considered for inclusion
const REQUEST_LIMIT = 1500; // number of API requests to stop at before starting a new search

// writes stream id data to database
function writeStreamData(streamId) {
  db.ref("currentRaid").set(
    {
      id: streamId,
      added: firebase.firestore.Timestamp.now(),
    },
    (error) => {
      if (error) {
        console.error(error);
        return false;
      } else {
        return true;
      }
    }
  );
}

// reads database for the single currentStream
async function readStreamData() {
  let snapshot = await db.ref("currentRaid").get();
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    console.log("No data available");
    return null;
  }
}

// endpoint containing logic for serving a raid to a user
exports.fetchStream = functions.https.onRequest(async (req, res) => {
  return cors()(req, res, async () => {
    const CLIENT_ID = functions.config().twitch.client_id;
    const CLIENT_SECRET = functions.config().twitch.client_secret;

    let streamId = null;
    // read the current stream in the database and check how long it's been there
    const currentStream = await readStreamData();
    const secondsSince =
      firebase.firestore.Timestamp.now()._seconds -
      currentStream.added._seconds;

    let raidJoined = false;
    if (secondsSince > 120) {
      // if the stream is older than a certain time, find a new one
      streamId = await populate_streamers(CLIENT_ID, CLIENT_SECRET);
      writeStreamData(streamId);
      console.log(`Raid started! Stream with ID: ${streamId} added to db`);
    } else {
      // else, serve the saved one
      streamId = currentStream.id;
      raidJoined = true;
    }

    res.json({ status: 200, streamId: streamId, raidJoined: raidJoined });
  });
});

// returns a streamId of the desired view count
async function populate_streamers(client_id, client_secret) {
  let requests_sent = 1;
  let streams_grabbed = 0;
  let min_viewcount = 9999;

  const token = await get_bearer_token(client_id, client_secret);

  if (!token) {
    console.log("There's no token! Halting.");
    return;
  }

  // eat page after page of API results until we hit our request limit
  let [stream_list, headers] = await get_stream_list_response(client_id, token);
  let streamId = null;
  while (requests_sent <= REQUEST_LIMIT) {
    requests_sent += 1;

    let stream_list_data = stream_list.data;
    stream_list_data.forEach((stream) => {
      streams_grabbed += 1;
      min_viewcount =
        min_viewcount < stream.viewer_count
          ? min_viewcount
          : stream.viewer_count;
      if (min_viewcount <= 5) {
        streamId = stream.id;
      }
    });

    // if we've found it, return it
    if (streamId) {
      return streamId;
    }

    // sleep on rate limit token utilization
    let rate_limit_usage = Math.round(
      (1 -
        parseInt(headers.get("Ratelimit-Remaining")) /
          parseInt(headers.get("Ratelimit-Limit"))) *
        100
    );

    if (rate_limit_usage > 60) {
      console.log(
        `Rate limiting is at ${rate_limit_usage}% utilized; sleeping for 30s`
      );
      // await sleep(5000); // sleep for 5
    }

    // drop a status every now and again
    if (requests_sent % 10 === 0) {
      console.log(
        `${requests_sent} requests sent (${streams_grabbed} streams found) (${min_viewcount} lowest viewcount); ${headers.get(
          "Ratelimit-Remaining"
        )} of ${headers.get(
          "Ratelimit-Limit"
        )} API tokens remaining (${rate_limit_usage}% utilized)`
      );
    }
    // aaaaand do it again
    let pagination_offset = null;
    try {
      pagination_offset = stream_list["pagination"]["cursor"];
    } catch (KeyError) {
      // we hit the end of the list; no more keys
      console.log("Hit end of search results");
      break;
    }

    [stream_list, headers] = await get_stream_list_response(
      client_id,
      token,
      pagination_offset
    );
  }
}

// gets twitch api token
async function get_bearer_token(client_id, secret) {
  const payload = {
    client_id: client_id,
    client_secret: secret,
    grant_type: "client_credentials",
  };

  let response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  let token_response = await response.json();

  try {
    console.log(
      `Recieved ${token_response["access_token"]}; expires in ${token_response["expires_in"]}s`
    );
    return token_response["access_token"];
  } catch (KeyError) {
    console.log(`Didn't find access token. Got '${token_response.text}'`);
    console.log(KeyError);
    return null;
  }
}

// gets list of streams using twitch api
async function get_stream_list_response(
  client_id,
  token,
  pagination_offset = null
) {
  const headers = { "client-id": client_id, Authorization: `Bearer ${token}` };

  const params = new URLSearchParams();
  params.append("first", 100);
  params.append("language", "en");

  if (pagination_offset) {
    params.append("after", pagination_offset);
  }
  const url = new URL("https://api.twitch.tv/helix/streams");
  url.search = new URLSearchParams(params);

  let response = await fetch(url, {
    headers: headers,
  });
  let response_headers = response.headers;
  let json = await response.json();

  if (!json.error) {
    return [json, response_headers];
  } else {
    console.log(`Error:  ${JSON.stringify(json)}`);
    return [null, null];
  }
}
