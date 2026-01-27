for i in {1..12}; do
  convert -size 75x75 xc:white -gravity center -pointsize 30 -draw "text 0,0 '$i'" num_$i.png
done