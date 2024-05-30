
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const PORT = 8080|| process.env.PORT;
const app = express();
require('dotenv').config();
const youtubedl = require('youtube-dl-exec').raw;
const ytdl = require('ytdl-core');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

app.use(express.json())
// app.set('view engine', 'ejs');
// app.use(express.static('public'));

// app.use(cors());
// app.use(express.urlencoded({ extended: true }));

// app.use(express.json());

app.get('/convert-mp3-test', async (req, res) => {
  const {videoID} = req.query;
  const url = `https://www.youtube.com/watch?v=${videoID}`;
    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: format=> format.container === 'mp4'});
        
        if (!format) {
            return res.status(400).json({ error: 'No suitable format found for download' });
        }
        //get video title
        title = info.videoDetails.title;
        res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
        const stream = ytdl(url, { format: format });
        const proc = ffmpeg(stream)
            .format('mp3')
            .on('end', function() {
              console.log('Finished processing');
            });
        proc.pipe(res, { end: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/convert-mp3', async (req, res) => {
  const {videoID} = req.body;
  const url = `https://www.youtube.com/watch?v=${videoID}`;
    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: format=> format.container === 'mp4'});
        
        if (!format) {
            return res.status(400).json({ error: 'No suitable format found for download' });
        }
        //get video title
        title = info.videoDetails.title;
        res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
        const stream = ytdl(url, { format: format });
        const proc = ffmpeg(stream)
            .format('mp3')
            .on('end', function() {
              console.log('Finished processing');
            });
        proc.pipe(res, { end: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/convert-mp4-test', async (req, res) => {
  const {videoID} = req.query;
  const url = `https://www.youtube.com/watch?v=${videoID}`;
    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: format=> format.container === 'mp4'});
        
        if (!format) {
            return res.status(400).json({ error: 'No suitable format found for download' });
        }

         // Set response headers to indicate a file download
        res.setHeader('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');

        // Stream the video/audio to the response
        ytdl(url, { format: format }).pipe(res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
  res.status(200).send("hello world");
});
app.get('/convert-mp3',async (req,res)=>{
  const {videoID} = req.body;
  if(videoID === undefined || videoID === ''|| videoID === null||!videoID){
    res.status(418).send(`Please provide a valid videoID, not ${videoID}`);
  }else{
    const fetchVideo = await fetch(`https://youtube-mp3-download1.p.rapidapi.com/dl?id=${videoID}`, {
      "method": "GET",
      "headers": {
        "X-RapidAPI-Key": process.env.API_KEY,
        "X-RapidAPI-Host": process.env.API_HOST
      }
    });
    const videoData = await fetchVideo.json();
    if(videoData.status === 'ok'){
      const { title, link, duration } = videoData;
      res.status(200).send({ title, link, duration });
    }else{
      res.status(400).send("An error occured");
    }
}

});
app.get('/search',async (req,res) => {
  const {keyWord} = req.body;
  if(keyWord === undefined || keyWord === ''|| keyWord === null||!keyWord){
    res.status(418).send(`Please provide a valid videoID, not ${keyWord}`);
  }else{
  const fetchVideos = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyWord)}&type=video&maxResults=10&key=${process.env.YOUTUBE_API_KEY}`, {
    "method": "GET",
  });
  const queryData = await fetchVideos.json();
  if(queryData.kind === 'youtube#searchListResponse'){
    
    res.status(200).send(queryData.items);
  }else{
    res.status(400).send("An error occured in searching");
  }
}
});
app.listen(PORT, () => 

  console.log(`Server is running on port http://localhost:${PORT}`)
  )

  //http://localhost:8080/convert-mp3
  // {
  //   "videoID" : "Jaq94TzL3FA"
  // }
