const functions = require("firebase-functions");

const cors = require("cors");
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

exports.recordOrder = functions.https.onRequest(async (req, res) => {
  return cors()(req, res, () => {
    CLIENT_ID = functions.config().twitch.client_id;
    CLIENT_SECRET = functions.config().twitch.client_secret;

    MAX_VIEWERS = 0; // number of viewers to be considered for inclusion
    REQUEST_LIMIT = 1500; // number of API requests to stop at before starting a new search
    MINIMUM_STREAMS_TO_GET = 50; // if REQUEST_LIMIT streams doesn't capture at least this many zero-
    // viewer streams, keep going
    SECONDS_BEFORE_RECORD_EXPIRATION = 180; // how many seconds a stream should stay in redis

    // find and add streams to db
    populate_streamers();


    
    // Grab the order data (may be in req.query...)
    const orderData = req.body;
    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = admin
      .firestore()
      .collection("orders")
      .add({
        orderData: {
          ...orderData,
          created: admin.firestore.Timestamp.now(),
        },
      });
    // Send back a message that we've successfully written the message
    res.json({ result: `Order with ID: ${writeResult} added.` });
  });
});


function populate_streamers(client_id, client_secret) {
  token = get_bearer_token(client_id, client_secret);

  if (!token) {
    console.log("There's no token! Halting.");
    return;
  }

  requests_sent = 1;
  streams_grabbed = 0;

  // eat page after page of API results until we hit our request limit
  stream_list = get_stream_list_response(client_id, token);
  while (
    requests_sent <= REQUEST_LIMIT ||
    streams_grabbed < MINIMUM_STREAMS_TO_GET
  ) {
    stream_list_data = stream_list.json();
    requests_sent += 1;

    // filter out streams with our desired count and inject into redis
    streams_found = stream_list_data["data"].filter(
      (stream) => stream["viewer_count"] <= MAX_VIEWERS
    );

    streams_found.forEach((stream) => {
      streams_grabbed += 1;
      // add stream to db
      main_redis.setex(
        json.dumps(stream),
        SECONDS_BEFORE_RECORD_EXPIRATION,
        time.time()
      );
    });

    // report on what we inserted
    if (streams_found.length > 0) {
      logging.debug(`Inserted ${len(streams_found)} streams`);
    }

    // sleep on rate limit token utilization
    rate_limit_usage = round(
      (1 -
        int(stream_list.headers["Ratelimit-Remaining"]) /
          int(stream_list.headers["Ratelimit-Limit"])) *
        100
    );
    if (rate_limit_usage > 60) {
      logging.warning(
        `Rate limiting is at ${rate_limit_usage}% utilized; sleeping for 30s`
      );
      time.sleep(30);
    }

    // drop a status every now and again
    if (requests_sent % 10 == 0) {
      console.log(
        `${requests_sent} requests sent (${streams_grabbed} streams found); ``${stream_list.headers["Ratelimit-Remaining"]} of ${stream_list.headers["Ratelimit-Limit"]} ``API tokens remaining (${rate_limit_usage}% utilized)`
      );
      // set stats db
      //   stats_redis.set(
      //     "stats",
      //     json.dumps({
      //       ratelimit_remaining: stream_list.headers["Ratelimit-Remaining"],
      //       ratelimit_limit: stream_list.headers["Ratelimit-Limit"],
      //       time_of_ratelimit: time.time(),
      //     })
      //   );
    }
    // aaaaand do it again
    try {
      pagination_offset = stream_list_data["pagination"]["cursor"];
    } catch (KeyError) {
      // we hit the end of the list; no more keys
      console.log("Hit end of search results");
      break;
    }

    stream_list = get_stream_list_response(client_id, token, pagination_offset);
  }
}
function get_bearer_token(client_id, secret) {
  payload = {
    client_id: client_id,
    client_secret: secret,
    grant_type: "client_credentials",
  };

  fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((json) => console.log(json));

  try {
    console.log(
      `Recieved ${token_response.json()["access_token"]}; expires in ${
        token_response.json()["expires_in"]
      }s`
    );
    return token_response.json()["access_token"];
  } catch (KeyError) {
    console.log(`Didn't find access token. Got '${token_response.text}'`);
    return None;
  }
}

function get_stream_list_response(client_id, token, pagination_offset = null) {
  headers = { "client-id": client_id, Authorization: `'Bearer ${token}` };

  const params = new URLSearchParams();
  params.append("first", 100);
  params.append("language", "en");

  if (pagination_offset) {
    params.append("after", pagination_offset);
  }

  stream_list = fetch("https://api.twitch.tv/helix/streams", {
    body: params,
    headers: headers,
  });

  return stream_list;
}

