import _ from "lodash";
import xml from "xml";
import moment from "moment";
import url from "url";
import path from "path";

import localUtils from "./utils";

const XMLNS_DECLS = {
    _attr: {
        xmlns: `http://www.sitemaps.org/schemas/sitemap/0.9`,
    },
};

export default class SiteMapIndexGenerator {
    constructor(options) {
        options = options || {};
        this.languages = options.languages;
    }

    getXml(options) {
        const urlElements = this.generateSiteMapUrlElements(options);
        const data = {
            // Concat the elements to the _attr declaration
            sitemapindex: [XMLNS_DECLS].concat(urlElements),
        };

        // Return the xml
        return localUtils.getDeclarations(options) + xml(data);
    }

    generateSiteMapUrlElements({
        languageSources,
        siteUrl,
        pathPrefix,
        languagesOutput,
    }) {
        return _.map(languageSources, (source) => {
            const filePath = languagesOutput
                .replace(/:language/, source.name)
                .replace(/^\//, ``);
            const siteMapUrl = source.url
                ? source.url
                : url.resolve(siteUrl, path.join(pathPrefix, filePath));
            const lastModified = source.url
                ? moment(new Date(), moment.ISO_8601).toISOString()
                : this.languages[source.sitemap].lastModified ||
                  moment(new Date(), moment.ISO_8601).toISOString();

            return {
                sitemap: [
                    { loc: siteMapUrl },
                    { lastmod: moment(lastModified).toISOString() },
                ],
            };
        });
    }
}
