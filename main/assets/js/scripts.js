// Utility function
function Util () {};

/* 
	class manipulation functions
*/
Util.hasClass = function(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.getAttribute('class').match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	if (el.classList) el.classList.add(classList[0]);
  else if (!Util.hasClass(el, classList[0])) el.setAttribute('class', el.getAttribute('class') +  " " + classList[0]);
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	if (el.classList) el.classList.remove(classList[0]);	
	else if(Util.hasClass(el, classList[0])) {
		var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
    el.setAttribute('class', el.getAttribute('class').replace(reg, ' '));
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* 
  DOM manipulation
*/
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length,
    returnArr = [];

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* 
	Animate height of an element
*/
Util.setHeight = function(start, to, element, duration, cb, timeFunction) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = parseInt((progress/duration)*change + start);
    if(timeFunction) {
      val = Math[timeFunction](progress, start, to - start, duration);
    }
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	if(cb) cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* 
	Smooth Scroll
*/

Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* 
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* 
  Misc
*/

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
    return jsProperty in document.body.style;
  }
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* 
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1); 
		return null;
	};
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

/* 
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) { 
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

Math.easeOutElastic = function (t, b, c, d) {
  var s=1.70158;var p=d*0.7;var a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (c/a);
  return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};


/* JS Utility Classes */

// make focus ring visible only for keyboard navigation (i.e., tab key) 
(function() {
  var focusTab = document.getElementsByClassName('js-tab-focus'),
    shouldInit = false,
    outlineStyle = false,
    eventDetected = false;

  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusStyle(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
    outlineStyle = false;
    eventDetected = true;
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusStyle(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
    outlineStyle = true;
  };

  function resetFocusStyle(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };

  function initFocusTabs() {
    if(shouldInit) {
      if(eventDetected) resetFocusStyle(outlineStyle);
      return;
    }
    shouldInit = focusTab.length > 0;
    window.addEventListener('mousedown', detectClick);
  };

  initFocusTabs();
  window.addEventListener('initFocusTabs', initFocusTabs);
}());

function resetFocusTabsStyle() {
  window.dispatchEvent(new CustomEvent('initFocusTabs'));
};
// File#: _1_anim-menu-btn
// Usage: codyhouse.co/license
(function() {
	var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
	if( menuBtns.length > 0 ) {
		for(var i = 0; i < menuBtns.length; i++) {(function(i){
			initMenuBtn(menuBtns[i]);
		})(i);}

		function initMenuBtn(btn) {
			btn.addEventListener('click', function(event){	
				event.preventDefault();
				var status = !Util.hasClass(btn, 'anim-menu-btn--state-b');
				Util.toggleClass(btn, 'anim-menu-btn--state-b', status);
				// emit custom event
				var event = new CustomEvent('anim-menu-btn-clicked', {detail: status});
				btn.dispatchEvent(event);
			});
		};
	}
}());
// File#: _1_looping_tabs
// Usage: codyhouse.co/license
(function() { 
  var LoopTab = function(opts) {
    this.options = Util.extend(LoopTab.defaults , opts);
		this.element = this.options.element;
		this.tabList = this.element.getElementsByClassName('js-loop-tabs__controls')[0];
		this.listItems = this.tabList.getElementsByTagName('li');
		this.triggers = this.tabList.getElementsByTagName('a');
		this.panelsList = this.element.getElementsByClassName('js-loop-tabs__panels')[0];
    this.panels = Util.getChildrenByClassName(this.panelsList, 'js-loop-tabs__panel');
    this.assetsList = this.element.getElementsByClassName('js-loop-tabs__assets')[0];
		this.assets = this.assetsList.getElementsByTagName('li');
		this.videos = getVideoElements(this);
    this.panelShowClass = 'loop-tabs__panel--selected';
		this.assetShowClass = 'loop-tabs__asset--selected';
		this.assetExitClass = 'loop-tabs__asset--exit';
    this.controlActiveClass = 'loop-tabs__control--selected';
    // autoplay
    this.autoplayPaused = false;
		this.loopTabAutoId = false;
		this.loopFillAutoId = false;
		this.loopFill = 0;
		initLoopTab(this);
	};
	
	function getVideoElements(tab) {
		var videos = [];
		for(var i = 0; i < tab.assets.length; i++) {
			var video = tab.assets[i].getElementsByTagName('video');
			videos[i] = video.length > 0 ? video[0] : false;
		}
		return videos;
	};
  
  function initLoopTab(tab) {
    //set initial aria attributes
		tab.tabList.setAttribute('role', 'tablist');
		for( var i = 0; i < tab.triggers.length; i++) {
			var bool = Util.hasClass(tab.triggers[i], tab.controlActiveClass),
        panelId = tab.panels[i].getAttribute('id');
			tab.listItems[i].setAttribute('role', 'presentation');
			Util.setAttributes(tab.triggers[i], {'role': 'tab', 'aria-selected': bool, 'aria-controls': panelId, 'id': 'tab-'+panelId});
			Util.addClass(tab.triggers[i], 'js-loop-tabs__trigger'); 
      Util.setAttributes(tab.panels[i], {'role': 'tabpanel', 'aria-labelledby': 'tab-'+panelId});
      Util.toggleClass(tab.panels[i], tab.panelShowClass, bool);
			Util.toggleClass(tab.assets[i], tab.assetShowClass, bool);
			
			resetVideo(tab, i, bool); // play/pause video if available

			if(!bool) tab.triggers[i].setAttribute('tabindex', '-1'); 
		}
		// add autoplay-off class if needed
		!tab.options.autoplay && Util.addClass(tab.element, 'loop-tabs--autoplay-off');
		//listen for Tab events
		initLoopTabEvents(tab);
  };

  function initLoopTabEvents(tab) {
		if(tab.options.autoplay) { 
			initLoopTabAutoplay(tab); // init autoplay
			// pause autoplay if user is interacting with the tabs
			tab.element.addEventListener('focusin', function(event){
				pauseLoopTabAutoplay(tab);
				tab.autoplayPaused = true;
			});
			tab.element.addEventListener('focusout', function(event){
				tab.autoplayPaused = false;
				initLoopTabAutoplay(tab);
			});
		}

    //click on a new tab -> select content
		tab.tabList.addEventListener('click', function(event) {
			if( event.target.closest('.js-loop-tabs__trigger') ) triggerLoopTab(tab, event.target.closest('.js-loop-tabs__trigger'), event);
		});
		
    //arrow keys to navigate through tabs 
		tab.tabList.addEventListener('keydown', function(event) {
			if( !event.target.closest('.js-loop-tabs__trigger') ) return;
			if( event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright' ) {
				pauseLoopTabAutoplay(tab);
				selectNewLoopTab(tab, 'next', true);
			} else if( event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft' ) {
				pauseLoopTabAutoplay(tab);
				selectNewLoopTab(tab, 'prev', true);
			}
		});
  };

  function initLoopTabAutoplay(tab) {
		if(!tab.options.autoplay || tab.autoplayPaused) return;
		tab.loopFill = 0;
		var selectedTab = tab.tabList.getElementsByClassName(tab.controlActiveClass)[0];
		// reset css variables
		for(var i = 0; i < tab.triggers.length; i++) {
			if(cssVariableSupport) tab.triggers[i].style.setProperty('--loop-tabs-filling', 0);
		}
		
		tab.loopTabAutoId = setTimeout(function(){
      selectNewLoopTab(tab, 'next', false);
		}, tab.options.autoplayInterval);
		
		if(cssVariableSupport) { // tab fill effect
			tab.loopFillAutoId = setInterval(function(){
				tab.loopFill = tab.loopFill + 0.005;
				selectedTab.style.setProperty('--loop-tabs-filling', tab.loopFill);
			}, tab.options.autoplayInterval/200);
		}
  };

  function pauseLoopTabAutoplay(tab) { // pause autoplay
    if(tab.loopTabAutoId) {
			clearTimeout(tab.loopTabAutoId);
			tab.loopTabAutoId = false;
			clearInterval(tab.loopFillAutoId);
			tab.loopFillAutoId = false;
			// make sure the filling line is scaled up
			var selectedTab = tab.tabList.getElementsByClassName(tab.controlActiveClass);
			if(selectedTab.length > 0) selectedTab[0].style.setProperty('--loop-tabs-filling', 1);
		}
  };

  function selectNewLoopTab(tab, direction, bool) {
    var selectedTab = tab.tabList.getElementsByClassName(tab.controlActiveClass)[0],
			index = Util.getIndexInArray(tab.triggers, selectedTab);
		index = (direction == 'next') ? index + 1 : index - 1;
		//make sure index is in the correct interval 
		//-> from last element go to first using the right arrow, from first element go to last using the left arrow
		if(index < 0) index = tab.listItems.length - 1;
		if(index >= tab.listItems.length) index = 0;	
		triggerLoopTab(tab, tab.triggers[index]);
		bool && tab.triggers[index].focus();
  };

  function triggerLoopTab(tab, tabTrigger, event) {
		pauseLoopTabAutoplay(tab);
		event && event.preventDefault();	
		var index = Util.getIndexInArray(tab.triggers, tabTrigger);
		//no need to do anything if tab was already selected
		if(Util.hasClass(tab.triggers[index], tab.controlActiveClass)) return;
		
		for( var i = 0; i < tab.triggers.length; i++) {
			var bool = (i == index),
				exit = Util.hasClass(tab.triggers[i], tab.controlActiveClass);
			Util.toggleClass(tab.triggers[i], tab.controlActiveClass, bool);
      Util.toggleClass(tab.panels[i], tab.panelShowClass, bool);
			Util.toggleClass(tab.assets[i], tab.assetShowClass, bool);
			Util.toggleClass(tab.assets[i], tab.assetExitClass, exit);
			tab.triggers[i].setAttribute('aria-selected', bool);
			bool ? tab.triggers[i].setAttribute('tabindex', '0') : tab.triggers[i].setAttribute('tabindex', '-1');

			resetVideo(tab, i, bool); // play/pause video if available

			// listen for the end of animation on asset element and remove exit class
			if(exit) {(function(i){
				tab.assets[i].addEventListener('transitionend', function cb(event){
					tab.assets[i].removeEventListener('transitionend', cb);
					Util.removeClass(tab.assets[i], tab.assetExitClass);
				});
			})(i);}
		}
    
    // restart tab autoplay
    initLoopTabAutoplay(tab);
	};

	function resetVideo(tab, i, bool) {
		if(tab.videos[i]) {
			if(bool) {
				tab.videos[i].play();
			} else {
				tab.videos[i].pause();
				tab.videos[i].currentTime = 0;
			} 
		}
	};

  LoopTab.defaults = {
    element : '',
    autoplay : true,
    autoplayInterval: 5000
  };

  //initialize the Tab objects
	var loopTabs = document.getElementsByClassName('js-loop-tabs');
	if( loopTabs.length > 0 ) {
		var reducedMotion = Util.osHasReducedMotion(),
			cssVariableSupport = ('CSS' in window) && Util.cssSupports('color', 'var(--var)');
		for( var i = 0; i < loopTabs.length; i++) {
			(function(i){
        var autoplay = (loopTabs[i].getAttribute('data-autoplay') && loopTabs[i].getAttribute('data-autoplay') == 'off' || reducedMotion) ? false : true,
        autoplayInterval = (loopTabs[i].getAttribute('data-autoplay-interval')) ? loopTabs[i].getAttribute('data-autoplay-interval') : 5000;
        new LoopTab({element: loopTabs[i], autoplay : autoplay, autoplayInterval : autoplayInterval});
      })(i);
		}
	}
}());
// File#: _1_sliding-panels
// Usage: codyhouse.co/license
(function() {
  var SlidingPanels = function(element) {
    this.element = element;
    this.itemsList = this.element.getElementsByClassName('js-s-panels__projects-list');
    this.items = this.itemsList[0].getElementsByClassName('js-s-panels__project-preview');
    this.navigationToggle = this.element.getElementsByClassName('js-s-panels__nav-control');
    this.navigation = this.element.getElementsByClassName('js-s-panels__nav-wrapper');
    this.transitionLayer = this.element.getElementsByClassName('js-s-panels__overlay-layer');
    this.selectedSection = false; // will be used to store the visible project content section
    this.animating = false;
    // aria labels for the navigationToggle button
    this.toggleAriaLabels = ['Toggle navigation', 'Close Project'];
    initSlidingPanels(this);
  };

  function initSlidingPanels(element) {
    // detect click on toggle menu
    if(element.navigationToggle.length > 0 && element.navigation.length > 0) {
      element.navigationToggle[0].addEventListener('click', function(event) {
        if(element.animating) return;
        
        // if project is open -> close project
        if(closeProjectIfVisible(element)) return;
        
        // toggle navigation
        var openNav = Util.hasClass(element.navigation[0], 'is-hidden');
        toggleNavigation(element, openNav);
      });
    }

    // open project
    element.element.addEventListener('click', function(event) {
      if(element.animating) return;

      var link = event.target.closest('.js-s-panels__project-control');
      if(!link) return;
      event.preventDefault();
      openProject(element, event.target.closest('.js-s-panels__project-preview'), link.getAttribute('href').replace('#', ''));
    });
  };

  // check if there's a visible project to close and close it
  function closeProjectIfVisible(element) {
    var visibleProject = element.element.getElementsByClassName('s-panels__project-preview--selected');
    if(visibleProject.length > 0) {
      element.animating = true;
      closeProject(element);
      return true;
    }

    return false;
  };

  function toggleNavigation(element, openNavigation) {
    element.animating = true;
    if(openNavigation) Util.removeClass(element.navigation[0], 'is-hidden');
    slideProjects(element, openNavigation, false, function(){
      element.animating = false;
      if(!openNavigation) Util.addClass(element.navigation[0], 'is-hidden');
    });
    Util.toggleClass(element.navigationToggle[0], 's-panels__nav-control--arrow-down', openNavigation);
  };

  function openProject(element, project, id) {
    element.animating = true;
    var projectIndex = Util.getIndexInArray(element.items, project);
    // hide navigation
    Util.removeClass(element.itemsList[0], 'bg-opacity-0');
    // expand selected projects
    Util.addClass(project, 's-panels__project-preview--selected');
    // hide remaining projects
    slideProjects(element, true, projectIndex, function() {
      // reveal section content
      element.selectedSection = document.getElementById(id);
      if(element.selectedSection) Util.removeClass(element.selectedSection, 'is-hidden');
      element.animating = false;
      // trigger a custom event - this can be used to init the project content (if required)
		  element.element.dispatchEvent(new CustomEvent('slidingPanelOpen', {detail: projectIndex}));
    });
    // modify toggle button appearance
    Util.addClass(element.navigationToggle[0], 's-panels__nav-control--close');
    // modify toggle button aria-label
    element.navigationToggle[0].setAttribute('aria-label', element.toggleAriaLabels[1]);
  };

  function closeProject(element) {
    // remove transitions from projects
    toggleTransitionProjects(element, true);
    // hide navigation
    Util.removeClass(element.itemsList[0], 'bg-opacity-0');
    // reveal transition layer
    Util.addClass(element.transitionLayer[0], 's-panels__overlay-layer--visible');
    // wait for end of transition layer effect
    element.transitionLayer[0].addEventListener('transitionend', function cb(event) {
      if(event.propertyName != 'opacity') return;
      element.transitionLayer[0].removeEventListener('transitionend', cb);
      // update projects classes
      resetProjects(element);

      setTimeout(function(){
        // hide transition layer
        Util.removeClass(element.transitionLayer[0], 's-panels__overlay-layer--visible');
        // reveal projects
        slideProjects(element, false, false, function() {
          Util.addClass(element.itemsList[0], 'bg-opacity-0');
          element.animating = false;
        });
      }, 200);
    });

    // modify toggle button appearance
    Util.removeClass(element.navigationToggle[0], 's-panels__nav-control--close');
    // modify toggle button aria-label
    element.navigationToggle[0].setAttribute('aria-label', element.toggleAriaLabels[0]);
  };

  function slideProjects(element, openNav, exclude, cb) {
    // projects will slide out in a random order
    var randomList = getRandomList(element.items.length, exclude);
    for(var i = 0; i < randomList.length; i++) {(function(i){
      setTimeout(function(){
        Util.toggleClass(element.items[randomList[i]], 's-panels__project-preview--hide', openNav);
        toggleProjectAccessibility(element.items[randomList[i]], openNav);
        if(cb && i == randomList.length - 1) {
          // last item to be animated -> execute callback function at the end of the animation
          element.items[randomList[i]].addEventListener('transitionend', function cbt() {
            if(event.propertyName != 'transform') return;
            if(cb) cb();
            element.items[randomList[i]].removeEventListener('transitionend', cbt);
          });
        }
      }, i*100);
    })(i);}
  };

  function toggleTransitionProjects(element, bool) {
    // remove transitions from project elements
    for(var i = 0; i < element.items.length; i++) {
      Util.toggleClass(element.items[i], 's-panels__project-preview--no-transition', bool);
    }
  };

  function resetProjects(element) {
    // reset projects classes -> remove selected/no-transition class + add hide class
    for(var i = 0; i < element.items.length; i++) {
      Util.removeClass(element.items[i], 's-panels__project-preview--selected s-panels__project-preview--no-transition');
      Util.addClass(element.items[i], 's-panels__project-preview--hide');
    }

    // hide project content
    if(element.selectedSection) Util.addClass(element.selectedSection, 'is-hidden');
    element.selectedSection = false;
  };

  function getRandomList(maxVal, exclude) {
    // get list of random integer from 0 to (maxVal - 1) excluding (exclude) if defined
    var uniqueRandoms = [];
    var randomArray = [];
    
    function makeUniqueRandom() {
      // refill the array if needed
      if (!uniqueRandoms.length) {
        for (var i = 0; i < maxVal; i++) {
          if(exclude === false || i != exclude) uniqueRandoms.push(i);
        }
      }
      var index = Math.floor(Math.random() * uniqueRandoms.length);
      var val = uniqueRandoms[index];
      // now remove that value from the array
      uniqueRandoms.splice(index, 1);
      return val;
    }

    for(var j = 0; j < maxVal; j++) {
      randomArray.push(makeUniqueRandom());
    }

    return randomArray;
  };

  function toggleProjectAccessibility(project, bool) {
    bool ? project.setAttribute('aria-hidden', 'true') : project.removeAttribute('aria-hidden');
    var link = project.getElementsByClassName('js-s-panels__project-control');
    if(link.length > 0) {
      bool ? link[0].setAttribute('tabindex', '-1') : link[0].removeAttribute('tabindex');
    }
  };

  //initialize the SlidingPanels objects
	var slidingPanels = document.getElementsByClassName('js-s-panels');
	if( slidingPanels.length > 0 ) {
		for( var i = 0; i < slidingPanels.length; i++) {
			(function(i){new SlidingPanels(slidingPanels[i]);})(i);
		}
	}
}());
// File#: _1_swipe-content
(function() {
	var SwipeContent = function(element) {
		this.element = element;
		this.delta = [false, false];
		this.dragging = false;
		this.intervalId = false;
		initSwipeContent(this);
	};

	function initSwipeContent(content) {
		content.element.addEventListener('mousedown', handleEvent.bind(content));
		content.element.addEventListener('touchstart', handleEvent.bind(content));
	};

	function initDragging(content) {
		//add event listeners
		content.element.addEventListener('mousemove', handleEvent.bind(content));
		content.element.addEventListener('touchmove', handleEvent.bind(content));
		content.element.addEventListener('mouseup', handleEvent.bind(content));
		content.element.addEventListener('mouseleave', handleEvent.bind(content));
		content.element.addEventListener('touchend', handleEvent.bind(content));
	};

	function cancelDragging(content) {
		//remove event listeners
		if(content.intervalId) {
			(!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
			content.intervalId = false;
		}
		content.element.removeEventListener('mousemove', handleEvent.bind(content));
		content.element.removeEventListener('touchmove', handleEvent.bind(content));
		content.element.removeEventListener('mouseup', handleEvent.bind(content));
		content.element.removeEventListener('mouseleave', handleEvent.bind(content));
		content.element.removeEventListener('touchend', handleEvent.bind(content));
	};

	function handleEvent(event) {
		switch(event.type) {
			case 'mousedown':
			case 'touchstart':
				startDrag(this, event);
				break;
			case 'mousemove':
			case 'touchmove':
				drag(this, event);
				break;
			case 'mouseup':
			case 'mouseleave':
			case 'touchend':
				endDrag(this, event);
				break;
		}
	};

	function startDrag(content, event) {
		content.dragging = true;
		// listen to drag movements
		initDragging(content);
		content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
		// emit drag start event
		emitSwipeEvents(content, 'dragStart', content.delta, event.target);
	};

	function endDrag(content, event) {
		cancelDragging(content);
		// credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
		var dx = parseInt(unify(event).clientX), 
	    dy = parseInt(unify(event).clientY);
	  
	  // check if there was a left/right swipe
		if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
	    var s = getSign(dx - content.delta[0]);
			
			if(Math.abs(dx - content.delta[0]) > 30) {
				(s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);	
			}
	    
	    content.delta[0] = false;
	  }
		// check if there was a top/bottom swipe
	  if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
	  	var y = getSign(dy - content.delta[1]);

	  	if(Math.abs(dy - content.delta[1]) > 30) {
	    	(y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
	    }

	    content.delta[1] = false;
	  }
		// emit drag end event
	  emitSwipeEvents(content, 'dragEnd', [dx, dy]);
	  content.dragging = false;
	};

	function drag(content, event) {
		if(!content.dragging) return;
		// emit dragging event with coordinates
		(!window.requestAnimationFrame) 
			? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250) 
			: content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
	};

	function emitDrag(event) {
		emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
	};

	function unify(event) { 
		// unify mouse and touch events
		return event.changedTouches ? event.changedTouches[0] : event; 
	};

	function emitSwipeEvents(content, eventName, detail, el) {
		var trigger = false;
		if(el) trigger = el;
		// emit event with coordinates
		var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
		content.element.dispatchEvent(event);
	};

	function getSign(x) {
		if(!Math.sign) {
			return ((x > 0) - (x < 0)) || +x;
		} else {
			return Math.sign(x);
		}
	};

	window.SwipeContent = SwipeContent;
	
	//initialize the SwipeContent objects
	var swipe = document.getElementsByClassName('js-swipe-content');
	if( swipe.length > 0 ) {
		for( var i = 0; i < swipe.length; i++) {
			(function(i){new SwipeContent(swipe[i]);})(i);
		}
	}
}());
// File#: _1_switch-icon
// Usage: codyhouse.co/license
(function() {
	var switchIcons = document.getElementsByClassName('js-switch-icon');
	if( switchIcons.length > 0 ) {
		for(var i = 0; i < switchIcons.length; i++) {(function(i){
			if( !Util.hasClass(switchIcons[i], 'switch-icon--hover') ) initswitchIcons(switchIcons[i]);
		})(i);}

		function initswitchIcons(btn) {
			btn.addEventListener('click', function(event){	
				event.preventDefault();
				var status = !Util.hasClass(btn, 'switch-icon--state-b');
				Util.toggleClass(btn, 'switch-icon--state-b', status);
				// emit custom event
				var event = new CustomEvent('switch-icon-clicked', {detail: status});
				btn.dispatchEvent(event);
			});
		};
	}
}());
// File#: _2_flexi-header
// Usage: codyhouse.co/license
(function() {
  var flexHeader = document.getElementsByClassName('js-f-header');
	if(flexHeader.length > 0) {
		var menuTrigger = flexHeader[0].getElementsByClassName('js-anim-menu-btn')[0],
			firstFocusableElement = getMenuFirstFocusable();

		// we'll use these to store the node that needs to receive focus when the mobile menu is closed 
		var focusMenu = false;

		resetFlexHeaderOffset();

		menuTrigger.addEventListener('anim-menu-btn-clicked', function(event){
			toggleMenuNavigation(event.detail);
		});

		// listen for key events
		window.addEventListener('keyup', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
					focusMenu = menuTrigger; // move focus to menu trigger when menu is close
					menuTrigger.click();
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-f-header')) menuTrigger.click();
			}
		});

		// listen for resize
		var resizingId = false;
		window.addEventListener('resize', function() {
			clearTimeout(resizingId);
			resizingId = setTimeout(doneResizing, 500);
		});

		function getMenuFirstFocusable() {
			var focusableEle = flexHeader[0].getElementsByClassName('f-header__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
			for(var i = 0; i < focusableEle.length; i++) {
				if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
					firstFocusable = focusableEle[i];
					break;
				}
			}

			return firstFocusable;
    };
    
    function isVisible(element) {
      return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
		};

		function doneResizing() {
			if( !isVisible(menuTrigger) && Util.hasClass(flexHeader[0], 'f-header--expanded')) {
				menuTrigger.click();
			}
			resetFlexHeaderOffset();
		};
		
		function toggleMenuNavigation(bool) { // toggle menu visibility on small devices
			Util.toggleClass(document.getElementsByClassName('f-header__nav')[0], 'f-header__nav--is-visible', bool);
			Util.toggleClass(flexHeader[0], 'f-header--expanded', bool);
			menuTrigger.setAttribute('aria-expanded', bool);
			if(bool) firstFocusableElement.focus(); // move focus to first focusable element
			else if(focusMenu) {
				focusMenu.focus();
				focusMenu = false;
			}
		};

		function resetFlexHeaderOffset() {
			// on mobile -> update max height of the flexi header based on its offset value (e.g., if there's a fixed pre-header element)
			document.documentElement.style.setProperty('--f-header-offset', flexHeader[0].getBoundingClientRect().top+'px');
		};
	}
}());
// File#: _2_main-header-v3
// Usage: codyhouse.co/license
(function() {
	var mainHeader = document.getElementsByClassName('js-header-v3');
	if(mainHeader.length > 0) {
		var menuTrigger = mainHeader[0].getElementsByClassName('js-toggle-menu')[0],
			searchTrigger = mainHeader[0].getElementsByClassName('js-toggle-search'),
			navigation = mainHeader[0].getElementsByClassName('header-v3__nav')[0];

		// we'll use these to store the node that needs to receive focus when the mobile menu/search input are closed 
		var focusSearch = false,
			focusMenu = false;
			
		// set delays for list items inside navigation -> mobile animation
		var navItems = Util.getChildrenByClassName(navigation.getElementsByClassName('header-v3__nav-list')[0], 'header-v3__nav-item');
		for(var i = 0; i < navItems.length; i++) {
			setTransitionDelay(navItems[i], i);
		}
		// toggle navigation on mobile
		menuTrigger.addEventListener('switch-icon-clicked', function(event){ // toggle menu visibility an small devices
			toggleNavigation(event.detail);
		});
		// toggle search on desktop
		if(searchTrigger.length > 0) {
			searchTrigger[0].addEventListener('switch-icon-clicked', function(event){ // toggle menu visibility an small devices
				toggleSearch(event.detail);
			});
		}
		
		window.addEventListener('keyup', function(event){
			// listen for esc key events
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
					focusMenu = menuTrigger; // move focus to menu trigger when menu is close
					menuTrigger.click();
				}
				// close search if open
				if(searchTrigger.length > 0 && searchTrigger[0].getAttribute('aria-expanded') == 'true' && isVisible(searchTrigger[0])) {
					focusSearch = searchTrigger[0]; // move focus to search trigger when search is close
					searchTrigger[0].click();
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-header-v3')) menuTrigger.click();
			}
		});

		// listen for resize
		var resizingId = false;
		window.addEventListener('resize', function() {
			clearTimeout(resizingId);
			resizingId = setTimeout(doneResizing, 300);
		});

		function toggleNavigation(bool) {
			Util.addClass(navigation, 'header-v3__nav--is-visible');
			Util.addClass(menuTrigger, 'switch-icon--disabled');
			menuTrigger.setAttribute('aria-expanded', bool);
			// animate navigation height
			var finalHeight = bool ? window.innerHeight: 0,
				initHeight = bool ? 0 : window.innerHeight; 
			navigation.style.height = initHeight+'px';

			setTimeout(function(){
				navigation.style.height = finalHeight+'px';
				Util.toggleClass(navigation, 'header-v3__nav--animate-children', bool);
			}, 50);

			navigation.addEventListener('transitionend', function cb(event){
				if (event.propertyName !== 'height') return;
				if(finalHeight > 0) {
					var firstFocusableElement = getMenuFirstFocusable();
					firstFocusableElement.focus(); // move focus to first focusable element
				} else {
					Util.removeClass(navigation, 'header-v3__nav--is-visible header-v3__nav--animate-children');
					if(focusMenu) { // we may need to move the focus to a new element
						focusMenu.focus();
						focusMenu = false;
					}
				}
				
				navigation.removeEventListener('transitionend', cb);
				navigation.removeAttribute('style');
				Util.removeClass(menuTrigger, 'switch-icon--disabled');
			});
			// toggle expanded class to header
			Util.toggleClass(mainHeader[0], 'header-v3--expanded', bool);
		};

		function toggleSearch(bool){
			Util.addClass(searchTrigger[0], 'switch-icon--disabled');
			Util.toggleClass(mainHeader[0], 'header-v3--show-search', bool);
			searchTrigger[0].setAttribute('aria-expanded', bool);
			mainHeader[0].addEventListener('transitionend', function cb(){
				mainHeader[0].removeEventListener('transitionend', cb);
				Util.removeClass(searchTrigger[0], 'switch-icon--disabled');
				if(bool) mainHeader[0].getElementsByClassName('header-v3__nav-item--search-form')[0].getElementsByTagName('input')[0].focus();
				else if(focusSearch) {// move focus to a new element when closing the search
					focusSearch.focus();
					focusSearch = false;
				}
			});

			// toggle expanded class to header
			Util.toggleClass(mainHeader[0], 'header-v3--expanded', bool);
		};

		function doneResizing() {
			// check if main nav is visible (small devices only)
			if( !isVisible(menuTrigger) && menuTrigger.getAttribute('aria-expanded') == 'true') menuTrigger.click();
			// check if search input is visible
			if( searchTrigger.length > 0 && !isVisible(searchTrigger[0]) && searchTrigger[0].getAttribute('aria-expanded') == 'true') searchTrigger[0].click();
		};

		function getMenuFirstFocusable() {
			var focusableEle = mainHeader[0].getElementsByClassName('header-v3__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
			for(var i = 0; i < focusableEle.length; i++) {
				if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
					firstFocusable = focusableEle[i];
					break;
				}
			}

			return firstFocusable;
		};

		function setTransitionDelay(element, index) {
			element.style.transitionDelay = parseFloat((index/20) + 0.1).toFixed(2)+'s';
		};

		function isVisible(element) {
			return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
		};
	}
}());
// File#: _2_slideshow-preview-mode
// Usage: codyhouse.co/license
(function() {
	var SlideshowPrew = function(opts) {
		this.options = Util.extend(SlideshowPrew.defaults , opts);
		this.element = this.options.element;
		this.list = this.element.getElementsByClassName('js-slideshow-pm__list')[0];
		this.items = this.list.getElementsByClassName('js-slideshow-pm__item');
		this.controls = this.element.getElementsByClassName('js-slideshow-pm__control'); 
		this.selectedSlide = 0;
		this.autoplayId = false;
		this.autoplayPaused = false;
		this.navigation = false;
		this.navCurrentLabel = false;
		this.ariaLive = false;
		this.moveFocus = false;
		this.animating = false;
		this.supportAnimation = Util.cssSupports('transition');
		this.itemWidth = false;
		this.itemMargin = false;
		this.containerWidth = false;
		this.resizeId = false;
		// we will need this to implement keyboard nav
		this.firstFocusable = false;
		this.lastFocusable = false;
		// fallback for browsers not supporting flexbox
		initSlideshow(this);
		initSlideshowEvents(this);
		initAnimationEndEvents(this);
		Util.addClass(this.element, 'slideshow-pm--js-loaded');
	};

	SlideshowPrew.prototype.showNext = function(autoplay) {
		showNewItem(this, this.selectedSlide + 1, 'next', autoplay);
	};

	SlideshowPrew.prototype.showPrev = function() {
		showNewItem(this, this.selectedSlide - 1, 'prev');
	};

	SlideshowPrew.prototype.showItem = function(index) {
		showNewItem(this, index, false);
	};

	SlideshowPrew.prototype.startAutoplay = function() {
		var self = this;
		if(this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
			self.autoplayId = setInterval(function(){
				self.showNext(true);
			}, self.options.autoplayInterval);
		}
	};

	SlideshowPrew.prototype.pauseAutoplay = function() {
		var self = this;
		if(this.options.autoplay) {
			clearInterval(self.autoplayId);
			self.autoplayId = false;
		}
	};

	function initSlideshow(slideshow) { // basic slideshow settings
		// if no slide has been selected -> select the first one
		if(slideshow.element.getElementsByClassName('slideshow-pm__item--selected').length < 1) Util.addClass(slideshow.items[0], 'slideshow-pm__item--selected');
		slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('slideshow-pm__item--selected')[0]);
		// now set translate value to the container element
		setTranslateValue(slideshow);
		setTranslate(slideshow);
		resetSlideshowNav(slideshow, 0, slideshow.selectedSlide);
		setFocusableElements(slideshow);
		// if flexbox is not supported, set a width for the list element
		if(!flexSupported) resetSlideshowFlexFallback(slideshow);
		// now add class to animate while translating
		setTimeout(function(){Util.addClass(slideshow.list, 'slideshow-pm__list--has-transition');}, 50);
		// add arai-hidden to not selected slides
		for(var i = 0; i < slideshow.items.length; i++) {
			(i == slideshow.selectedSlide) ? slideshow.items[i].removeAttribute('aria-hidden') : slideshow.items[i].setAttribute('aria-hidden', 'true');
		}
		// create an element that will be used to announce the new visible slide to SR
		var srLiveArea = document.createElement('div');
		Util.setAttributes(srLiveArea, {'class': 'sr-only js-slideshow-pm__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
		slideshow.element.appendChild(srLiveArea);
		slideshow.ariaLive = srLiveArea;
	};

	function initSlideshowEvents(slideshow) {
		// if slideshow navigation is on -> create navigation HTML and add event listeners
		if(slideshow.options.navigation) {
			var navigation = document.createElement('ol'),
				navChildren = '';
			
			navigation.setAttribute('class', 'slideshow-pm__navigation');
			for(var i = 0; i < slideshow.items.length; i++) {
				var className = (i == slideshow.selectedSlide) ? 'class="slideshow-pm__nav-item slideshow-pm__nav-item--selected js-slideshow-pm__nav-item"' :  'class="slideshow-pm__nav-item js-slideshow-pm__nav-item"',
					navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="sr-only js-slideshow-pm__nav-current-label">Current Item</span>' : '';
				navChildren = navChildren + '<li '+className+'><button class="reset"><span class="sr-only">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
			}

			navigation.innerHTML = navChildren;
			slideshow.navCurrentLabel = navigation.getElementsByClassName('js-slideshow-pm__nav-current-label')[0]; 
			slideshow.element.appendChild(navigation);
			slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow-pm__nav-item');

			navigation.addEventListener('click', function(event){
				navigateSlide(slideshow, event, true);
			});
			navigation.addEventListener('keyup', function(event){
				navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
			});
		}
		// slideshow arrow controls
		if(slideshow.controls.length > 0) {
			slideshow.controls[0].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showPrev();
				updateAriaLive(slideshow);
			});
			slideshow.controls[1].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showNext(false);
				updateAriaLive(slideshow);
			});
		}
		// navigate slideshow when clicking on preview
		if(slideshow.options.prewNav) {
			slideshow.element.addEventListener('click', function(event){
				var item = event.target.closest('.js-slideshow-pm__item');
				if(item && !Util.hasClass(item, 'slideshow-pm__item--selected')) {
					slideshow.showItem(Util.getIndexInArray(slideshow.items, item));
				}
			});
		}
		// swipe events
		if(slideshow.options.swipe) {
			//init swipe
			new SwipeContent(slideshow.element);
			slideshow.element.addEventListener('swipeLeft', function(event){
				slideshow.showNext(false);
			});
			slideshow.element.addEventListener('swipeRight', function(event){
				slideshow.showPrev();
			});
		}
		// autoplay
		if(slideshow.options.autoplay) {
			slideshow.startAutoplay();
			// pause autoplay if user is interacting with the slideshow
			slideshow.element.addEventListener('mouseenter', function(event){
				slideshow.pauseAutoplay();
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('focusin', function(event){
				slideshow.pauseAutoplay();
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('mouseleave', function(event){
				slideshow.autoplayPaused = false;
				slideshow.startAutoplay();
			});
			slideshow.element.addEventListener('focusout', function(event){
				slideshow.autoplayPaused = false;
				slideshow.startAutoplay();
			});
		}
		// keyboard navigation
		initKeyboardEvents(slideshow);
		// reset on resize
    window.addEventListener('resize', function(event){
    	slideshow.pauseAutoplay();
      clearTimeout(slideshow.resizeId);
      slideshow.resizeId = setTimeout(function(){
        resetSlideshowResize(slideshow);
        setTimeout(function(){slideshow.startAutoplay();}, 60);
      }, 250)
    });
	};

	function initKeyboardEvents(slideshow) {
		// tab on selected slide -> if last focusable -> move to prev or next arrow
		// tab + shift selected slide -> if first focusable -> move to container
		if(slideshow.controls.length > 0) {
			// tab+shift on prev arrow -> move focus to last focusable element inside the selected slide (or to the slider container)
			slideshow.controls[0].addEventListener('keydown', function(event){
				if( (event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab') && event.shiftKey ) moveFocusToLast(slideshow);
			});
			// tab+shift on next arrow -> if first slide selectes -> move focus to last focusable element inside the selected slide (or to the slider container)
			slideshow.controls[1].addEventListener('keydown', function(event){
				if( (event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab') && event.shiftKey && (slideshow.selectedSlide == 0)) moveFocusToLast(slideshow);
			});
		}
		// check tab is pressed when focus is inside selected slide
		slideshow.element.addEventListener('keydown', function(event){
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
				var target = event.target.closest('.js-slideshow-pm__item');
				if(target && Util.hasClass(target, 'slideshow-pm__item--selected')) moveFocusOutsideSlide(slideshow, event);
				else if(target || Util.hasClass(event.target, 'js-slideshow-pm') && !event.shiftKey) moveFocusToSelectedSlide(slideshow);
			} 
		});

		// detect tab moves to slideshow 
		window.addEventListener('keyup', function(event){
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab') {
				var target = event.target.closest('.js-slideshow-prew__item');
				if(target || Util.hasClass(event.target, 'js-slideshow-prew') && !event.shiftKey) moveFocusToSelectedSlide(slideshow);
			}
		});
	};

	function moveFocusToLast(slideshow) {
		event.preventDefault();
		if(slideshow.lastFocusable)	{
			slideshow.lastFocusable.focus();
		} else {
			Util.moveFocus(slideshow.element);
		}
	};

	function moveFocusToSelectedSlide(slideshow) { // focus is inside a slide that is not selected
		event.preventDefault();
		if(slideshow.firstFocusable)	{
			slideshow.firstFocusable.focus();
		} else if(slideshow.controls.length > 0) {
			(slideshow.selectedSlide == 0) ? slideshow.controls[1].getElementsByTagName('button')[0].focus() : slideshow.controls[0].getElementsByTagName('button')[0].focus();
		} else if(slideshow.options.navigation) {
			slideshow.navigation.getElementsByClassName('js-slideshow-pm__nav-item')[0].getElementsByTagName('button')[0].focus();
		}
	};

	function moveFocusOutsideSlide(slideshow, event) {
		if(event.shiftKey && slideshow.firstFocusable && event.target == slideshow.firstFocusable) {
			// shift+tab -> focus was on first foucusable element inside selected slide -> move to container
			event.preventDefault();
			Util.moveFocus(slideshow.element);
		} else if( !event.shiftKey && slideshow.lastFocusable && event.target == slideshow.lastFocusable) {
			event.preventDefault();
			
			if(slideshow.selectedSlide != 0) slideshow.controls[0].getElementsByTagName('button')[0].focus();
			else slideshow.controls[1].getElementsByTagName('button')[0].focus();
		}
	};

	function initAnimationEndEvents(slideshow) {
		slideshow.list.addEventListener('transitionend', function(){
			setTimeout(function(){ // add a delay between the end of animation and slideshow reset - improve animation performance
				resetAnimationEnd(slideshow);
			}, 100);
		});
	};

	function resetAnimationEnd(slideshow) {
		if(slideshow.moveFocus) Util.moveFocus(slideshow.items[slideshow.selectedSlide]);
		slideshow.items[slideshow.selectedSlide].removeAttribute('aria-hidden');
		slideshow.animating = false;
		slideshow.moveFocus = false;
		slideshow.startAutoplay();
	};

	function navigateSlide(slideshow, event, keyNav) { 
		// user has interacted with the slideshow navigation -> update visible slide
		var target = event.target.closest('.js-slideshow-pm__nav-item');
		if(keyNav && target && !Util.hasClass(target, 'slideshow-pm__nav-item--selected')) {
			slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
			slideshow.moveFocus = true;
			updateAriaLive(slideshow);
		}
	};

	function showNewItem(slideshow, index, bool, autoplay) {
		if(slideshow.animating && slideshow.supportAnimation) return;
		if(autoplay) {
			if(index < 0) index = slideshow.items.length - 1;
			else if(index >= slideshow.items.length) index = 0;
		}
		if(index < 0 || index >= slideshow.items.length) return;
		slideshow.animating = true;
		Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow-pm__item--selected');
		slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
		Util.addClass(slideshow.items[index], 'slideshow-pm__item--selected');
		resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
		slideshow.selectedSlide = index;
		setTranslate(slideshow);
		slideshow.pauseAutoplay();
		setFocusableElements(slideshow);
		if(!transitionSupported) resetAnimationEnd(slideshow);
	};

	function updateAriaLive(slideshow) {
		slideshow.ariaLive.innerHTML = 'Item '+(slideshow.selectedSlide + 1)+' of '+slideshow.items.length;
	};

	function resetSlideshowResize(slideshow) {
		Util.removeClass(slideshow.list, 'slideshow-pm__list--has-transition');
		setTimeout(function(){
			setTranslateValue(slideshow);
			setTranslate(slideshow);
			Util.addClass(slideshow.list, 'slideshow-pm__list--has-transition');
		}, 30)
	};

	function setTranslateValue(slideshow) {
		var itemStyle = window.getComputedStyle(slideshow.items[slideshow.selectedSlide]);

		slideshow.itemWidth = parseFloat(itemStyle.getPropertyValue('width'));
		slideshow.itemMargin = parseFloat(itemStyle.getPropertyValue('margin-right'));
		slideshow.containerWidth = parseFloat(window.getComputedStyle(slideshow.element).getPropertyValue('width'));
	};

	function setTranslate(slideshow) {
		var translate = parseInt(((slideshow.itemWidth + slideshow.itemMargin) * slideshow.selectedSlide * (-1)) + ((slideshow.containerWidth - slideshow.itemWidth)*0.5));
    slideshow.list.style.transform = 'translateX('+translate+'px)';
    slideshow.list.style.msTransform = 'translateX('+translate+'px)';
  };

  function resetSlideshowNav(slideshow, newIndex, oldIndex) {
  	if(slideshow.navigation) {
			Util.removeClass(slideshow.navigation[oldIndex], 'slideshow-pm__nav-item--selected');
			Util.addClass(slideshow.navigation[newIndex], 'slideshow-pm__nav-item--selected');
			slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
			slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
		}
		if(slideshow.controls.length > 0) {
			Util.toggleClass(slideshow.controls[0], 'slideshow-pm__control--active', newIndex != 0);
			Util.toggleClass(slideshow.controls[1], 'slideshow-pm__control--active', newIndex != (slideshow.items.length - 1));
  	}
  };

  function setFocusableElements(slideshow) {
  	//get all focusable elements inside the selected slide
		var allFocusable = slideshow.items[slideshow.selectedSlide].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		getFirstVisible(slideshow, allFocusable);
		getLastVisible(slideshow, allFocusable);
  };

  function getFirstVisible(slideshow, elements) {
  	slideshow.firstFocusable = false;
		//get first visible focusable element inside the selected slide
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				slideshow.firstFocusable = elements[i];
				return true;
			}
		}
  };

  function getLastVisible(slideshow, elements) {
  	//get last visible focusable element inside the selected slide
  	slideshow.lastFocusable = false;
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				slideshow.lastFocusable = elements[i];
				return true;
			}
		}
  };

  function resetSlideshowFlexFallback(slideshow) {
		slideshow.list.style.width = ((slideshow.items.length+1)*(slideshow.itemMargin+slideshow.itemWidth))+'px';
		for(var i = 0; i < slideshow.items.length; i++) {slideshow.items[i].style.width = slideshow.itemWidth+'px';}
  };

	SlideshowPrew.defaults = {
    element : '',
    navigation : true,
    autoplay : false,
    autoplayInterval: 5000,
    prewNav: false,
    swipe: false
  };

  window.SlideshowPrew = SlideshowPrew;
	
	// initialize the slideshowsPrew objects
	var slideshowsPrew = document.getElementsByClassName('js-slideshow-pm'),
		flexSupported = Util.cssSupports('align-items', 'stretch'),
		transitionSupported = Util.cssSupports('transition');
	if( slideshowsPrew.length > 0 ) {
		for( var i = 0; i < slideshowsPrew.length; i++) {
			(function(i){
				var navigation = (slideshowsPrew[i].getAttribute('data-navigation') && slideshowsPrew[i].getAttribute('data-navigation') == 'off') ? false : true,
					autoplay = (slideshowsPrew[i].getAttribute('data-autoplay') && slideshowsPrew[i].getAttribute('data-autoplay') == 'on') ? true : false,
					autoplayInterval = (slideshowsPrew[i].getAttribute('data-autoplay-interval')) ? slideshowsPrew[i].getAttribute('data-autoplay-interval') : 5000,
					prewNav = (slideshowsPrew[i].getAttribute('data-pm-nav') && slideshowsPrew[i].getAttribute('data-pm-nav') == 'on' ) ? true : false, 
					swipe = (slideshowsPrew[i].getAttribute('data-swipe') && slideshowsPrew[i].getAttribute('data-swipe') == 'on') ? true : false;
				new SlideshowPrew({element: slideshowsPrew[i], navigation: navigation, autoplay : autoplay, autoplayInterval : autoplayInterval, swipe : swipe, prewNav: prewNav});
			})(i);
		}
	}

}());
// File#: _2_slideshow
// Usage: codyhouse.co/license
(function() {
	var Slideshow = function(opts) {
		this.options = slideshowAssignOptions(Slideshow.defaults , opts);
		this.element = this.options.element;
		this.items = this.element.getElementsByClassName('js-slideshow__item');
		this.controls = this.element.getElementsByClassName('js-slideshow__control'); 
		this.selectedSlide = 0;
		this.autoplayId = false;
		this.autoplayPaused = false;
		this.navigation = false;
		this.navCurrentLabel = false;
		this.ariaLive = false;
		this.moveFocus = false;
		this.animating = false;
		this.supportAnimation = Util.cssSupports('transition');
		this.animationOff = (!Util.hasClass(this.element, 'slideshow--transition-fade') && !Util.hasClass(this.element, 'slideshow--transition-slide') && !Util.hasClass(this.element, 'slideshow--transition-prx'));
		this.animationType = Util.hasClass(this.element, 'slideshow--transition-prx') ? 'prx' : 'slide';
		this.animatingClass = 'slideshow--is-animating';
		initSlideshow(this);
		initSlideshowEvents(this);
		initAnimationEndEvents(this);
	};

	Slideshow.prototype.showNext = function() {
		showNewItem(this, this.selectedSlide + 1, 'next');
	};

	Slideshow.prototype.showPrev = function() {
		showNewItem(this, this.selectedSlide - 1, 'prev');
	};

	Slideshow.prototype.showItem = function(index) {
		showNewItem(this, index, false);
	};

	Slideshow.prototype.startAutoplay = function() {
		var self = this;
		if(this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
			self.autoplayId = setInterval(function(){
				self.showNext();
			}, self.options.autoplayInterval);
		}
	};

	Slideshow.prototype.pauseAutoplay = function() {
		var self = this;
		if(this.options.autoplay) {
			clearInterval(self.autoplayId);
			self.autoplayId = false;
		}
	};

	function slideshowAssignOptions(defaults, opts) {
		// initialize the object options
		var mergeOpts = {};
		mergeOpts.element = (typeof opts.element !== "undefined") ? opts.element : defaults.element;
		mergeOpts.navigation = (typeof opts.navigation !== "undefined") ? opts.navigation : defaults.navigation;
		mergeOpts.autoplay = (typeof opts.autoplay !== "undefined") ? opts.autoplay : defaults.autoplay;
		mergeOpts.autoplayInterval = (typeof opts.autoplayInterval !== "undefined") ? opts.autoplayInterval : defaults.autoplayInterval;
		mergeOpts.swipe = (typeof opts.swipe !== "undefined") ? opts.swipe : defaults.swipe;
		return mergeOpts;
	};

	function initSlideshow(slideshow) { // basic slideshow settings
		// if no slide has been selected -> select the first one
		if(slideshow.element.getElementsByClassName('slideshow__item--selected').length < 1) Util.addClass(slideshow.items[0], 'slideshow__item--selected');
		slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('slideshow__item--selected')[0]);
		// create an element that will be used to announce the new visible slide to SR
		var srLiveArea = document.createElement('div');
		Util.setAttributes(srLiveArea, {'class': 'sr-only js-slideshow__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
		slideshow.element.appendChild(srLiveArea);
		slideshow.ariaLive = srLiveArea;
	};

	function initSlideshowEvents(slideshow) {
		// if slideshow navigation is on -> create navigation HTML and add event listeners
		if(slideshow.options.navigation) {
			// check if navigation has already been included
			if(slideshow.element.getElementsByClassName('js-slideshow__navigation').length == 0) {
				var navigation = document.createElement('ol'),
					navChildren = '';

				var navClasses = 'slideshow__navigation js-slideshow__navigation';
				if(slideshow.items.length <= 1) {
					navClasses = navClasses + ' is-hidden';
				} 
				
				navigation.setAttribute('class', navClasses);
				for(var i = 0; i < slideshow.items.length; i++) {
					var className = (i == slideshow.selectedSlide) ? 'class="slideshow__nav-item slideshow__nav-item--selected js-slideshow__nav-item"' :  'class="slideshow__nav-item js-slideshow__nav-item"',
						navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="sr-only js-slideshow__nav-current-label">Current Item</span>' : '';
					navChildren = navChildren + '<li '+className+'><button class="reset"><span class="sr-only">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
				}
				navigation.innerHTML = navChildren;
				slideshow.element.appendChild(navigation);
			}
			
			slideshow.navCurrentLabel = slideshow.element.getElementsByClassName('js-slideshow__nav-current-label')[0]; 
			slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow__nav-item');

			var dotsNavigation = slideshow.element.getElementsByClassName('js-slideshow__navigation')[0];

			dotsNavigation.addEventListener('click', function(event){
				navigateSlide(slideshow, event, true);
			});
			dotsNavigation.addEventListener('keyup', function(event){
				navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
			});
		}
		// slideshow arrow controls
		if(slideshow.controls.length > 0) {
			// hide controls if one item available
			if(slideshow.items.length <= 1) {
				Util.addClass(slideshow.controls[0], 'is-hidden');
				Util.addClass(slideshow.controls[1], 'is-hidden');
			}
			slideshow.controls[0].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showPrev();
				updateAriaLive(slideshow);
			});
			slideshow.controls[1].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showNext();
				updateAriaLive(slideshow);
			});
		}
		// swipe events
		if(slideshow.options.swipe) {
			//init swipe
			new SwipeContent(slideshow.element);
			slideshow.element.addEventListener('swipeLeft', function(event){
				slideshow.showNext();
			});
			slideshow.element.addEventListener('swipeRight', function(event){
				slideshow.showPrev();
			});
		}
		// autoplay
		if(slideshow.options.autoplay) {
			slideshow.startAutoplay();
			// pause autoplay if user is interacting with the slideshow
			slideshow.element.addEventListener('mouseenter', function(event){
				slideshow.pauseAutoplay();
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('focusin', function(event){
				slideshow.pauseAutoplay();
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('mouseleave', function(event){
				slideshow.autoplayPaused = false;
				slideshow.startAutoplay();
			});
			slideshow.element.addEventListener('focusout', function(event){
				slideshow.autoplayPaused = false;
				slideshow.startAutoplay();
			});
		}
		// detect if external buttons control the slideshow
		var slideshowId = slideshow.element.getAttribute('id');
		if(slideshowId) {
			var externalControls = document.querySelectorAll('[data-controls="'+slideshowId+'"]');
			for(var i = 0; i < externalControls.length; i++) {
				(function(i){externalControlSlide(slideshow, externalControls[i]);})(i);
			}
		}
		// custom event to trigger selection of a new slide element
		slideshow.element.addEventListener('selectNewItem', function(event){
			// check if slide is already selected
			if(event.detail) {
				if(event.detail - 1 == slideshow.selectedSlide) return;
				showNewItem(slideshow, event.detail - 1, false);
			}
		});

		// keyboard navigation
		slideshow.element.addEventListener('keydown', function(event){
			if(event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright') {
				slideshow.showNext();
			} else if(event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
				slideshow.showPrev();
			}
		});
	};

	function navigateSlide(slideshow, event, keyNav) { 
		// user has interacted with the slideshow navigation -> update visible slide
		var target = ( Util.hasClass(event.target, 'js-slideshow__nav-item') ) ? event.target : event.target.closest('.js-slideshow__nav-item');
		if(keyNav && target && !Util.hasClass(target, 'slideshow__nav-item--selected')) {
			slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
			slideshow.moveFocus = true;
			updateAriaLive(slideshow);
		}
	};

	function initAnimationEndEvents(slideshow) {
		// remove animation classes at the end of a slide transition
		for( var i = 0; i < slideshow.items.length; i++) {
			(function(i){
				slideshow.items[i].addEventListener('animationend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
				slideshow.items[i].addEventListener('transitionend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
			})(i);
		}
	};

	function resetAnimationEnd(slideshow, item) {
		setTimeout(function(){ // add a delay between the end of animation and slideshow reset - improve animation performance
			if(Util.hasClass(item,'slideshow__item--selected')) {
				if(slideshow.moveFocus) Util.moveFocus(item);
				emitSlideshowEvent(slideshow, 'newItemVisible', slideshow.selectedSlide);
				slideshow.moveFocus = false;
			}
			Util.removeClass(item, 'slideshow__item--'+slideshow.animationType+'-out-left slideshow__item--'+slideshow.animationType+'-out-right slideshow__item--'+slideshow.animationType+'-in-left slideshow__item--'+slideshow.animationType+'-in-right');
			item.removeAttribute('aria-hidden');
			slideshow.animating = false;
			Util.removeClass(slideshow.element, slideshow.animatingClass); 
		}, 100);
	};

	function showNewItem(slideshow, index, bool) {
		if(slideshow.items.length <= 1) return;
		if(slideshow.animating && slideshow.supportAnimation) return;
		slideshow.animating = true;
		Util.addClass(slideshow.element, slideshow.animatingClass); 
		if(index < 0) index = slideshow.items.length - 1;
		else if(index >= slideshow.items.length) index = 0;
		// skip slideshow item if it is hidden
		if(bool && Util.hasClass(slideshow.items[index], 'is-hidden')) {
			slideshow.animating = false;
			index = bool == 'next' ? index + 1 : index - 1;
			showNewItem(slideshow, index, bool);
			return;
		}
		// index of new slide is equal to index of slide selected item
		if(index == slideshow.selectedSlide) {
			slideshow.animating = false;
			return;
		}
		var exitItemClass = getExitItemClass(slideshow, bool, slideshow.selectedSlide, index);
		var enterItemClass = getEnterItemClass(slideshow, bool, slideshow.selectedSlide, index);
		// transition between slides
		if(!slideshow.animationOff) Util.addClass(slideshow.items[slideshow.selectedSlide], exitItemClass);
		Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow__item--selected');
		slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
		if(slideshow.animationOff) {
			Util.addClass(slideshow.items[index], 'slideshow__item--selected');
		} else {
			Util.addClass(slideshow.items[index], enterItemClass+' slideshow__item--selected');
		}
		// reset slider navigation appearance
		resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
		slideshow.selectedSlide = index;
		// reset autoplay
		slideshow.pauseAutoplay();
		slideshow.startAutoplay();
		// reset controls/navigation color themes
		resetSlideshowTheme(slideshow, index);
		// emit event
		emitSlideshowEvent(slideshow, 'newItemSelected', slideshow.selectedSlide);
		if(slideshow.animationOff) {
			slideshow.animating = false;
			Util.removeClass(slideshow.element, slideshow.animatingClass);
		}
	};

	function getExitItemClass(slideshow, bool, oldIndex, newIndex) {
		var className = '';
		if(bool) {
			className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-out-right' : 'slideshow__item--'+slideshow.animationType+'-out-left'; 
		} else {
			className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-out-left' : 'slideshow__item--'+slideshow.animationType+'-out-right';
		}
		return className;
	};

	function getEnterItemClass(slideshow, bool, oldIndex, newIndex) {
		var className = '';
		if(bool) {
			className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-in-right' : 'slideshow__item--'+slideshow.animationType+'-in-left'; 
		} else {
			className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-in-left' : 'slideshow__item--'+slideshow.animationType+'-in-right';
		}
		return className;
	};

	function resetSlideshowNav(slideshow, newIndex, oldIndex) {
		if(slideshow.navigation) {
			Util.removeClass(slideshow.navigation[oldIndex], 'slideshow__nav-item--selected');
			Util.addClass(slideshow.navigation[newIndex], 'slideshow__nav-item--selected');
			slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
			slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
		}
	};

	function resetSlideshowTheme(slideshow, newIndex) {
		var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
		if(dataTheme) {
			if(slideshow.navigation) slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
			if(slideshow.controls[0]) slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
		} else {
			if(slideshow.navigation) slideshow.navigation[0].parentElement.removeAttribute('data-theme');
			if(slideshow.controls[0]) slideshow.controls[0].parentElement.removeAttribute('data-theme');
		}
	};

	function emitSlideshowEvent(slideshow, eventName, detail) {
		var event = new CustomEvent(eventName, {detail: detail});
		slideshow.element.dispatchEvent(event);
	};

	function updateAriaLive(slideshow) {
		slideshow.ariaLive.innerHTML = 'Item '+(slideshow.selectedSlide + 1)+' of '+slideshow.items.length;
	};

	function externalControlSlide(slideshow, button) { // control slideshow using external element
		button.addEventListener('click', function(event){
			var index = button.getAttribute('data-index');
			if(!index || index == slideshow.selectedSlide + 1) return;
			event.preventDefault();
			showNewItem(slideshow, index - 1, false);
		});
	};

	Slideshow.defaults = {
    element : '',
    navigation : true,
    autoplay : false,
    autoplayInterval: 5000,
    swipe: false
  };

	window.Slideshow = Slideshow;
	
	//initialize the Slideshow objects
	var slideshows = document.getElementsByClassName('js-slideshow');
	if( slideshows.length > 0 ) {
		for( var i = 0; i < slideshows.length; i++) {
			(function(i){
				var navigation = (slideshows[i].getAttribute('data-navigation') && slideshows[i].getAttribute('data-navigation') == 'off') ? false : true,
					autoplay = (slideshows[i].getAttribute('data-autoplay') && slideshows[i].getAttribute('data-autoplay') == 'on') ? true : false,
					autoplayInterval = (slideshows[i].getAttribute('data-autoplay-interval')) ? slideshows[i].getAttribute('data-autoplay-interval') : 5000,
					swipe = (slideshows[i].getAttribute('data-swipe') && slideshows[i].getAttribute('data-swipe') == 'on') ? true : false;
				new Slideshow({element: slideshows[i], navigation: navigation, autoplay : autoplay, autoplayInterval : autoplayInterval, swipe : swipe});
			})(i);
		}
	}
}());
// File#: _2_svg-slideshow
// Usage: codyhouse.co/license
(function() {
  var ImgSlideshow = function(opts) {
    this.options = Util.extend(ImgSlideshow.defaults , opts);
		this.element = this.options.element;
		this.items = this.element.getElementsByClassName('js-svg-slideshow__item');
		this.controls = this.element.getElementsByClassName('js-svg-slideshow__control'); 
		this.selectedSlide = 0;
		this.autoplayId = false;
		this.autoplayPaused = false;
		this.navigation = false;
		this.navCurrentLabel = false;
		this.ariaLive = false;
		this.animating = false;
		this.animatingClass = 'svg-slideshow--is-animating';
    // store svg animation paths
		this.masks = this.element.getElementsByClassName('js-svg-slideshow__mask');
    this.maskNext = getMaskPoints(this, 'next');
		this.maskPrev = getMaskPoints(this, 'prev');
		// random number for mask id
		this.maskId = getRandomInt(0, 10000);
		initSlideshow(this);
		initSlideshowEvents(this);
		revealSlideshow(this);
  };

  function getMaskPoints(slideshow, direction) { // store the path points - will be used to transition between slides
    var array = [];
		var index = direction == 'next' ? 0 : 1;
		var groupElements = slideshow.masks[index].getElementsByTagName('g');
		for(var j = 0; j < groupElements.length; j++) {
			array[j] = [];
			var paths =  groupElements[j].getElementsByTagName('path');
			for(var i = 0; i < paths.length; i++) {
				array[j].push(paths[i].getAttribute('d'));
			}
		}
    return array;
	};
	
	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	};
  
  function initSlideshow(slideshow) { // basic slideshow settings
    // reset slide items content -> replace img element with svg
    for(var i = 0; i < slideshow.items.length; i++) {
      initSlideContent(slideshow, slideshow.items[i], i);
    }
		// if no slide has been selected -> select the first one
		if(slideshow.element.getElementsByClassName('svg-slideshow__item--selected').length < 1) Util.addClass(slideshow.items[0], 'svg-slideshow__item--selected');
		slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('svg-slideshow__item--selected')[0]);
		// create an element that will be used to announce the new visible slide to SR
		var srLiveArea = document.createElement('div');
		Util.setAttributes(srLiveArea, {'class': 'sr-only js-svg-slideshow__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
		slideshow.element.appendChild(srLiveArea);
		slideshow.ariaLive = srLiveArea;
  };

  function initSlideContent(slideshow, slide, index) {
		// replace each slide content with a svg element including image + clip-path
		var imgElement = slide.getElementsByTagName('img')[0],
			imgPath = imgElement.getAttribute('src'),
      imgAlt =  imgElement.getAttribute('alt'),
			viewBox = slideshow.masks[0].getAttribute('viewBox').split(' '),
      imageCode = '<image height="'+viewBox[3]+'px" width="'+viewBox[2]+'px" clip-path="url(#img-slide-'+slideshow.maskId+'-'+index+')" xlink:href="'+imgPath+'" href="'+imgPath+'"></image>';
		
			var slideContent = '<svg aria-hidden="true" viewBox="0 0 '+viewBox[2]+' '+viewBox[3]+'"><defs><clipPath id="img-slide-'+slideshow.maskId+'-'+index+'">';

			for(var i = 0; i < slideshow.maskNext.length; i++) {
				slideContent = slideContent + '<path d="'+slideshow.maskNext[i][slideshow.maskNext[i].length - 1]+'"></path>';
			}

			slideContent = slideContent + '</clipPath></defs>'+imageCode+'</svg>';

    slide.innerHTML = imgElement.outerHTML + slideContent;
    if(imgAlt) slide.setAttribute('aria-label', imgAlt);
  };

  function initSlideshowEvents(slideshow) {
    // if slideshow navigation is on -> create navigation HTML and add event listeners
		if(slideshow.options.navigation) {
			var navigation = document.createElement('ol'),
				navChildren = '';
			
			navigation.setAttribute('class', 'svg-slideshow__navigation');
			for(var i = 0; i < slideshow.items.length; i++) {
				var className = (i == slideshow.selectedSlide) ? 'class="svg-slideshow__nav-item svg-slideshow__nav-item--selected js-svg-slideshow__nav-item"' :  'class="svg-slideshow__nav-item js-svg-slideshow__nav-item"',
					navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="sr-only js-svg-slideshow__nav-current-label">Current Item</span>' : '';
				navChildren = navChildren + '<li '+className+'><button class="reset"><span class="sr-only">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
			}

			navigation.innerHTML = navChildren;
			slideshow.navCurrentLabel = navigation.getElementsByClassName('js-svg-slideshow__nav-current-label')[0]; 
			slideshow.element.appendChild(navigation);
			slideshow.navigation = slideshow.element.getElementsByClassName('js-svg-slideshow__nav-item');

			navigation.addEventListener('click', function(event){
				navigateSlide(slideshow, event, true);
			});
			navigation.addEventListener('keyup', function(event){
				navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
			});
		}
    // slideshow arrow controls
		if(slideshow.controls.length > 0) {
			slideshow.controls[0].addEventListener('click', function(event){
				event.preventDefault();
				showNewItem(slideshow, slideshow.selectedSlide - 1, 'prev', true);
			});
			slideshow.controls[1].addEventListener('click', function(event){
				event.preventDefault();
        showNewItem(slideshow, slideshow.selectedSlide + 1, 'next', true);
			});
    }
    // swipe events
    if(slideshow.options.swipe) {
			//init swipe
			new SwipeContent(slideshow.element);
			slideshow.element.addEventListener('swipeLeft', function(event){
				showNewItem(slideshow, slideshow.selectedSlide + 1, 'next');
			});
			slideshow.element.addEventListener('swipeRight', function(event){
        showNewItem(slideshow, slideshow.selectedSlide - 1, 'prev');
			});
		}
    // autoplay
		if(slideshow.options.autoplay) {
			startAutoplay(slideshow);
			// pause autoplay if user is interacting with the slideshow
			slideshow.element.addEventListener('mouseenter', function(event){
				pauseAutoplay(slideshow);
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('focusin', function(event){
				pauseAutoplay(slideshow);
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('mouseleave', function(event){
				slideshow.autoplayPaused = false;
				startAutoplay(slideshow);
			});
			slideshow.element.addEventListener('focusout', function(event){
				slideshow.autoplayPaused = false;
				startAutoplay(slideshow);
			});
		}
		// init slide theme colors
		resetSlideshowTheme(slideshow, slideshow.selectedSlide);
	};
	
	function revealSlideshow(slideshow) {
		Util.addClass(slideshow.element, 'svg-slideshow--loaded');
	};

  function showNewItem(slideshow, index, direction, bool) { // update visible slide
		if(slideshow.animating) return;
		slideshow.animating = true;
		Util.addClass(slideshow.element, slideshow.animatingClass);
		if(index < 0) index = slideshow.items.length - 1;
		else if(index >= slideshow.items.length) index = 0;
		// reset dot navigation appearance
		resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
		// animate slide
		newItemAnimate(slideshow, index, slideshow.selectedSlide, direction);
		// if not autoplay, announce new slide to SR
    if(bool) updateAriaLive(slideshow, index); 
		// reset controls/navigation color themes
		resetSlideshowTheme(slideshow, index);
  };

  function newItemAnimate(slideshow, newIndex, oldIndex, direction) {
    // start slide transition
    var path = slideshow.items[newIndex].getElementsByTagName('path'),
			mask = direction == 'next' ? slideshow.maskNext : slideshow.maskPrev;
		for(var i = 0; i < path.length; i++) {
			path[i].setAttribute('d', mask[i][0]);
		}
    
    Util.addClass(slideshow.items[newIndex], 'svg-slideshow__item--animating');
    morphPath(path, mask, slideshow.options.transitionDuration, function(){ // morph callback function
      slideshow.items[oldIndex].setAttribute('aria-hidden', 'true');
      slideshow.items[newIndex].removeAttribute('aria-hidden');
      Util.addClass(slideshow.items[newIndex], 'svg-slideshow__item--selected');
      Util.removeClass(slideshow.items[newIndex], 'svg-slideshow__item--animating');
      Util.removeClass(slideshow.items[oldIndex], 'svg-slideshow__item--selected');
      slideshow.selectedSlide = newIndex;
			slideshow.animating = false;
			Util.removeClass(slideshow.element, slideshow.animatingClass);
      // reset autoplay
      pauseAutoplay(slideshow);
      startAutoplay(slideshow);
    });
  };

	function morphPath(path, points, duration, cb) { // morph 
		if(reducedMotion || !animeJSsupported) { // if reducedMotion on or JS animation not supported -> do not animate
			for(var i = 0; i < path.length; i++) {
				path[i].setAttribute('d', points[i][points[i].length - 1]);
			}
			cb();
      return;
		}
		for(var i = 0; i < path.length; i++) {
			var delay = i*100,
				cbFunction = (i == path.length - 1) ? cb : false;
			morphSinglePath(path[i], points[i], delay, duration, cbFunction);
		}
	};
	
	function morphSinglePath(path, points, delay, duration, cb) {
		var dAnimation = (points.length == 3) 
			? [{ value: [points[0], points[1]]}, { value: [points[1], points[2]]}]
			: [{ value: [points[0], points[1]]}];
    anime({
			targets: path,
			d: dAnimation,
      easing: 'easeOutQuad',
			duration: duration,
			delay: delay,
      complete: function() {
        if(cb) cb();
      }
    });
	};

  function navigateSlide(slideshow, event, keyNav) { 
		// user has interacted with the slideshow dot navigation -> update visible slide
		var target = event.target.closest('.js-svg-slideshow__nav-item');
		if(keyNav && target && !Util.hasClass(target, 'svg-slideshow__nav-item--selected')) {
      var index = Util.getIndexInArray(slideshow.navigation, target),
        direction = slideshow.selectedSlide < index ? 'next' : 'prev';
      showNewItem(slideshow, index, direction, true);
		}
	};
  
  function resetSlideshowNav(slideshow, newIndex, oldIndex) {
    if(slideshow.navigation) { // update selected dot
			Util.removeClass(slideshow.navigation[oldIndex], 'svg-slideshow__nav-item--selected');
			Util.addClass(slideshow.navigation[newIndex], 'svg-slideshow__nav-item--selected');
			slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
			slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
		}
	};
	
	function resetSlideshowTheme(slideshow, newIndex) { 
		// apply to controls/dot navigation, the same color-theme of the selected slide
		var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
		if(dataTheme) {
			if(slideshow.navigation) slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
			if(slideshow.controls[0]) slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
		} else {
			if(slideshow.navigation) slideshow.navigation[0].parentElement.removeAttribute('data-theme');
			if(slideshow.controls[0]) slideshow.controls[0].parentElement.removeAttribute('data-theme');
		}
	};

  function updateAriaLive(slideshow, index) { // announce new selected slide to SR
    var announce = 'Item '+(index + 1)+' of '+slideshow.items.length,
      label = slideshow.items[index].getAttribute('aria-label');
    if(label) announce = announce+' '+label;
		slideshow.ariaLive.innerHTML = announce;
  };

  function startAutoplay(slideshow) {
		if(slideshow.options.autoplay && !slideshow.autoplayId && !slideshow.autoplayPaused) {
			slideshow.autoplayId = setInterval(function(){
				showNewItem(slideshow, slideshow.selectedSlide + 1, 'next');
			}, slideshow.options.autoplayInterval);
		}
  };

  function pauseAutoplay(slideshow) {
    if(slideshow.options.autoplay) {
			clearInterval(slideshow.autoplayId);
			slideshow.autoplayId = false;
		}
  };
  
  //initialize the ImgSlideshow objects
  var slideshows = document.getElementsByClassName('js-svg-slideshow'),
		reducedMotion = Util.osHasReducedMotion(),
		animeJSsupported = window.Map; // test if the library used for the animation works
	if( slideshows.length > 0 ) {
		for( var i = 0; i < slideshows.length; i++) {
			(function(i){
				var navigation = (slideshows[i].getAttribute('data-navigation') && slideshows[i].getAttribute('data-navigation') == 'off') ? false : true,
					autoplay = (slideshows[i].getAttribute('data-autoplay') && slideshows[i].getAttribute('data-autoplay') == 'on') ? true : false,
					autoplayInterval = (slideshows[i].getAttribute('data-autoplay-interval')) ? slideshows[i].getAttribute('data-autoplay-interval') : 5000,
					swipe = (slideshows[i].getAttribute('data-swipe') && slideshows[i].getAttribute('data-swipe') == 'on') ? true : false,
					transitionDuration = (slideshows[i].getAttribute('data-transition-duration')) ? slideshows[i].getAttribute('data-transition-duration') : 400;
				new ImgSlideshow({element: slideshows[i], navigation: navigation, autoplay : autoplay, autoplayInterval : autoplayInterval, swipe : swipe, transitionDuration: transitionDuration});
			})(i);
		}
	}
}());