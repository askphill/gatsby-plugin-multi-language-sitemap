import _ from "lodash";
import BaseSiteMapGenerator from "./BaseSiteMapGenerator";

export default class SiteMapGenerator extends BaseSiteMapGenerator {
    constructor(opts, type) {
        super();

        this.name = type;

        _.extend(this, opts);
    }
}
