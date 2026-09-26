# Project architecture

- Club popularity uses database-backed `views_count`; increment it only through `increment_club_views` so public visitors cannot overwrite counts.
- Club proximity uses optional `latitude`/`longitude`; address geocoding is initiated only by an explicit user action and may be cached locally.