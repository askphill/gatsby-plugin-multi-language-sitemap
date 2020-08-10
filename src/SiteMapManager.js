import SiteMapIndexGenerator from "./IndexMapGenerator";
import SiteMapGenerator from "./SiteMapGenerator";
import SiteMapLanguageGenerator from "./LanguageMapGenerator";
import _ from "lodash";

export default class SiteMapManager {
    constructor(options) {
        let sitemapTypes = [];

        let sitemapLanguages = [];

        options = options || {};

        this.options = options;

        for (let language in options.mapping) {
            for (let contentType in options.mapping[language]) {
                const sitemapType =
                    options.mapping[language][contentType].sitemap;
                sitemapTypes.push(sitemapType);
            }
        }

        for (let language in options.mapping) {
            sitemapLanguages.push(language);
        }

        // ensure, we have a cleaned up array
        sitemapTypes = _.uniq(sitemapTypes);

        sitemapLanguages = _.uniq(sitemapLanguages);

        for (let language of sitemapLanguages) {
            for (let type of sitemapTypes) {
                this[`${language}-${type}`] =
                    // (options[language] && options[language][type]) ||
                    this.createSiteMapGenerator(options, type);
            }

            this[language] =
                // options[language] ||
                this.createLanguageGenerator(sitemapTypes, language);
        }

        this.index =
            options.index || this.createIndexGenerator(sitemapLanguages);
    }

    // NEED TO MODIFY TO LANGUAGES
    createIndexGenerator(sitemapLanguages) {
        const languages = {};

        sitemapLanguages.forEach(
            (language) => (languages[language] = this[language])
        );

        return new SiteMapIndexGenerator({
            languages: languages,
        });
    }

    // this[language] is not properly constructed, so that .getXml of undefined
    // should be a sitemapgenerator, that has sitemap url elements
    createLanguageGenerator(sitemapTypes, language) {
        const types = {};

        sitemapTypes.forEach(
            (type) => (types[type] = this[`${language}-${type}`])
        );

        return new SiteMapLanguageGenerator({
            types: types,
        });
    }

    createSiteMapGenerator(options, type) {
        return new SiteMapGenerator(options, type);
    }

    getIndexXml(options) {
        return this.index.getXml(options);
    }

    getLanguageXml(language, options) {
        return this[language].getXml(language, options);
    }

    getSiteMapXml(language, type, options) {
        return this[`${language}-${type}`].getXml(options);
    }

    // populate the basic sitemap generator with destination urls
    addUrls(language, type, { url, node }) {
        return this[`${language}-${type}`].addUrl(url, node);
    }
}
