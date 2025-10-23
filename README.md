# Gator
CLI RSS feed aggregator

## Dependencies

- Node.js 
- Postgres

Setup:
 - create a config file in your home directory, ~/.gatorconfig.json, with the following content:
 ```bash
{
  "db_url": "postgres://username:@localhost:5432/database?sslmode=disable"
}
```

# Commands
 Command | Description |
|---------|-------------|
|`register <name>`| registers new user and logs them in |
|`login <name> `| logs in user. no authentication |
|`users` | prints list of users |
|`addfeed <"rss title"`> <"rss url">| adds rss feed |
|`follow <rss url>` | lets you follow a rss feed already exists in DB |
|`unfollow <rss url>` | drops following feed |
|`following` | lists all feeds you are following |
|`agg <time duration>` | fetchs feeds every interval you set: 1s 1m 1h |
|`browse <limit>` | browse set of rss feeds that you follow |
|`reset` | deletes all users and feeds |
