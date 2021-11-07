# [Recreated Regiohashing Tool](https://thexxos.github.io/regiohash/)
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/TheXXOs/regiohash) ![GitHub contributors](https://img.shields.io/github/contributors-anon/TheXXOs/regiohash)

Recreating [Hessophane's Geohashing Minesweeper-Regiohashing tool](https://geohashing.site/geohashing/User:Hessophanes/Regiohashing) which has [since become defunct](http://hessophanes.de/xkcd/xkcdregio.cgi?about) (I think).

...that probably doesn't make much sense to anyone who doesn't know what [Geohashing](https://geohashing.site/geohashing/Main_Page) is.

I'm going to be making this in Javascript and... oh, did I mention that before this I'd never properly used Javascript?

## Current Progress
I've completed:
- Painstakingly creating sprites
- Writing code to link the sprites together on a \<canvas>
- Create a similar text-to-map converter to the original
- Add the numbers at the top
- Create a way to identify what square correlates to what graticule
- Do the numbers in the map
- Make the numbers at the top change based on the correct info

I need to:
- Tidy up (or redo) this README and the [documentation at geohashing.site](https://geohashing.site/geohashing/User:XXOs/Regiohashing)
- Recreating all the maps that the original had
- Giving it the capability to check a user page for an a/s/g tag and geohash links
- Overall just getting it to the standard that the original was

Eventually I might do a rewrite in Flask or something, which will include:
- Redoing the text-to-map logic to allow for sub-sub-(etc)-regions
