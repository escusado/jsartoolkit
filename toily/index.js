  function updateCanvas(ctx, video) {
    ctx.drawImage(video, 0,0,320,240);
  }

  window.onload = function() {
    var video = document.createElement('video');
    video.src = "video.mp4";
    video.width = 320;
    video.height = 240;
    video.loop = true;
    video.volume = 0;
    video.controls = true;
    document.body.appendChild(video);

    var canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    var raster = new NyARRgbRaster_Canvas2D(canvas);
    document.body.appendChild(canvas);

    var param = new FLARParam(320,240);
    var pmat = mat4.identity();
    param.copyCameraMatrix(pmat, 100, 10000);

    var resultMat = new NyARTransMatResult();

    var detector = new FLARMultiIdMarkerDetector(param, 2);
    detector.setContinueMode(true);
    var frame = 0;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,320,240);
    ctx.font = "24px URW Gothic L, Arial, Sans-serif";

    var times = [];
    var pastResults = {};
    setInterval(function() {
      if (video.paused) return;
      if (window.paused) return;

      updateCanvas(ctx, video);
      var dt = new Date().getTime();

      canvas.changed = true;

      var t = new Date();
      var detected = detector.detectMarkerLite(raster, 190);

      for (var idx = 0; idx<detected; idx++) {
        var id = detector.getIdMarkerData(idx);
        var currId;
        if (id.packetLength > 4) {
          currId = -1;
        }else{
          currId=0;
          for (var i = 0; i < id.packetLength; i++ ) {
            currId = (currId << 8) | id.getPacketData(i);
          }
        }
        if (!pastResults[currId]) {
          pastResults[currId] = {};
        }
        detector.getTransformMatrix(idx, resultMat);
        pastResults[currId].age = 0;
        var mat = resultMat;
        var cm = mat4.create();
        cm[0] = mat.m00;
        cm[1] = -mat.m10;
        cm[2] = mat.m20;
        cm[3] = 0;
        cm[4] = mat.m01;
        cm[5] = -mat.m11;
        cm[6] = mat.m21;
        cm[7] = 0;
        cm[8] = -mat.m02;
        cm[9] = mat.m12;
        cm[10] = -mat.m22;
        cm[11] = 0;
        cm[12] = mat.m03;
        cm[13] = -mat.m13;
        cm[14] = mat.m23;
        cm[15] = 1;
        mat4.multiply(pmat, cm, cm);
        pastResults[currId].transform = cm;
        if (idx == 0) times.push(new Date()-t);
      }
      for (var i in pastResults) {
        var r = pastResults[i];
        if (r.age > 10) delete pastResults[i];
        r.age++;
      }
      var w2 = 320/2;
      var h2 = 240/2;
      for (var i in pastResults) {
        var mat = pastResults[i].transform;
        var verts = [
          vec4.create(-1, -1, 0, 1),
          vec4.create(1, -1, 0, 1),
          vec4.create(1, 1, 0, 1),
          vec4.create(-1, 1, 0, 1) ];
        var verts2 = [
          vec4.create(-0.8, -0.8, 0, 1),
          vec4.create(-0.2, -0.8, 0, 1),
          vec4.create(-0.2, -0.2, 0, 1),
          vec4.create(-0.8, -0.2, 0, 1) ];
        ctx.save();
          ctx.beginPath();
            verts.forEach(function(v,i) {
              mat4.multiplyVec4(mat, v);
              v[0] = v[0]*w2/v[3] + w2;
              v[1] = -v[1]*h2/v[3] + h2;
              if (i) {
                ctx.lineTo(v[0], v[1]);
              } else {
                ctx.moveTo(v[0], v[1]);
              }
            });
          ctx.closePath()
          ctx.fillStyle = "red";
          ctx.fill();
          ctx.beginPath();
            verts2.forEach(function(v,i) {
              mat4.multiplyVec4(mat, v);
              v[0] = v[0]*w2/v[3] + w2;
              v[1] = -v[1]*h2/v[3] + h2;
              if (i) {
                ctx.lineTo(v[0], v[1]);
              } else {
                ctx.moveTo(v[0], v[1]);
              }
            });
          ctx.closePath()
          ctx.fillStyle = "white";
          ctx.fill();
        ctx.restore();
      }
      if (detected == 0) times.push(new Date()-t);
      if (times.length > 100) {
        if (window.console)
          console.log(times.reduce(function(s,i){return s+i;})/times.length)
        times.splice(0);
      }
    }, 50);
  }