# Project architecture

- Club popularity uses database-backed `views_count`; increment it only through `increment_club_views` so public visitors cannot overwrite counts.
- Club proximity uses optional database-backed `latitude`/`longitude` and browser location is requested only by explicit user action.