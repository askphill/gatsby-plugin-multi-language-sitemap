"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _ramda = _interopRequireDefault(require("ramda"));

var _BaseSiteMapGenerator2 = _interopRequireDefault(require("./BaseSiteMapGenerator"));

// import _ from "lodash";
var SiteMapGenerator = /*#__PURE__*/function (_BaseSiteMapGenerator) {
  (0, _inheritsLoose2.default)(SiteMapGenerator, _BaseSiteMapGenerator);

  function SiteMapGenerator(opts, type) {
    var _this;

    _this = _BaseSiteMapGenerator.call(this) || this;
    _this.name = type;

    _ramda.default.mergeDeepRight((0, _assertThisInitialized2.default)(_this), opts); // _.extend(this, opts);


    return _this;
  }

  return SiteMapGenerator;
}(_BaseSiteMapGenerator2.default);

exports.default = SiteMapGenerator;