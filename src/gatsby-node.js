import path from "path";
import url from "url";
import fs from "fs-extra";
// import _ from "lodash";
import R from "ramda";

import defaultOptions from "./defaults";
import Manager from "./SiteMapManager";

const PUBLICPATH = `./public`;
const INDEXFILE = `/sitemap.xml`;
const LANGUAGESFILE = `/:language/sitemap.xml`;
const RESOURCESFILE = `/:language/sitemap_:resource.xml`;
const XSLFILE = path.resolve(__dirname, `./static/sitemap.xsl`);
const DEFAULTQUERY = `{
  allSitePage {
    edges {
      node {
        id
        slug: path
        url: path
      }
    }
  }
  site {
    siteMetadata {
      siteUrl
    }
  }
}`;
const DEFAULTMAPPING = {
    allSitePage: {
        sitemap: `pages`,
    },
};
let siteUrl;

const copyStylesheet = async ({
    siteUrl,
    pathPrefix,
    indexOutput,
    mapping,
}) => {
    const siteRegex = /(\{\{blog-url\}\})/g;

    // Get our stylesheet template
    const data = await fs.readFile(XSLFILE);

    // Replace the `{{blog-url}}` variable with our real site URL
    const sitemapStylesheet = data
        .toString()
        .replace(
            siteRegex,
            url.resolve(siteUrl, path.join(pathPrefix, indexOutput))
        );

    // Save the updated stylesheet to the public folder, so it will be
    // available for the xml sitemap files
    await fs.writeFile(path.join(PUBLICPATH, `sitemap.xsl`), sitemapStylesheet);

    for (let language in mapping) {
        await fs.writeFile(
            path.join(PUBLICPATH, language, `sitemap.xsl`),
            sitemapStylesheet
        );
    }
};

const serializeMarkdownNodes = (node) => {
    if (!node.fields.slug) {
        throw Error(`\`slug\` is a required field`);
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
};

// Compare our node paths with the ones that Gatsby has generated and updated them
// with the "real" used ones.
const getNodePath = (node, allSitePage) => {
    if (!node.path || node.path === `/`) {
        return node;
    }
    const slugRegex = new RegExp(`${node.path.replace(/\/$/, ``)}$`, `gi`);

    for (let page of allSitePage.edges) {
        if (
            page.node &&
            page.node.url &&
            page.node.url.replace(/\/$/, ``).match(slugRegex)
        ) {
            node.path = page.node.url;
            break;
        }
    }

    return node;
};

// Add all other URLs that Gatsby generated, using siteAllPage,
// but we didn't fetch with our queries
const addPageNodes = (parsedNodesArray, allSiteNodes, siteUrl) => {
    const [parsedNodes] = parsedNodesArray;
    const pageNodes = [];
    const addedPageNodes = { pages: [] };

    const usedNodes = allSiteNodes.filter(({ node }) => {
        let foundOne;
        for (let type in parsedNodes) {
            parsedNodes[type].forEach((fetchedNode) => {
                if (node.url === fetchedNode.node.path) {
                    foundOne = true;
                }
            });
        }
        return foundOne;
    });

    const remainingNodes = R.difference(allSiteNodes, usedNodes);
    // const remainingNodes = _.difference(allSiteNodes, usedNodes);

    remainingNodes.forEach(({ node }) => {
        addedPageNodes.pages.push({
            url: url.resolve(siteUrl, node.url),
            node: node,
        });
    });

    pageNodes.push(addedPageNodes);

    return pageNodes;
};

const serializeLanguageSources = ({ mapping }) => {
    let sitemaps = [];

    for (let language in mapping) {
        sitemaps.push(language);
    }

    sitemaps = R.map(sitemaps, (source) => {
        return {
            name: source,
            sitemap: source,
        };
    });
    // sitemaps = _.map(sitemaps, (source) => {
    //     return {
    //         name: source,
    //         sitemap: source,
    //     };
    // });

    sitemaps = R.uniqBy(sitemaps, `name`);
    // sitemaps = _.uniqBy(sitemaps, `name`);

    return sitemaps;
};

const serializeSources = (language) => {
    let sitemaps = [];

    for (let resourceType in language) {
        sitemaps.push(language[resourceType]);
    }

    sitemaps = R.map(sitemaps, (source) => {
        return {
            name: source.name ? source.name : source.sitemap,
            sitemap: source.sitemap || `pages`,
        };
    });
    // sitemaps = _.map(sitemaps, (source) => {
    //     return {
    //         name: source.name ? source.name : source.sitemap,
    //         sitemap: source.sitemap || `pages`,
    //     };
    // });

    sitemaps = R.uniqBy(sitemaps, `name`);
    // sitemaps = _.uniqBy(sitemaps, `name`);
    return sitemaps;
};

const runDefaultQuery = (handler, { query, exclude }) =>
    handler(query).then((r) => {
        if (r.errors) {
            throw new Error(r.errors.join(`, `));
        }

        return r.data;
    });

const runQuery = (handler, { query, exclude }) =>
    handler(query).then((r) => {
        if (r.errors) {
            throw new Error(r.errors.join(`, `));
        }
        let languages = [];
        let queryResults = {};

        for (let contentType in r.data) {
            if (r.data[contentType]?.edges?.length) {
                r.data[contentType].edges.forEach((edge) => {
                    const language = edge?.node?.node_locale;
                    if (language) languages.push(language);
                });
            }
        }

        languages = R.uniq(languages);
        // languages = _.uniq(languages);

        languages.forEach((language) => {
            queryResults[language] = {};
            for (let contentType in r.data) {
                queryResults[language][contentType] = {};
                queryResults[language][contentType]["edges"] = [];
                if (r.data[contentType]?.edges?.length) {
                    r.data[contentType].edges.forEach((node) => {
                        const node_locale = node?.node?.node_locale;
                        // exclude no index pages
                        const noIndex = node?.node?.layoutType?.noIndex;
                        if (
                            node_locale &&
                            node_locale === language &&
                            !noIndex
                        ) {
                            queryResults[language][contentType].edges.push(
                                node
                            );
                        }
                    });
                }
            }
        });

        return queryResults;
    });

const serialize = (
    { ...sources } = {},
    { site, allSitePage },
    { mapping, addUncaughtPages }
) => {
    const nodes = [];
    const sourceObject = {};

    siteUrl = site.siteMetadata.siteUrl;

    for (let language in sources) {
        for (let type in sources[language]) {
            if (
                mapping[language] &&
                mapping[language][type] &&
                mapping[language][type].sitemap
            ) {
                const currentSource = sources[language][type]
                    ? sources[language][type]
                    : [];

                if (currentSource) {
                    sourceObject[language] = sourceObject[language] || {};
                    sourceObject[language][mapping[language][type].sitemap] =
                        sourceObject[language][
                            mapping[language][type].sitemap
                        ] || [];

                    currentSource.edges.map(({ node }) => {
                        if (!node) {
                            return;
                        }

                        if (mapping[language][type].path) {
                            node.path = path.resolve(
                                mapping[language][type].path,
                                node.slug
                            );
                        } else {
                            node.path = `/${node.node_locale}/${node.slug}`;
                            // node.path = node.slug
                        }

                        // get the real path for the node, which is generated by Gatsby
                        node = getNodePath(node, allSitePage);

                        sourceObject[language][
                            mapping[language][type].sitemap
                        ].push({
                            url: url.resolve(siteUrl, node.path),
                            node: node,
                        });
                    });
                }
            }
        }
    }
    nodes.push(sourceObject);

    return nodes;
};

exports.onPostBuild = async ({ graphql, pathPrefix }, pluginOptions) => {
    let queryRecords;

    // Passing the config option addUncaughtPages will add all pages which are not covered by passed mappings
    // to the default `pages` sitemap. Otherwise they will be ignored.
    const options = pluginOptions.addUncaughtPages
        ? R.mergeDeepRight(defaultOptions, pluginOptions)
        : // ? _.merge(defaultOptions, pluginOptions)
          Object.assign(defaultOptions, pluginOptions);
    // PUBLICPATH = `.public`; INDEXFILE = `/sitemap.xml`
    const indexSitemapFile = path.join(PUBLICPATH, pathPrefix, INDEXFILE);
    // RESOURCESFILE = `/sitemap_:resource.xml`
    const resourcesSitemapFile = path.join(
        PUBLICPATH,
        pathPrefix,
        RESOURCESFILE
    );
    const languageSitemapFile = path.join(
        PUBLICPATH,
        pathPrefix,
        LANGUAGESFILE
    );

    delete options.plugins;
    delete options.createLinkInHead;

    options.indexOutput = INDEXFILE;
    options.resourcesOutput = RESOURCESFILE;
    options.languagesOutput = LANGUAGESFILE;

    // We always query siteAllPage as well as the site query to
    // get data we need and to also allow not passing any custom
    // query or mapping
    const defaultQueryRecords = await runDefaultQuery(graphql, {
        query: DEFAULTQUERY,
        exclude: options.exclude,
    });

    // Don't run this query when no query and mapping is passed
    if (!options.query || !options.mapping) {
        options.mapping = options.mapping || DEFAULTMAPPING;
    } else {
        queryRecords = await runQuery(graphql, options);
    }

    // Instanciate the Sitemaps Manager
    const manager = new Manager(options);

    const serializedResources = await serialize(
        queryRecords,
        defaultQueryRecords,
        options
    );

    // add resources urls to their respective sitemaps
    for (let language in serializedResources[0]) {
        for (let type in serializedResources[0][language]) {
            serializedResources[0][language][type].forEach((node) => {
                manager.addUrls(language, type, node);
            });
        }
    }

    // // The siteUrl is only available after we have the returned query results
    options.siteUrl = siteUrl;
    options.pathPrefix = pathPrefix;

    // // STYLING
    await copyStylesheet(options);

    // const languageSiteMapsArray = [];

    const resourcesSiteMapsArray = [];

    options.languages = {};
    for (let language in options.mapping) {
        options.languages[language] = serializeSources(
            options.mapping[language]
        );
        const languageArray = [];
        // THIS BEGINS TO WRITE FILES FOR THE RESOURCES
        options.languages[language].forEach((type) => {
            if (!type.url) {
                // for each passed name we want to receive the related source type
                languageArray.push({
                    type: type.name,
                    language: language,
                    xml: manager.getSiteMapXml(language, type.sitemap, options),
                });
                resourcesSiteMapsArray.push(languageArray);
            }
        });
    }

    options.languageSources = serializeLanguageSources(options);

    // write language sitemap files
    for (let source of options.languageSources) {
        const languageSiteMap = manager.getLanguageXml(source.name, options);
        const filePath = languageSitemapFile.replace(/:language/, source.name);

        try {
            await fs.writeFile(filePath, languageSiteMap);
        } catch (err) {
            console.error(err);
        }
    }

    // write index sitemap file
    const indexSiteMap = manager.getIndexXml(options);
    // Save the generated xml files in the public folder
    try {
        await fs.writeFile(indexSitemapFile, indexSiteMap);
    } catch (err) {
        console.error(err);
    }

    // write resources files
    for (let language of resourcesSiteMapsArray) {
        for (let sitemap of language) {
            const filePath = resourcesSitemapFile
                .replace(/:language/, sitemap.language)
                .replace(/:resource/, sitemap.type);

            try {
                await fs.writeFile(filePath, sitemap.xml);
            } catch (err) {
                console.error(err);
            }
        }
    }

    return;
};
