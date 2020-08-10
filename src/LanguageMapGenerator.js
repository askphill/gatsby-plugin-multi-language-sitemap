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

export default class SiteMapLanguageGenerator {
    constructor(options) {
        options = options || {};
        this.types = options.types;
    }

    getXml(language, options) {
        const urlElements = this.generateSiteMapUrlElements(options, language);
        const data = {
            // Concat the elements to the _attr declaration
            sitemapindex: [XMLNS_DECLS].concat(urlElements),
        };

        // Return the xml
        return localUtils.getDeclarations(options) + xml(data);
    }

    generateSiteMapUrlElements(
        { languages, siteUrl, pathPrefix, resourcesOutput },
        language
    ) {
        const sources = languages[language];
        return _.map(sources, (source) => {
            const filePath = resourcesOutput
                .replace(/:language/, language)
                .replace(/:resource/, source.name)
                .replace(/^\//, ``);
            const siteMapUrl = source.url
                ? source.url
                : url.resolve(siteUrl, path.join(pathPrefix, filePath));
            const lastModified = source.url
                ? moment(new Date(), moment.ISO_8601).toISOString()
                : this.types[source.sitemap].lastModified ||
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
