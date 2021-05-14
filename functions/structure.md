- user clicks start raid button
- function checks db for the raid
  - if the raid was added longer than a minute ago,
    - search twitch for a new raid with less than 2 viewers
    - add it to the db
    - serve it to the user
  - else,
    - serve it to the user

```json
{
  "id": "42056627420",
  "user_id": "675760528",
  "user_login": "korahq65",
  "user_name": "korahq65",
  "game_id": "",
  "game_name": "",
  "type": "live",
  "title": "",
  "viewer_count": 693,
  "started_at": "2021-05-13T15:11:04Z",
  "language": "en",
  "thumbnail_url": "https://static-cdn.jtvnw.net/previews-ttv/live_user_korahq65-{width}x{height}.jpg",
  "tag_ids": ["6ea6bca4-4712-4ab9-a906-e3336a9d8039"],
  "is_mature": false
}
```
