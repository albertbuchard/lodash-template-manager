'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* =============== TemplateManager Class =============== */

/**
 * Class to manage the loading of templates from external files using lodash.js simple templating capabilities and JQuery.
 */

var TemplateManager = function () {

  /**
   * Constructor function for the templateManager
   * @param  {object} viewPaths          list of template URLs. Object keys will be used as the template name. 
   * {templateName1: templateUrl1, templateName2: templateUrl2, ...}
   * @param  {function} callbackWhenLoaded Callback function to call when templates are loaded.
   * @public
   */

  function TemplateManager() {
    var viewPaths = arguments.length <= 0 || arguments[0] === undefined ? mandatory() : arguments[0];
    var callbackWhenLoaded = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    _classCallCheck(this, TemplateManager);

    /* Allow double curly bracket syntax in the template html: {{variable}} */
    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

    /**
     * Contains all templates urls
     * @type {object}
     */
    this.viewPaths = viewPaths;

    /**
     * Contains cached template in underscore template format
     * @type {Object}
     */
    this.cached = {};

    /** setup callback when all templates are loaded */
    if (callbackWhenLoaded) {
      this.callbackWhenLoaded = callbackWhenLoaded;
    } else {
      this.callbackWhenLoaded = function () {
        console.log("TemplateManager.js: all templates loaded.");
      };
    }

    /* Keeps reference to the current object */
    var thisObject = this;

    /* Caches every templates asynchronously */
    _.each(this.viewPaths, function (value, key, list) {
      $.get(thisObject.viewPaths[key], function (raw) {

        /** store after loading */
        thisObject.store(key, raw);

        /** checks if all template are loaded */
        if (_.every(_.keys(thisObject.viewPaths), function (key) {
          return _.has(thisObject.cached, key);
        })) {
          /** All templates loaded, call the supplied callback. */
          thisObject.callbackWhenLoaded();
        }
      });
    });
  }

  /**
   * Render the HTML of a template based on its name.
   * @param  {string} name      template name
   * @param  {Object} variables Object holding the variable values to replace in the template before rendering.
   */


  _createClass(TemplateManager, [{
    key: 'render',
    value: function render(name) {
      var variables = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var thisObject = this;
      if (this.isCached(name)) {
        return this.cached[name](variables);
      } else {
        $.get(this.urlFor(name), function (raw) {
          thisObject.store(name, raw);
          thisObject.render(name, variables);
        });
      }
    }

    /**
     * Render the HTML of a template based on its name into a DOM target.
     * @param  {string} name      template name
     * @param  {Object} variables Object holding the variable values to replace in the template before rendering.
     * @param  {Object} target    DOM element to render the HTML into
     */

  }, {
    key: 'renderInTarget',
    value: function renderInTarget(name, variables, target) {
      var thisObject = this;
      if (this.isCached(name)) {
        $(target).append(this.cached[name](variables));
      } else {
        $.get(this.urlFor(name), function (raw) {
          thisObject.store(name, raw);
          thisObject.renderInTarget(name, variables, target);
        });
      }
    }

    /**
     * Synchronous fetching and rendering using ajax synchronous file fetching.
     * @param  {string}   name     template name
     */

  }, {
    key: 'renderSync',
    value: function renderSync(name) {
      if (!this.isCached(name)) {
        this.fetch(name);
      }
      this.render(name);
    }

    /**
     * Preloads and cache the template as underscore templates.
     * @param  {string} name template name
     */

  }, {
    key: 'prefetch',
    value: function prefetch(name) {
      var thisObject = this;
      $.get(this.urlFor(name), function (raw) {
        thisObject.store(name, raw);
      });
    }

    /**
     * Synchronously fetch a template.
     * @param  {string} name template name 
     */

  }, {
    key: 'fetch',
    value: function fetch(name) {
      // synchronous, for those times when you need it.
      if (!this.isCached(name)) {
        var raw = $.ajax({
          'url': this.urlFor(name),
          'async': false
        }).responseText;
        this.store(name, raw);
      }
    }

    /**
     * Checks if a specified template is already cached
     * @param  {string}  name template name
     * @return {Boolean}      
     */

  }, {
    key: 'isCached',
    value: function isCached(name) {
      return !!this.cached[name];
    }

    /**
     * Stores a template from raw html as a underscore template.
     * @param  {string} name template name
     * @param  {string} raw  template html 
     */

  }, {
    key: 'store',
    value: function store(name, raw) {
      this.cached[name] = _.template(raw);
    }

    /**
     * Return the path of the specified template
     * @param  {string} name template name
     * @return {string}      template url
     */

  }, {
    key: 'urlFor',
    value: function urlFor(name) {
      return this.viewPaths[name];
    }
  }]);

  return TemplateManager;
}();

/* =============== Utility Functions =============== */

/**
 * Called when mandatory argument is not set
 * @param  {String} param Optional name of the missing argument
 */

function mandatory() {
  var param = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];


  throw new Error('Missing parameter ' + param);
}
