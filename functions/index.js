const functions = require("firebase-functions");

const cors = require("cors");
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");
const location = require("location");

// The Firebase Admin SDK to access Firestore.
const firebase = require("firebase-admin");

var firebaseConfig = {
  apiKey: "AIzaSyCiOkZCnzXGhbFA7yZ_P-FqaGeF8Mdq2Zc",
  authDomain: "lonelyraids.firebaseapp.com",
  databaseURL: "https://lonelyraids-default-rtdb.firebaseio.com",
  projectId: "lonelyraids",
  storageBucket: "lonelyraids.appspot.com",
  messagingSenderId: "40364542390",
  appId: "1:40364542390:web:106ebdf3a3d623fa901917",
  measurementId: "G-787Y0K3GHF",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const db = firebase.database();
// if (location.hostname === "localhost") {
  // Point to the RTDB emulator running on localhost.
  // db.useEmulator("localhost", 9000);
// }

const MAX_VIEWERS = 2; // number of viewers to be considered for inclusion
const REQUEST_LIMIT = 1500; // number of API requests to stop at before starting a new search

// writes stream id data to database
function writeStreamData(streamName, pagination_offset) {
  db.ref("currentRaid").set(
    {
      streamName: streamName,
      added: firebase.firestore.Timestamp.now(),
      pagination_offset: pagination_offset,
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

    let streamName = null;
    // read the current stream in the database and check how long it's been there
    const currentStream = await readStreamData();
    let secondsSince = 9999;
    let pagination_offset = null;
    try {
      secondsSince =
        firebase.firestore.Timestamp.now()._seconds -
        currentStream.added._seconds;
      pagination_offset = currentStream.pagination_offset;
    } catch (error) {
      // database was empty, just fill it with a new one.
    }

    let raidJoined = false;
    if (secondsSince > 60) {
      // if the stream is older than a certain time, find a new one (starting at the pagination offset ?)
      data = await populate_streamers(CLIENT_ID, CLIENT_SECRET, pagination_offset );
      streamName = data.user
      writeStreamData(streamName, data.pagination_offset);
      console.log(
        `Raid started! Stream with username: ${streamName} added to db`
      );
      secondsSince = 0
    } else {
      // else, serve the saved one
      streamName = currentStream.streamName;
      raidJoined = true;
    }

    console.log(`Stream name found: ${streamName}`);
    res.json({ status: 200, streamName: streamName, raidJoined: raidJoined, secondsSince: secondsSince });
  });
});

// returns a { name: streamName, pagination_offset: pagination_offset} of the desired view count
async function populate_streamers(client_id, client_secret, pagination_offset= null) {
  let requests_sent = 1;
  let streams_grabbed = 0;
  let min_viewcount = 9999;

  const token = await get_bearer_token(client_id, client_secret);

  if (!token) {
    console.log("There's no token! Halting.");
    return;
  }

  // eat page after page of API results until we hit our request limit
  let [stream_list, headers] = await get_stream_list_response(client_id, token, pagination_offset);
  let streamName = null;
  while (requests_sent <= REQUEST_LIMIT) {
    requests_sent += 1;

    let stream_list_data = stream_list.data;
    stream_list_data.forEach((stream) => {
      streams_grabbed += 1;
      min_viewcount =
        min_viewcount < stream.viewer_count
          ? min_viewcount
          : stream.viewer_count;
      if (min_viewcount <= MAX_VIEWERS) {
        streamName = stream;
      }
    });

    // if we've found it, return it
    if (streamName) {
      return {user: streamName.user_name, pagination_offset: pagination_offset};
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
