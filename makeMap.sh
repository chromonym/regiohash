#!/bin/bash

# License: MIT
# Copyright 2021 Fippe
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# Readme:
# This bash script generates maps for XXOs' Regiohashing tool based on OpenStreetMap (OSM) relations.

# Limitations:
#  - Supports neither negative zero nor overflowing, the script will likely cause problems at the equator, poles, prime meridian and antimeridian.
#  - Lots of OSM relations contain territorial waters, but reaching a geohash in a graticule where all of the region is water is not necessary for a retrohash.
#  - The script probably could be more effective.

# Dependencies:
# sudo apt install curl jq bc
# sudo npm install -g geojson-clipping

# Example calls:
# ./makeMap.sh Niedersachsen NI:DE 62781 454192
# ./makeMap.sh Germany DE 62781
#
# Suboptimal output because the OSM relations include territorial waters:
# ./makeMap.sh Western_Australia WA:AU 80500 2316598 -9 -43 113 153

# Meanings of the parameters
name="$1"   # name of the subdivision, no spaces; example: Western_Australia
id="$2"     # reverse colon-separated ISO 3166 code of the subdivision; example: WA:AU
parent="$3" # OSM relation ID of the parent area; example: 80500
child="$4"  # optional OSM relation ID of the subdivision; example: 2316598

# These optional parameters are useful if the parent area has far-away territories that should not be on the map, like Australia has Heard Island.
north="$5"  # optional custom northern bound; example: -9
south="$6"  # optional custom southern bound; example: -43
west="$7"   # optional custom western bound; example: 113
east="$8"   # optional custom eastern bound; example: 153

api="http://polygons.openstreetmap.fr"
dir="/tmp/regiohash-makemap-cache"

function getPolygon {
    if ! test -s "$dir/$1"
        then curl -so "/dev/null" -d "refresh=Refresh+original+geometry" "$api/?id=$1"
        curl -s "$api/get_geojson.py?id=$1&params=0" | jq -c ".geometries[0]" > "$dir/$1"
    fi
}

function getGraticulePolygon {
    if ! test -s "$dir/$1,$2"
        then minLat="$1"
        latSign="$(echo "$minLat" | grep -o "-")"
        maxLat="$latSign$(echo "$minLat+1" | tr -d "-" | bc -l)"

        minLon="$2"
        lonSign="$(echo "$minLon" | grep -o "-")"
        maxLon="$lonSign$(echo "$minLon+1" | tr -d "-" | bc -l)"

        echo "{\"type\":\"Polygon\",\"coordinates\":[[[$maxLon,$minLat],[$maxLon,$maxLat],[$minLon,$maxLat],[$minLon,$minLat]]]}" > "$dir/$minLat,$minLon"
    fi
}

function hasIntersection {
    if ! test -s "$dir/$1-$2,$3"
        then if test "$1" = "$child" && test "$childSouth" -gt "$2" -o "$childNorth" -lt "$2" -o "$childWest" -gt "$3" -o "$childEast" -lt "$3"
            then echo -n "o" > "$dir/$1-$2,$3"
            else geojson-clipping "intersection" "$dir/$1" "$dir/$2,$3" | jq ".geometry.coordinates|length" > "$dir/$1-$2,$3"
            test "$1" = "$child" && grep -vx "0" "$dir/$1-$2,$3" > "$dir/$parent-$2,$3"
        fi
    fi
    
    grep -vqx "0\|o" "$dir/$1-$2,$3"
}

function getBounds {
    if test -n "$child"
        then if test -s "$dir/$child-bounds"
            then export childNorth=$(cat "$dir/$child-bounds" | cut -d ";" -f 1)
                 export childSouth=$(cat "$dir/$child-bounds" | cut -d ";" -f 2)
                 export childWest=$(cat "$dir/$child-bounds" | cut -d ";" -f 3)
                 export childEast=$(cat "$dir/$child-bounds" | cut -d ";" -f 4)
            
            else export childNorth=$(cat "$dir/$child" | jq ".coordinates[][][][1]" | sort -g | tail -n 1 | cut -d "." -f 1)
                 export childSouth=$(cat "$dir/$child" | jq ".coordinates[][][][1]" | sort -g | head -n 1 | cut -d "." -f 1)
                 export childWest=$(cat "$dir/$child" | jq ".coordinates[][][][0]" | sort -g | head -n 1 | cut -d "." -f 1)
                 export childEast=$(cat "$dir/$child" | jq ".coordinates[][][][0]" | sort -g | tail -n 1 | cut -d "." -f 1)
                 echo -n "$childNorth;$childSouth;$childWest;$childEast;" > "$dir/$child-bounds"
        fi
    fi
   
    if test -s "$dir/$parent-bounds"
        then test -z "$north" && north=$(cat "$dir/$parent-bounds" | cut -d ";" -f 1)
             test -z "$south" && south=$(cat "$dir/$parent-bounds" | cut -d ";" -f 2)
             test -z "$west" && west=$(cat "$dir/$parent-bounds" | cut -d ";" -f 3)
             test -z "$east" && east=$(cat "$dir/$parent-bounds" | cut -d ";" -f 4)
        
        else test -z "$north" && north=$(cat "$dir/$parent" | jq ".coordinates[][][][1]" | sort -g | tail -n 1 | cut -d "." -f 1)
             test -z "$south" && south=$(cat "$dir/$parent" | jq ".coordinates[][][][1]" | sort -g | head -n 1 | cut -d "." -f 1)
             test -z "$west" && west=$(cat "$dir/$parent" | jq ".coordinates[][][][0]" | sort -g | head -n 1 | cut -d "." -f 1)
             test -z "$east" && east=$(cat "$dir/$parent" | jq ".coordinates[][][][0]" | sort -g | tail -n 1 | cut -d "." -f 1)
             echo -n "$north;$south;$west;$east;" > "$dir/$parent-bounds"
    fi
    
    echo -n "$north;$south;$west;$east;"
}

function getMap {
    seq $south $north | tac | while read -r lat
        do echo "echo"
        seq $west $east | while read -r lon
            do getGraticulePolygon "$lat" "$lon"
            
            echo "if test -n \"$child\" && hasIntersection \"$child\" \"$lat\" \"$lon\""
            echo "    then echo -n \"#\""
            echo "elif hasIntersection \"$parent\" \"$lat\" \"$lon\""
            echo "    then echo -n \"0\""
            echo "    else echo -n \"o\""
            echo "fi"
        done
    done > "$dir/script-$parent-$child"
    
    export -f hasIntersection
    export dir
    export child
    export parent
    bash "$dir/script-$parent-$child" # This is dumb, but it works this way and does not work if I just let it run in the while loop
}

function main {
    mkdir -p "$dir"
    
    getPolygon "$parent"

    if test -n "$child"
        then getPolygon "$child"
        echo -n ";"
    fi
    echo -n "$name;$id;"
    getBounds
    getMap
    echo ";"
}

main
