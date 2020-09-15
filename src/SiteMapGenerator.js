// import _ from "lodash";
import R from "ramda";
import BaseSiteMapGenerator from "./BaseSiteMapGenerator";

export default class SiteMapGenerator extends BaseSiteMapGenerator {
    constructor(opts, type) {
        super();

        this.name = type;

        R.mergeDeepRight(this, opts);
        // _.extend(this, opts);
    }
}
