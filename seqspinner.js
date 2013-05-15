/*!
 * jQuery UI Spinner @VERSION
 * http://jqueryui.com
 *
 * Copyright 2013 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/spinner/
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.widget.js
 *  jquery.ui.button.js
 */
function inosineTM(salt, primer, psq, tsq) {
    var dH = [8.0,9.4,6.6,5.6,8.2,10.9,11.8,6.6,8.8,10.5,10.9,9.4,6.6,8.8,8.2,8.0],
        dS = [21.9,25.5,16.4,15.2,21.0,28.4,29.0,16.4,23.5,26.4,28.4,25.5,18.4,23.5,21.0,21.9],
        inosinedH = [-0.49,4.9,8.9,8.3,3.3,1.0,-7.1,5.4,-2.6,-1.3,3.5,1.1,6.8,3.5,0.5,6.5,1.9,5.9,3.4,-0.1,
0.8,-1.0,4.9,0.8,-0.1,4.3,7.6,5.0,7.6,0.5,-0.1,-5.8,8.3,7.0,-1.3,5.6,-0.1,8.8,0.7,3.3],
        inosinedS = [0.7,15.8,25.5,25.0,11.9,2.4,-21.3,13.7,-8.9,-3.0,10.6,3.2,19.1,21.1,1,3,22.0,8.5,17.4,11.2,2.3,4.3,
-1.0,13.9,4.6,2.3,12.1,22.0,12.6,20.2,1.3,1.0,-16.9,23.8,20.0,-3.0,18.7,1.8,25.4,2.6,11.9]
        rlogk = 1.987 * Math.log(1/primer)
    function b2i(b) {switch (b) {case "A": case "a": return 0; case "C": case "c": return 1;
        case "G": case "g": return 2; case "T": case "t": return 3; default: return null}}
    var i0, i1, dh = 0, ds = 0, idx
    for (var i = 0; i<psq.length-1; i++) {
        i0 = b2i(psq[i]); i1 = b2i(psq[i+1])
        if (!(i0 === null)) {if (!(i1===null)) {idx = i0*4+i1; dh += dH[idx]; ds += dS[idx]}
                 else {i1 = b2i(tsq[i+1]); idx = i0*5+i1; dh += inosinedH[idx]; ds += inosinedS[idx]}}
        else {i0 = b2i(tsq[i]); idx = 20 + (i1*5+i0); dh += inosinedH[idx]; ds += inosinedS[idx]}}
    return 1000 * ((dh - 3.4) / (ds + rlogk)) - 272.9 + 7.21 * Math.log(salt)}

(function( $ ) {

function modifier( fn ) {
	return function() {
		var previous = this.element.val();
		fn.apply( this, arguments );
		if ( previous !== this.element.val() ) {
			this._trigger( "change" );
		}
	};
}

$.widget( "ui.seqspinner", {
	version: "@VERSION",
	defaultElement: "<input>",
	widgetEventPrefix: "seqspin",
	options: {
		icons: {
			down: "ui-icon-triangle-1-s",
			up: "ui-icon-triangle-1-n"
		},
		incremental: true,
		sequence: null,
                right: null
	},

	_create: function() {
		// handle string values that need to be parsed
                var seq = this.options.sequence
		this._setOption( "sequence", seq );
		this._setOption( "right", this.options.right );

		// format the value, but don't constrain

		this._draw();
		this._on( this._events );
                if (this.element.val()) {this.value(this.element.val())}
                else {
                    if (this.options.right) {this.value(seq.slice(0,15))}
                    else {this.value(seq.slice(seq.length-15))}}

		// turning off autocomplete prevents the browser from remembering the
		// value when navigating through history, so we re-enable autocomplete
		// if the page is unloaded before the widget is destroyed. #7790
		this._on( this.window, {
			beforeunload: function() {
				this.element.removeAttr( "autocomplete" );
			}
		});
	},

	_getCreateOptions: function() {
		var options = {},
			element = this.element;

		$.each( [ "sequence", "right" ], function( i, option ) {
			var value = element.attr( option );
			if ( value !== undefined && value.length ) {
				options[ option ] = value;
			}
		});

		return options;
	},

	_events: {
		keydown: function( event ) {
			if ( this._start( event ) && this._keydown( event ) ) {
				event.preventDefault();
			}
		},
		keyup: "_stop",
		focus: function() {
			this.previous = this.element.val();
		},
		blur: function( event ) {
			if ( this.cancelBlur ) {
				delete this.cancelBlur;
				return;
			}

			this._stop();
			if ( this.previous !== this.element.val() ) {
				this._trigger( "change", event );
			}
		},
		mousewheel: function( event, delta ) {
			if ( !delta ) {
				return;
			}
			if ( !this.spinning && !this._start( event ) ) {
				return false;
			}

			this._spin( delta > 0 ? 1 : -1, event );
			clearTimeout( this.mousewheelTimer );
			this.mousewheelTimer = this._delay(function() {
				if ( this.spinning ) {
					this._stop( event );
				}
			}, 100 );
			event.preventDefault();
		},
		"mousedown .ui-spinner-button": function( event ) {
			var previous;

			// We never want the buttons to have focus; whenever the user is
			// interacting with the spinner, the focus should be on the input.
			// If the input is focused then this.previous is properly set from
			// when the input first received focus. If the input is not focused
			// then we need to set this.previous based on the value before spinning.
			previous = this.element[0] === this.document[0].activeElement ?
				this.previous : this.element.val();
			function checkFocus() {
				var isActive = this.element[0] === this.document[0].activeElement;
				if ( !isActive ) {
					this.element.focus();
					this.previous = previous;
					// support: IE
					// IE sets focus asynchronously, so we need to check if focus
					// moved off of the input because the user clicked on the button.
					this._delay(function() {
						this.previous = previous;
					});
				}
			}

			// ensure focus is on (or stays on) the text field
			event.preventDefault();
			checkFocus.call( this );

			// support: IE
			// IE doesn't prevent moving focus even with event.preventDefault()
			// so we set a flag to know when we should ignore the blur event
			// and check (again) if focus moved off of the input.
			this.cancelBlur = true;
			this._delay(function() {
				delete this.cancelBlur;
				checkFocus.call( this );
			});

			if ( this._start( event ) === false ) {
				return;
			}

			this._repeat( null, $( event.currentTarget ).hasClass( "ui-spinner-up" ) ? 1 : -1, event );
		},
		"mouseup .ui-spinner-button": "_stop",
		"mouseenter .ui-spinner-button": function( event ) {
			// button will add ui-state-active if mouse was down while mouseleave and kept down
			if ( !$( event.currentTarget ).hasClass( "ui-state-active" ) ) {
				return;
			}

			if ( this._start( event ) === false ) {
				return false;
			}
			this._repeat( null, $( event.currentTarget ).hasClass( "ui-spinner-up" ) ? 1 : -1, event );
		},
		// TODO: do we really want to consider this a stop?
		// shouldn't we just stop the repeater and wait until mouseup before
		// we trigger the stop event?
		"mouseleave .ui-spinner-button": "_stop"
	},

	_draw: function() {
		var uiSpinner = this.uiSpinner = this.element
			.addClass( "ui-seqspinner-input" )
			.addClass(this.options.right? "rhs" : "lhs").attr( "autocomplete", "off" )
			.wrap( this._uiSpinnerHtml() )
			.parent()
				// add buttons
				.append( this._tempHtml())
				.append( this._buttonHtml() );

		this.element.attr( "role", "seqspinbutton" );

		// button bindings
		this.buttons = uiSpinner.find( ".ui-spinner-button" )
			.attr( "tabIndex", -1 )
			.button()
			.removeClass( "ui-corner-all" );

		// IE 6 doesn't understand height: 50% for the buttons
		// unless the wrapper has an explicit height
		if ( this.buttons.height() > Math.ceil( uiSpinner.height() * 0.5 ) &&
				uiSpinner.height() > 0 ) {
			uiSpinner.height( uiSpinner.height() );
		}

		// disable spinner if element was already disabled
		if ( this.options.disabled ) {
			this.disable();
		}
	},

	_keydown: function( event ) {
		var options = this.options,
			keyCode = $.ui.keyCode;

		switch ( event.keyCode ) {
		case keyCode.UP:
			this._repeat( null, 1, event );
			return true;
		case keyCode.DOWN:
			this._repeat( null, -1, event );
			return true;
		case keyCode.PAGE_UP:
			this._repeat( null, options.page, event );
			return true;
		case keyCode.PAGE_DOWN:
			this._repeat( null, -options.page, event );
			return true;
		}

		return false;
	},

	_uiSpinnerHtml: function() {
		return "<span class='ui-spinner ui-widget ui-widget-content ui-corner-all'></span>";
	},

        _tempHtml: function() {
                return "<span class='ui-seqspinner-temp'></span>"
        },

	_buttonHtml: function() {
		return "" +
			"<a class='ui-spinner-button ui-spinner-up ui-corner-tr'>" +
				"<span class='ui-icon " + this.options.icons.up + "'>&#9650;</span>" +
			"</a>" +
			"<a class='ui-spinner-button ui-spinner-down ui-corner-br'>" +
				"<span class='ui-icon " + this.options.icons.down + "'>&#9660;</span>" +
			"</a>";
	},

	_start: function( event ) {
		if ( !this.spinning && this._trigger( "start", event ) === false ) {
			return false;
		}

		if ( !this.counter ) {
			this.counter = 1;
		}
		this.spinning = true;
		return true;
	},

	_repeat: function( i, steps, event ) {
		i = i || 500;

		clearTimeout( this.timer );
		this.timer = this._delay(function() {
			this._repeat( 40, steps, event );
		}, i );

		this._spin( steps , event );
	},

	_spin: function( step, event ) {
		var value = this.value() || "";

		if ( !this.counter ) {
			this.counter = 1;
		}
                var oldlen = value.length
                var refseq = this.options.sequence
                if (step < 0) {
                    if (this.options.right) {value = value.substr(0,oldlen-1)}
                    else {value = value.slice(1)}}
                else {
                    if (this.options.right) {value = value.concat(refseq.charAt(oldlen))}
                    else {value = refseq.charAt(refseq.length - 1 - oldlen).concat(value)}}

		if ( !this.spinning || this._trigger( "spin", event, { value: value } ) !== false) {
			this._value( value );
			this.counter++;
		}
	},

	_stop: function( event ) {
		if ( !this.spinning ) {
			return;
		}

		clearTimeout( this.timer );
		clearTimeout( this.mousewheelTimer );
		this.counter = 0;
		this.spinning = false;
		this._trigger( "stop", event );
	},

	_setOption: function( key, value ) {
		if ( key === "icons" ) {
			this.buttons.first().find( ".ui-icon" )
				.removeClass( this.options.icons.up )
				.addClass( value.up );
			this.buttons.last().find( ".ui-icon" )
				.removeClass( this.options.icons.down )
				.addClass( value.down );
		}

		this._super( key, value );

		if ( key === "disabled" ) {
			this.widget().toggleClass( "ui-state-disabled", !!value );
			this.element.prop( "disabled", !!value );
			this.buttons.button( value ? "disable" : "enable" );
		}
	},

	_setOptions: modifier(function( options ) {
		this._super( options );
		this._value( this.element.val() );
	}),

	_parse: function( val ) {
		if ( typeof val === "string" && val !== "" ) {
			val = window.Globalize && this.options.numberFormat ?
				Globalize.parseFloat( val, 10, this.options.culture ) : +val;
		}
		return val === "" || isNaN( val ) ? null : val;
	},

	_format: function( value ) {
		if ( value === "" ) {
			return "";
		}
		return window.Globalize && this.options.numberFormat ?
			Globalize.format( value, this.options.numberFormat, this.options.culture ) :
			value;
	},

	// update the value without triggering change
	_value: function( value, allowAny ) {
		this.element.val( value );
                this._refresh()
	},

        _refresh: function () {
            var quer = this.value()
            var seq = this.options.sequence
            var ref = (this.options.right)? seq : seq.slice(seq.length-quer.length)
            this.element.siblings(".ui-seqspinner-temp").text(inosineTM(0.15,1e-10, quer, ref).toFixed(1))
        },

	_destroy: function() {
		this.element
			.removeClass( "ui-spinner-input" )
			.prop( "disabled", false )
			.removeAttr( "autocomplete" )
			.removeAttr( "role" )
		this.uiSpinner.replaceWith( this.element );
	},

	stepUp: modifier(function( steps ) {
		this._stepUp( steps );
	}),
	_stepUp: function( steps ) {
		if ( this._start() ) {
			this._spin(1);
			this._stop();
		}
	},

	stepDown: modifier(function( steps ) {
		this._stepDown( steps );
	}),
	_stepDown: function( steps ) {
		if ( this._start() ) {
			this._spin(-1);
			this._stop();
		}
	},

	pageUp: modifier(function( pages ) {
		this._stepUp( (pages || 1) );
	}),

	pageDown: modifier(function( pages ) {
		this._stepDown( (pages || 1) * this.options.page );
	}),

	value: function( newVal ) {
		if ( !arguments.length ) { return this.element.val() }
		modifier( this._value ).call( this, newVal );
	},

	widget: function() {
		return this.uiSpinner;
	}
});

}( jQuery ) );
