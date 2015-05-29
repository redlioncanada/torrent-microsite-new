var trntOverlay = function(width, height, color, parent, id, shrinkFactor, time) {
	if (width === undefined) width = "50%";
	if (height === undefined) height = "50%";
	if (color === undefined) color = "rgba(0,0,0,0.5)";
	if (parent === undefined) parent = 'body';
	if (id === undefined) id = 'trntOverlayModal';
	
	this.width = width;
	this.height = height;
	this.color = color;
	this.parent = parent;
	this.parentObj = $(parent);
	this.shrinkage = shrinkFactor;
	this.overlayDiv = $('<div id="' + id + '" />');
	this.marginLeft = parseInt(this.width) < 99 ? this.parentObj.width() * (parseFloat(this.width) / 100.0) / 2 : parseInt(this.width) / 2;
	this.marginLeft = -this.marginLeft;
	this.marginTop = parseInt(this.height) < 99 ? this.parentObj.height() * (parseFloat(this.height) / 100.0) / 2 : parseInt(this.height) / 2;
	this.marginTop = -this.marginTop;
	this.isRevealed = false;
	this.time = time;
	this.cb = null;
	
	this.overlayDiv.css({
		"width": (this.width * this.shrinkage) + "px", 
		"height": (this.height * this.shrinkage) + "px", 
		"background": this.color, 
		"margin-left": (this.marginLeft * this.shrinkage) + "px",
		"margin-top": (this.marginTop * this.shrinkage) + "px",
		"opacity": 0,
		"position": "absolute",
		"top": "50%",
		"left": "50%",
		"overflow": 'hidden'
	});
	
	this.SetContent = function( contentHtml, closeElement, cb ) {
		this.overlayDiv.html( contentHtml );
		this.SetClickEvents( closeElement, cb );
	};
	
	this.SetRemoteContent = function( remoteURL, closeElement, cb ) {
		var _self = this;
		$.get( remoteURL, function( data ) {
			_self.SetContent( data, closeElement, cb );
		});
	};
	
	this.Reveal = function() {
		var _self = this;
		this.isRevealed = true;
		this.overlayDiv.appendTo( this.parent );
		this.overlayDiv.velocity( { width: this.width, height: this.height, "margin-left": this.marginLeft, "margin-top": this.marginTop, opacity: 1 }, { duration: this.time, complete: function() {
			_self.overlayDiv.children('div').velocity( { opacity: 1 }, { duration: _self.time/2 } );
		} } );
	};
	
	this.SetClickEvents = function(closeButton, cb ) {
		var _self = this;
		$(closeButton).click(function(e) {
			e.preventDefault();
			e.stopPropagation();
			_self.GoAway( time );
			if (typeof this.cb === 'function') cb();
		});
	};
	
	this.GoAway = function( time ) {
		var _self = this;
		this.overlayDiv.children('div').velocity( { opacity: 0 }, { duration: _self.time/2, complete: function() {
			_self.overlayDiv.velocity({width: (_self.width * _self.shrinkage), height: (_self.height * _self.shrinkage), "margin-left": (_self.marginLeft * _self.shrinkage), "margin-top": (_self.marginTop * _self.shrinkage), opacity: 0}, {duration: time, complete: function() {
				_self.overlayDiv.remove();
				_self.isRevealed = false;
			}});
		} } );
	};
};

var modal = new trntOverlay(1100, 890, "rgba(0,0,0,0.5)", "body", "torrentModal", 0.9, 600);

$('body').click(function(e) {
	e.preventDefault();
	if (!modal.isRevealed) {
		modal.Reveal();
		modal.SetRemoteContent( "modal-content.html", '.modalCloseBtn' );
	}
});