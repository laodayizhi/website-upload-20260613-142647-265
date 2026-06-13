import { H as Hls } from './hls.esm.js';

(function () {
  function setMessage(playerCard, text) {
    var message = playerCard.querySelector('.player-message');

    if (message) {
      message.textContent = text || '';
    }
  }

  function loadNative(video, sourceUrl, playerCard) {
    video.src = sourceUrl;
    video.addEventListener('loadedmetadata', function () {
      setMessage(playerCard, '');
      video.play().catch(function () {
        setMessage(playerCard, '已加载视频，请再次点击播放按钮。');
      });
    }, { once: true });
  }

  function loadWithHls(video, sourceUrl, playerCard) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(sourceUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setMessage(playerCard, '');
      video.play().catch(function () {
        setMessage(playerCard, '已加载视频，请再次点击播放按钮。');
      });
    });
    hls.on(Hls.Events.ERROR, function (eventName, data) {
      if (data && data.fatal) {
        setMessage(playerCard, '视频加载失败，请稍后重试。');
        hls.destroy();
      }
    });
    playerCard.hlsInstance = hls;
  }

  document.querySelectorAll('.player-card').forEach(function (playerCard) {
    var video = playerCard.querySelector('video');
    var overlay = playerCard.querySelector('.play-overlay');
    var sourceUrl = playerCard.dataset.videoUrl;
    var posterUrl = playerCard.dataset.poster;
    var hasStarted = false;

    if (!video || !overlay || !sourceUrl) {
      return;
    }

    if (posterUrl) {
      video.setAttribute('poster', posterUrl);
    }

    overlay.addEventListener('click', function () {
      playerCard.classList.add('is-playing');

      if (hasStarted) {
        video.play();
        return;
      }

      hasStarted = true;
      setMessage(playerCard, '视频加载中…');

      if (Hls && Hls.isSupported()) {
        loadWithHls(video, sourceUrl, playerCard);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        loadNative(video, sourceUrl, playerCard);
      } else {
        setMessage(playerCard, '当前浏览器不支持 HLS 播放。');
      }
    });
  });
})();
