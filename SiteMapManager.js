"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _IndexMapGenerator = _interopRequireDefault(require("./IndexMapGenerator"));

var _SiteMapGenerator = _interopRequireDefault(require("./SiteMapGenerator"));

var _LanguageMapGenerator = _interopRequireDefault(require("./LanguageMapGenerator"));

var _lodash = _interopRequireDefault(require("lodash"));

function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } it = o[Symbol.iterator](); return it.next.bind(it); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var SiteMapManager = /*#__PURE__*/function () {
  function SiteMapManager(options) {
    var sitemapTypes = [];
    var sitemapLanguages = [];
    options = options || {};
    this.options = options;

    for (var language in options.mapping) {
      for (var contentType in options.mapping[language]) {
        var sitemapType = options.mapping[language][contentType].sitemap;
        sitemapTypes.push(sitemapType);
      }
    }

    for (var _language in options.mapping) {
      sitemapLanguages.push(_language);
    } // ensure, we have a cleaned up array


    sitemapTypes = _lodash.default.uniq(sitemapTypes);
    sitemapLanguages = _lodash.default.uniq(sitemapLanguages);

    for (var _iterator = _createForOfIteratorHelperLoose(sitemapLanguages), _step; !(_step = _iterator()).done;) {
      var _language2 = _step.value;

      for (var _iterator2 = _createForOfIteratorHelperLoose(sitemapTypes), _step2; !(_step2 = _iterator2()).done;) {
        var type = _step2.value;
        this[_language2 + "-" + type] = // (options[language] && options[language][type]) ||
        this.createSiteMapGenerator(options, type);
      }

      this[_language2] = // options[language] ||
      this.createLanguageGenerator(sitemapTypes, _language2);
    }

    this.index = options.index || this.createIndexGenerator(sitemapLanguages);
  } // NEED TO MODIFY TO LANGUAGES


  var _proto = SiteMapManager.prototype;

  _proto.createIndexGenerator = function createIndexGenerator(sitemapLanguages) {
    var _this = this;

    var languages = {};
    sitemapLanguages.forEach(function (language) {
      return languages[language] = _this[language];
    });
    return new _IndexMapGenerator.default({
      languages: languages
    });
  } // this[language] is not properly constructed, so that .getXml of undefined
  // should be a sitemapgenerator, that has sitemap url elements
  ;

  _proto.createLanguageGenerator = function createLanguageGenerator(sitemapTypes, language) {
    var _this2 = this;

    var types = {};
    sitemapTypes.forEach(function (type) {
      return types[type] = _this2[language + "-" + type];
    });
    return new _LanguageMapGenerator.default({
      types: types
    });
  };

  _proto.createSiteMapGenerator = function createSiteMapGenerator(options, type) {
    return new _SiteMapGenerator.default(options, type);
  };

  _proto.getIndexXml = function getIndexXml(options) {
    return this.index.getXml(options);
  };

  _proto.getLanguageXml = function getLanguageXml(language, options) {
    return this[language].getXml(language, options);
  };

  _proto.getSiteMapXml = function getSiteMapXml(language, type, options) {
    return this[language + "-" + type].getXml(options);
  } // populate the basic sitemap generator with destination urls
  ;

  _proto.addUrls = function addUrls(language, type, _ref) {
    var url = _ref.url,
        node = _ref.node;
    return this[language + "-" + type].addUrl(url, node);
  };

  return SiteMapManager;
}();

exports.default = SiteMapManager;