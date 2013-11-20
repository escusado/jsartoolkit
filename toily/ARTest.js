Class('ARTest')({
    prototype : {
        size:{
            w:320,
            h:240
        },

        init : function (){
            this.setVideo();
            this.setCanvas();
            this.setARtoolkit();

            this.times = [];
            this.pastResults = {};

            requestAnimationFrame(this.execLoop.bind(this));
        },

        setVideo : function(){
            this.videoEl = document.createElement('video');
            this.videoEl.src = "video.mp4";
            this.videoEl.width = this.size.w;
            this.videoEl.height = this.size.h;
            this.videoEl.loop = true;
            this.videoEl.volume = 0;
            this.videoEl.controls = true;
            document.body.appendChild(this.videoEl);
        },

        setCanvas : function(){
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.size.w;
            this.canvas.height = this.size.h;

            this.raster = new NyARRgbRaster_Canvas2D(this.canvas);

            document.body.appendChild(this.canvas);

            this.ctx = this.canvas.getContext('2d');
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0,0,this.size.w, this.size.h);
            this.ctx.font = "24px URW Gothic L, Arial, Sans-serif";
        },

        setARtoolkit : function(){
            var param = new FLARParam(this.size.w, this.size.h),
                resultMat = new NyARTransMatResult();

            this.pmat = mat4.identity();
            param.copyCameraMatrix(this.pmat, 100, 10000);

            this.detector = new FLARMultiIdMarkerDetector(param, 2);
            this.detector.setContinueMode(true);
        },

        execLoop : function(){

        }
    }
});