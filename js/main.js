"user strict";
;(function (win, doc ,$) {
	var DEFULT = {
		"width": 1000, //幻灯片的宽度
		"height": 270, //幻灯片的高度
		"posterWidth": 640, //幻灯片第一帧的宽度
		"posterHeight": 270, //幻灯片第一帧的高度
		"scale": 0.9, //记录显示比例关系
		"speed": 500,
		"autoPlay": true,
		"delay": 5000,
		"verticalAlign": "middle", //top bottom
		"btnHover": true,
		"Tile": false //平铺
	}
	function Carousel(elem) {		
		var _this = this;
		_this.posterWrap = elem;
		_this.posterItems = _this.posterWrap.find(".g-carousel-item");
		_this.posterNum = _this.posterItems.size();
		_this.posterlist = _this.posterWrap.find(".g-carousel-list");
		_this.posterFirst = _this.posterItems.first();
		_this.posterLastItem  = _this.posterItems.last();
		_this.btns = _this.posterWrap.find(".g-carousel-btn");
		_this.prevBtn = _this.posterWrap.find(".g-carousel-btn-prev");
		_this.nextBtn = _this.posterWrap.find(".g-carousel-btn-next");
		var userSetting = _this.getSetting();
		_this.options = $.extend({}, DEFULT, userSetting);
		if(_this.options.width < 1){
			var wrapW = _this.posterWrap.parent().outerWidth() * _this.options.width;
			_this.options.width = wrapW;
		}
		if(_this.options.Tile){
			_this.options.width = _this.options.posterWidth;
		}
		_this.btnW =_this.options.Tile?_this.options.posterWidth * 0.3  : (_this.options.width - _this.options.posterWidth) / 2;
		_this.initialize();
		_this.rotateFinish = true;
		//return this;
	};
	Carousel.prototype = {
		constructor:Carousel,
		initialize: function(){
			var _this = this;
			if(/\%/.test(_this.options.width)){
				var wrapW = _this.posterWrap.outerWidth();
				_this.options.width = wrapW;
			}
			var zindex = _this.posterNum % 2 == 0? Math.ceil( (_this.posterNum+1) / 2 ) : Math.ceil(_this.posterNum / 2);
			var firstLeft = _this.options.Tile? 0 : _this.btnW
			_this.posterWrap.css({ "width": _this.options.width, "height": _this.options.height});
			_this.posterlist.css({ "z-index": zindex , "width": _this.options.width, "height": _this.options.height});
			_this.posterFirst.css({"z-index": zindex, "left": firstLeft, "top": _this.setVerticalAlign(_this.options.posterHeight), "opacity":1, "width": _this.options.posterWidth, "height": _this.options.posterHeight});
			_this.btns.css({"z-index": zindex + 1,"width": _this.btnW, "height": _this.options.height});
			_this.sortPosters();
			_this.bindEvents();
			if (_this.options.btnHover) {
				var btnsBS = true;
				_this.btns.hover(function() {
					$this = $(this);
					$this.stop(true).animate({"opacity":0.8},100);
				},function() {
					$this = $(this);
					$this.stop(true).animate({"opacity":0},100);
				});
			} else {
				_this.btns.addClass("m-carousel-active");
			}
			if (_this.options.autoPlay) {
				_this.autoPlay();
				_this.posterWrap.hover(function() {
					if(_this.autoPlayTimer){
						clearInterval(_this.autoPlayTimer);
					}
				},function() {
					_this.autoPlay();				
				});
			}
			
		},
		bindEvents: function(){
			var _this = this;
			_this.prevBtn.on("click", function(){
				if (_this.rotateFinish) {
					_this.carouseRotate("right");
				}
			});
			_this.nextBtn.on("click", function(){
				if (_this.rotateFinish) {
					_this.carouseRotate("left");
				}
			});
			
		},
		carouseRotate: function(dir){
			var _this = this;
			var zindexArr = [];
			var targeElem;
			if (dir == "right") {
				_this.posterItems.each(function(i){
					_this.rotateFinish = false;
					var $this = $(this);
					var nextElem = $this.next().get(0)? $this.next() : _this.posterFirst;
					_this.carouseRotateSetStyle($this, nextElem, zindexArr);
				});				
			}else if (dir == "left") {
				_this.posterItems.each(function(i){
					_this.rotateFinish = false;
					var $this = $(this);
					var prevElem = $this.prev().get(0)? $this.prev() : _this.posterLastItem;
					_this.carouseRotateSetStyle($this, prevElem, zindexArr);
					
				});				
			}
			//由于z-index不需要动画效果，单独提出z-index设置，可以立马呈现层级关系，不用等待动画完成。
			_this.posterItems.each(function(i){
				var $this = $(this);
				$this.css({
					"z-index": zindexArr[i],
				});					
			});
			
		},
		carouseRotateSetStyle: function($this, targetElem, zindexArr) {
			var _this = this;
			var width =  targetElem.outerWidth();
			var height = targetElem.outerHeight();
			var left = targetElem.css("left");
			var top = targetElem.css("top");
			var zindex = targetElem.css("z-index");
			var opacity = targetElem.css("opacity");
			var left = targetElem.css("left");
			zindexArr.push(zindex);			
			$this.animate({
				"top": top,
				"left": left,
				"opacity": opacity,
				"width": width,
				"height": height
			},_this.options.speed,function(){
				_this.rotateFinish = true;
			});
		},
		autoPlay: function() {
			var _this = this;
			clearInterval(_this.autoPlayTimer);
			_this.autoPlayTimer = setInterval( function(){				
				_this.nextBtn.trigger("click");
			}, _this.options.delay);
		},
		setVerticalAlign:function(height){
			var _this = this;
			var verticalType  = _this.options.verticalAlign,
					top = 0;
			if(verticalType === "middle"){
				top = (_this.options.height-height)/2;
			}else if(verticalType === "top"){
				top = 0;
			}else if(verticalType === "bottom"){
				top = _this.options.height-height;
			}else{
				top = (_this.options.height-height)/2;
			};
			return top;
		},
		sortPosters: function(){
			var _this = this;
			var rightPosterNum =  Math.ceil(_this.posterNum / 2);
			var leftPosterNum =  Math.floor( (_this.posterNum - 1) / 2 );
			if(_this.options.Tile){
				var gap = _this.options.posterWidth;
				for (var i =1; i < rightPosterNum; i++) {
					var item = $(_this.posterItems[i]);
					var prePostW = _this.posterItems.eq(i-1).outerWidth();
					var prePostL = _this.posterItems.eq(i-1).css("left").replace("px","");
					prePostL = Number(prePostL);
					var itemRW = _this.options.posterWidth *  Math.pow(_this.options.scale,i);
					var itemRH = _this.options.posterHeight * Math.pow(_this.options.scale,i);
					var itemRL = gap * i;
					var topR = _this.setVerticalAlign(itemRH);
					var zindex = Math.ceil((_this.posterNum -1) / 2) - (i-1);
					var opacity = _this.options.opacity?_this.options.opacity : i;
					item.css({"z-index": zindex, "top": topR, "opacity":1/(parseInt(opacity)), "left":itemRL, "width": itemRW, "height": itemRH});
				}				
				for (var j = _this.posterNum - 1; j > leftPosterNum; j--) {
					var item = $(_this.posterItems[j]);
					var z = _this.posterNum - j;
					var zindex = j - leftPosterNum;
					var itemLW = _this.options.posterWidth * Math.pow(_this.options.scale,z);
					var itemLH = _this.options.posterHeight * Math.pow(_this.options.scale,z);
					var itemLL = -z * gap;
					var topL = _this.setVerticalAlign(itemLH);
					item.css({"z-index": zindex, "top": topL, "left":itemLL, "opacity":1/z, "width": itemLW, "height": itemLH});
				}
			} else {
				for (var i =1; i < rightPosterNum; i++) {
					var item = $(_this.posterItems[i]);
					var prePostW = _this.posterItems.eq(i-1).outerWidth();
					var prePostL = _this.posterItems.eq(i-1).css("left").replace("px","");
					prePostL = Number(prePostL);
					var gap = _this.btnW / Math.floor( (_this.posterNum -1) / 2);
					var itemRW = _this.options.posterWidth *  Math.pow(_this.options.scale,i);
					var itemRH = _this.options.posterHeight * Math.pow(_this.options.scale,i);
					var itemRL = (prePostW - ( itemRW - gap ) ) + prePostL;
					var topR = _this.setVerticalAlign(itemRH);
					var zindex = Math.ceil((_this.posterNum -1) / 2) - (i-1);
					var opacity = _this.options.opacity?_this.options.opacity : i;
					item.css({"z-index": zindex, "top": topR, "opacity":1/(parseInt(opacity)), "left":itemRL, "width": itemRW, "height": itemRH});
				}
				
				for (var j = _this.posterNum - 1; j > leftPosterNum; j--) {
					var item = $(_this.posterItems[j]);
					var z = _this.posterNum - j;
					var zindex = j - leftPosterNum;
					var gap = _this.btnW / Math.ceil( (_this.posterNum -1) / 2 );
					var itemLW = _this.options.posterWidth * Math.pow(_this.options.scale,z);
					var itemLH = _this.options.posterHeight * Math.pow(_this.options.scale,z);
					var itemLL = ( j - leftPosterNum -1 ) * gap;
					var topL = _this.setVerticalAlign(itemLH);
					item.css({"z-index": zindex, "top": topL, "left":itemLL, "opacity":1/z, "width": itemLW, "height": itemLH});
				}
			}
			
		},
		getSetting: function() {
			var _this = this;
			var setting = _this.posterWrap .attr("data-setting");
			setting = JSON.parse(setting);
			return setting? setting : {};
		}
	};
	Carousel.init = function(){
		var param = Array.prototype.slice.apply(arguments);
		var _this_ = this;
		var elems = $(param[0]);
		return elems.each(function(){
			var $this = $(this);
			if(!$this.data("Carousel")){
				var myCarousel = new _this_($this);
				$this.data("Carousel", myCarousel);
			}
		});		
	};
	Carousel.events = function(elem) {
		elem = $(elem)
		var carouselObj = elem.data("Carousel");
		return carouselObj;
	}	
	win.xplCarousel = Carousel;
})(window, document, jQuery);
