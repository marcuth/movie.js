```bash
ffmpeg -loop 1 -t 5 -framerate 30 -i D:\v2Projects\@marcuth\movie.js\heroic_races_134_br\dragons\3429-dragon-highjustice.png -loop 1 -t 10 -framerate 30 -i D:\v2Projects\@marcuth\movie.js\heroic_races_134_br\laps\lap-01.png -stream_loop -1 -i D:\v2Projects\@marcuth\movie.js\playground\better_days.mp3 -y -filter_complex anullsrc=sample_rate=44100:channel_layout=stereo[anull0];[anull0]atrim=end=5[a0];[0:v]fade=t=in:st=0:d=1[fadeIn0];[fadeIn0]fade=t=out:st=4:d=1[v0];anullsrc=sample_rate=44100:channel_layout=stereo[anull0];[anull0]atrim=end=10[a0];[0:v]fade=t=in:st=0:d=1[fadeIn0];[fadeIn0]f ade=t=out:st=9:d=1[v0];[v0][a0][v0][a0]concat=n=2:v=1:a=1[v2][a2];[0:a]atrim=end=207[trimAudio0];[v2][a2]concat=n=1:v=1:a=1[v1][baseA1]; [trimAudio0]amix=inputs=1[mix1];[baseA1][mix1]amix=inputs=2:duration=first[a1];[v1][a1]concat=n=1:v=1:a=1[outv][basea];[basea]anull[outa] -map [outv] -map [outa] -c:v libx264 -c:a aac -pix_fmt yuv420p -c:v libx264 -preset ultrafast -f mp4 D:\v2Projects\@marcuth\movie.js\playground\heroic-races1.mp4
```























```bash
-stream_loop -1 -i D:\v2Projects\@marcuth\movie.js\playground\better_days.mp3 -y -filter_complex anullsrc=sample_rate=44100:channel_layout=stereo[anull0];[anull0]atrim=end=5[a0];[0:v]fade=t=in:st=0:d=1[fadeIn0];[fadeIn0]fade=t=out:st=4:d=1[v0];anullsrc=sample_rate=44100:channel_layout=stereo[anull0];[anull0]atrim=end=10[a0];[0:v]fade=t=in:st=0:d=1[fadeIn0];[fadeIn0]f ade=t=out:st=9:d=1[v0];[v0][a0][v0][a0]concat=n=2:v=1:a=1[v2][a2];[0:a]atrim=end=207[trimAudio0];[v2][a2]concat=n=1:v=1:a=1[v1][baseA1]; [trimAudio0]amix=inputs=1[mix1];[baseA1][mix1]amix=inputs=2:duration=first[a1];[v1][a1]concat=n=1:v=1:a=1[outv][basea];[basea]anull[outa] -map [outv] -map [outa] -c:v libx264 -c:a aac -pix_fmt yuv420p -c:v libx264 -preset ultrafast -f mp4 D:\v2Projects\@marcuth\movie.js\playground\heroic-races1.mp4
```