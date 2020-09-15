"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _xml = _interopRequireDefault(require("xml"));

var _moment = _interopRequireDefault(require("moment"));

var _url = _interopRequireDefault(require("url"));

var _path = _interopRequireDefault(require("path"));

var _utils = _interopRequireDefault(require("./utils"));

var XMLNS_DECLS = {
  _attr: {
    xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9"
  }
};

var SiteMapLanguageGenerator = /*#__PURE__*/function () {
  function SiteMapLanguageGenerator(options) {
    options = options || {};
    this.types = options.types;
  }

  var _proto = SiteMapLanguageGenerator.prototype;

  _proto.getXml = function getXml(language, options) {
    var urlElements = this.generateSiteMapUrlElements(options, language);
    var data = {
      // Concat the elements to the _attr declaration
      sitemapindex: [XMLNS_DECLS].concat(urlElements)
    }; // Return the xml

    return _utils.default.getDeclarations(options) + (0, _xml.default)(data);
  };

  _proto.generateSiteMapUrlElements = function generateSiteMapUrlElements(_ref, language) {
    var _this = this;

    var languages = _ref.languages,
        siteUrl = _ref.siteUrl,
        pathPrefix = _ref.pathPrefix,
        resourcesOutput = _ref.resourcesOutput;
    var sources = languages[language];
    return _lodash.default.map(sources, function (source) {
      var filePath = resourcesOutput.replace(/:language/, language).replace(/:resource/, source.name).replace(/^\//, "");
      var siteMapUrl = source.url ? source.url : _url.default.resolve(siteUrl, _path.default.join(pathPrefix, filePath));
      var lastModified = source.url ? (0, _moment.default)(new Date(), _moment.default.ISO_8601).toISOString() : _this.types[source.sitemap].lastModified || (0, _moment.default)(new Date(), _moment.default.ISO_8601).toISOString();
      return {
        sitemap: [{
          loc: siteMapUrl
        }, {
          lastmod: (0, _moment.default)(lastModified).toISOString()
        }]
      };
    });
  };

  return SiteMapLanguageGenerator;
}();

exports.default = SiteMapLanguageGenerator;