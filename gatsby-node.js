"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _path = _interopRequireDefault(require("path"));

var _url = _interopRequireDefault(require("url"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _lodash = _interopRequireDefault(require("lodash"));

var _defaults = _interopRequireDefault(require("./defaults"));

var _SiteMapManager = _interopRequireDefault(require("./SiteMapManager"));

function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } it = o[Symbol.iterator](); return it.next.bind(it); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var PUBLICPATH = "./public";
var INDEXFILE = "/sitemap.xml";
var LANGUAGESFILE = "/:language/sitemap.xml";
var RESOURCESFILE = "/:language/sitemap_:resource.xml";

var XSLFILE = _path.default.resolve(__dirname, "./static/sitemap.xsl");

var DEFAULTQUERY = "{\n  allSitePage {\n    edges {\n      node {\n        id\n        slug: path\n        url: path\n      }\n    }\n  }\n  site {\n    siteMetadata {\n      siteUrl\n    }\n  }\n}";
var DEFAULTMAPPING = {
  allSitePage: {
    sitemap: "pages"
  }
};
var siteUrl;

var copyStylesheet = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(_ref) {
    var siteUrl, pathPrefix, indexOutput, mapping, siteRegex, data, sitemapStylesheet, language;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            siteUrl = _ref.siteUrl, pathPrefix = _ref.pathPrefix, indexOutput = _ref.indexOutput, mapping = _ref.mapping;
            siteRegex = /(\{\{blog-url\}\})/g; // Get our stylesheet template

            _context.next = 4;
            return _fsExtra.default.readFile(XSLFILE);

          case 4:
            data = _context.sent;
            // Replace the `{{blog-url}}` variable with our real site URL
            sitemapStylesheet = data.toString().replace(siteRegex, _url.default.resolve(siteUrl, _path.default.join(pathPrefix, indexOutput))); // Save the updated stylesheet to the public folder, so it will be
            // available for the xml sitemap files

            _context.next = 8;
            return _fsExtra.default.writeFile(_path.default.join(PUBLICPATH, "sitemap.xsl"), sitemapStylesheet);

          case 8:
            _context.t0 = _regenerator.default.keys(mapping);

          case 9:
            if ((_context.t1 = _context.t0()).done) {
              _context.next = 15;
              break;
            }

            language = _context.t1.value;
            _context.next = 13;
            return _fsExtra.default.writeFile(_path.default.join(PUBLICPATH, language, "sitemap.xsl"), sitemapStylesheet);

          case 13:
            _context.next = 9;
            break;

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function copyStylesheet(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var serializeMarkdownNodes = function serializeMarkdownNodes(node) {
  if (!node.fields.slug) {
    throw Error("`slug` is a required field");
  }

  node.slug = node.fields.slug;
  delete node.fields.slug;

  if (node.frontmatter) {
    if (node.frontmatter.published_at) {
      node.published_at = node.frontmatter.published_at;
      delete node.frontmatter.published_at;
    }

    if (node.frontmatter.feature_image) {
      node.feature_image = node.frontmatter.feature_image;
      delete node.frontmatter.feature_image;
    }
  }

  return node;
}; // Compare our node paths with the ones that Gatsby has generated and updated them
// with the "real" used ones.


var getNodePath = function getNodePath(node, allSitePage) {
  if (!node.path || node.path === "/") {
    return node;
  }

  var slugRegex = new RegExp(node.path.replace(/\/$/, "") + "$", "gi");

  for (var _iterator = _createForOfIteratorHelperLoose(allSitePage.edges), _step; !(_step = _iterator()).done;) {
    var page = _step.value;

    if (page.node && page.node.url && page.node.url.replace(/\/$/, "").match(slugRegex)) {
      node.path = page.node.url;
      break;
    }
  }

  return node;
}; // Add all other URLs that Gatsby generated, using siteAllPage,
// but we didn't fetch with our queries


var addPageNodes = function addPageNodes(parsedNodesArray, allSiteNodes, siteUrl) {
  var parsedNodes = parsedNodesArray[0];
  var pageNodes = [];
  var addedPageNodes = {
    pages: []
  };
  var usedNodes = allSiteNodes.filter(function (_ref3) {
    var node = _ref3.node;
    var foundOne;

    for (var type in parsedNodes) {
      parsedNodes[type].forEach(function (fetchedNode) {
        if (node.url === fetchedNode.node.path) {
          foundOne = true;
        }
      });
    }

    return foundOne;
  });

  var remainingNodes = _lodash.default.difference(allSiteNodes, usedNodes);

  remainingNodes.forEach(function (_ref4) {
    var node = _ref4.node;
    addedPageNodes.pages.push({
      url: _url.default.resolve(siteUrl, node.url),
      node: node
    });
  });
  pageNodes.push(addedPageNodes);
  return pageNodes;
};

var serializeLanguageSources = function serializeLanguageSources(_ref5) {
  var mapping = _ref5.mapping;
  var sitemaps = [];

  for (var language in mapping) {
    sitemaps.push(language);
  }

  sitemaps = _lodash.default.map(sitemaps, function (source) {
    return {
      name: source,
      sitemap: source
    };
  });
  sitemaps = _lodash.default.uniqBy(sitemaps, "name");
  return sitemaps;
};

var serializeSources = function serializeSources(language) {
  var sitemaps = [];

  for (var resourceType in language) {
    sitemaps.push(language[resourceType]);
  }

  sitemaps = _lodash.default.map(sitemaps, function (source) {
    return {
      name: source.name ? source.name : source.sitemap,
      sitemap: source.sitemap || "pages"
    };
  });
  sitemaps = _lodash.default.uniqBy(sitemaps, "name");
  return sitemaps;
};

var runDefaultQuery = function runDefaultQuery(handler, _ref6) {
  var query = _ref6.query,
      exclude = _ref6.exclude;
  return handler(query).then(function (r) {
    if (r.errors) {
      throw new Error(r.errors.join(", "));
    }

    return r.data;
  });
};

var runQuery = function runQuery(handler, _ref7) {
  var query = _ref7.query,
      exclude = _ref7.exclude;
  return handler(query).then(function (r) {
    if (r.errors) {
      throw new Error(r.errors.join(", "));
    }

    var languages = [];
    var queryResults = {};

    for (var contentType in r.data) {
      var _r$data$contentType, _r$data$contentType$e;

      if ((_r$data$contentType = r.data[contentType]) === null || _r$data$contentType === void 0 ? void 0 : (_r$data$contentType$e = _r$data$contentType.edges) === null || _r$data$contentType$e === void 0 ? void 0 : _r$data$contentType$e.length) {
        r.data[contentType].edges.forEach(function (edge) {
          var _edge$node;

          var language = edge === null || edge === void 0 ? void 0 : (_edge$node = edge.node) === null || _edge$node === void 0 ? void 0 : _edge$node.node_locale;
          if (language) languages.push(language);
        });
      }
    }

    languages = _lodash.default.uniq(languages);
    languages.forEach(function (language) {
      queryResults[language] = {};

      var _loop = function _loop(_contentType) {
        var _r$data$_contentType, _r$data$_contentType$;

        queryResults[language][_contentType] = {};
        queryResults[language][_contentType]["edges"] = [];

        if ((_r$data$_contentType = r.data[_contentType]) === null || _r$data$_contentType === void 0 ? void 0 : (_r$data$_contentType$ = _r$data$_contentType.edges) === null || _r$data$_contentType$ === void 0 ? void 0 : _r$data$_contentType$.length) {
          r.data[_contentType].edges.forEach(function (node) {
            var _node$node, _node$node2, _node$node2$layoutTyp;

            var node_locale = node === null || node === void 0 ? void 0 : (_node$node = node.node) === null || _node$node === void 0 ? void 0 : _node$node.node_locale; // exclude no index pages

            var noIndex = node === null || node === void 0 ? void 0 : (_node$node2 = node.node) === null || _node$node2 === void 0 ? void 0 : (_node$node2$layoutTyp = _node$node2.layoutType) === null || _node$node2$layoutTyp === void 0 ? void 0 : _node$node2$layoutTyp.noIndex;

            if (node_locale && node_locale === language && !noIndex) {
              queryResults[language][_contentType].edges.push(node);
            }
          });
        }
      };

      for (var _contentType in r.data) {
        _loop(_contentType);
      }
    });
    return queryResults;
  });
};

var serialize = function serialize(_temp, _ref8, _ref9) {
  var _ref10 = _temp === void 0 ? {} : _temp,
      sources = (0, _extends2.default)({}, _ref10);

  var site = _ref8.site,
      allSitePage = _ref8.allSitePage;
  var mapping = _ref9.mapping,
      addUncaughtPages = _ref9.addUncaughtPages;
  var nodes = [];
  var sourceObject = {};
  siteUrl = site.siteMetadata.siteUrl;

  var _loop2 = function _loop2(language) {
    var _loop3 = function _loop3(type) {
      if (mapping[language] && mapping[language][type] && mapping[language][type].sitemap) {
        var currentSource = sources[language][type] ? sources[language][type] : [];

        if (currentSource) {
          sourceObject[language] = sourceObject[language] || {};
          sourceObject[language][mapping[language][type].sitemap] = sourceObject[language][mapping[language][type].sitemap] || [];
          currentSource.edges.map(function (_ref11) {
            var node = _ref11.node;

            if (!node) {
              return;
            }

            if (mapping[language][type].path) {
              node.path = _path.default.resolve(mapping[language][type].path, node.slug);
            } else {
              node.path = "/" + node.node_locale + "/" + node.slug; // node.path = node.slug
            } // get the real path for the node, which is generated by Gatsby


            node = getNodePath(node, allSitePage);
            sourceObject[language][mapping[language][type].sitemap].push({
              url: _url.default.resolve(siteUrl, node.path),
              node: node
            });
          });
        }
      }
    };

    for (var type in sources[language]) {
      _loop3(type);
    }
  };

  for (var language in sources) {
    _loop2(language);
  }

  nodes.push(sourceObject);
  return nodes;
};

exports.onPostBuild = /*#__PURE__*/function () {
  var _ref13 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(_ref12, pluginOptions) {
    var graphql, pathPrefix, queryRecords, options, indexSitemapFile, resourcesSitemapFile, languageSitemapFile, defaultQueryRecords, manager, serializedResources, _loop4, language, resourcesSiteMapsArray, _loop5, _language, _iterator2, _step2, source, languageSiteMap, _filePath, indexSiteMap, _i, _resourcesSiteMapsArr, _language2, _iterator3, _step3, sitemap, filePath;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            graphql = _ref12.graphql, pathPrefix = _ref12.pathPrefix;
            // Passing the config option addUncaughtPages will add all pages which are not covered by passed mappings
            // to the default `pages` sitemap. Otherwise they will be ignored.
            options = pluginOptions.addUncaughtPages ? _lodash.default.merge(_defaults.default, pluginOptions) : Object.assign(_defaults.default, pluginOptions); // PUBLICPATH = `.public`; INDEXFILE = `/sitemap.xml`

            indexSitemapFile = _path.default.join(PUBLICPATH, pathPrefix, INDEXFILE); // RESOURCESFILE = `/sitemap_:resource.xml`

            resourcesSitemapFile = _path.default.join(PUBLICPATH, pathPrefix, RESOURCESFILE);
            languageSitemapFile = _path.default.join(PUBLICPATH, pathPrefix, LANGUAGESFILE);
            delete options.plugins;
            delete options.createLinkInHead;
            options.indexOutput = INDEXFILE;
            options.resourcesOutput = RESOURCESFILE;
            options.languagesOutput = LANGUAGESFILE; // We always query siteAllPage as well as the site query to
            // get data we need and to also allow not passing any custom
            // query or mapping

            _context2.next = 12;
            return runDefaultQuery(graphql, {
              query: DEFAULTQUERY,
              exclude: options.exclude
            });

          case 12:
            defaultQueryRecords = _context2.sent;

            if (!(!options.query || !options.mapping)) {
              _context2.next = 17;
              break;
            }

            options.mapping = options.mapping || DEFAULTMAPPING;
            _context2.next = 20;
            break;

          case 17:
            _context2.next = 19;
            return runQuery(graphql, options);

          case 19:
            queryRecords = _context2.sent;

          case 20:
            // Instanciate the Sitemaps Manager
            manager = new _SiteMapManager.default(options);
            _context2.next = 23;
            return serialize(queryRecords, defaultQueryRecords, options);

          case 23:
            serializedResources = _context2.sent;

            _loop4 = function _loop4(language) {
              var _loop6 = function _loop6(type) {
                serializedResources[0][language][type].forEach(function (node) {
                  manager.addUrls(language, type, node);
                });
              };

              for (var type in serializedResources[0][language]) {
                _loop6(type);
              }
            };

            // add resources urls to their respective sitemaps
            for (language in serializedResources[0]) {
              _loop4(language);
            } // // The siteUrl is only available after we have the returned query results


            options.siteUrl = siteUrl;
            options.pathPrefix = pathPrefix; // // STYLING

            _context2.next = 30;
            return copyStylesheet(options);

          case 30:
            // const languageSiteMapsArray = [];
            resourcesSiteMapsArray = [];
            options.languages = {};

            _loop5 = function _loop5(_language) {
              options.languages[_language] = serializeSources(options.mapping[_language]);
              var languageArray = []; // THIS BEGINS TO WRITE FILES FOR THE RESOURCES

              options.languages[_language].forEach(function (type) {
                if (!type.url) {
                  // for each passed name we want to receive the related source type
                  languageArray.push({
                    type: type.name,
                    language: _language,
                    xml: manager.getSiteMapXml(_language, type.sitemap, options)
                  });
                  resourcesSiteMapsArray.push(languageArray);
                }
              });
            };

            for (_language in options.mapping) {
              _loop5(_language);
            }

            options.languageSources = serializeLanguageSources(options); // write language sitemap files

            _iterator2 = _createForOfIteratorHelperLoose(options.languageSources);

          case 36:
            if ((_step2 = _iterator2()).done) {
              _context2.next = 50;
              break;
            }

            source = _step2.value;
            languageSiteMap = manager.getLanguageXml(source.name, options);
            _filePath = languageSitemapFile.replace(/:language/, source.name);
            _context2.prev = 40;
            _context2.next = 43;
            return _fsExtra.default.writeFile(_filePath, languageSiteMap);

          case 43:
            _context2.next = 48;
            break;

          case 45:
            _context2.prev = 45;
            _context2.t0 = _context2["catch"](40);
            console.error(_context2.t0);

          case 48:
            _context2.next = 36;
            break;

          case 50:
            // write index sitemap file
            indexSiteMap = manager.getIndexXml(options); // Save the generated xml files in the public folder

            _context2.prev = 51;
            _context2.next = 54;
            return _fsExtra.default.writeFile(indexSitemapFile, indexSiteMap);

          case 54:
            _context2.next = 59;
            break;

          case 56:
            _context2.prev = 56;
            _context2.t1 = _context2["catch"](51);
            console.error(_context2.t1);

          case 59:
            _i = 0, _resourcesSiteMapsArr = resourcesSiteMapsArray;

          case 60:
            if (!(_i < _resourcesSiteMapsArr.length)) {
              _context2.next = 79;
              break;
            }

            _language2 = _resourcesSiteMapsArr[_i];
            _iterator3 = _createForOfIteratorHelperLoose(_language2);

          case 63:
            if ((_step3 = _iterator3()).done) {
              _context2.next = 76;
              break;
            }

            sitemap = _step3.value;
            filePath = resourcesSitemapFile.replace(/:language/, sitemap.language).replace(/:resource/, sitemap.type);
            _context2.prev = 66;
            _context2.next = 69;
            return _fsExtra.default.writeFile(filePath, sitemap.xml);

          case 69:
            _context2.next = 74;
            break;

          case 71:
            _context2.prev = 71;
            _context2.t2 = _context2["catch"](66);
            console.error(_context2.t2);

          case 74:
            _context2.next = 63;
            break;

          case 76:
            _i++;
            _context2.next = 60;
            break;

          case 79:
            return _context2.abrupt("return");

          case 80:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[40, 45], [51, 56], [66, 71]]);
  }));

  return function (_x2, _x3) {
    return _ref13.apply(this, arguments);
  };
}();