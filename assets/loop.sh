for f in `find .`; do identify -format "%w %h %f" $f | awk '$1 > 2048 || $2 > 2048 {print ;}'; done
