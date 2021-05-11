- user clicks start raid button
- function checks db for the raid
    - if the raid was added longer than a minute ago,
        - search twitch for a new raid with less than 2 viewers
        - add it to the db
        - serve it to the user
    - else,
        - serve it to the user
    