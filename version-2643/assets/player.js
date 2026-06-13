document.addEventListener("DOMContentLoaded", function () {
  var Hls = window.Hls;
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".play-button");
    var hlsUrl = video ? video.getAttribute("data-hls") : "";
    var ready = false;
    var hls = null;

    var attachSource = function () {
      if (!video || !hlsUrl || ready) {
        return;
      }

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }

          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          hls.destroy();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
      }

      ready = true;
    };

    var playVideo = function () {
      if (!video) {
        return;
      }

      attachSource();
      box.classList.add("is-ready");
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    };

    if (button) {
      button.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        box.classList.add("is-ready");
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
});
