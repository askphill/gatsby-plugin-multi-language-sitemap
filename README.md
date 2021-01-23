# gatsby-plugin-multi-language-sitemap

**Work in progress**

*Consult sssgordon when you want to use this plugin*

Instructions: Copy the root directory files and paste it in a directory nested inside your "plugins" directory.

## Example Plugin Configuration

```javascript
// gatsby-config.js

plugins: [
    {
        resolve: `gatsby-plugin-multi-language-sitemap`,
        options: {
            query: `
          {
              allContentfulProduct {
                edges {
                  node {
                    id
                    slug
                    node_locale
                  }
                }
              }
              allContentfulCollection {
                edges {
                  node {
                    id
                    slug
                    node_locale
                  }
                }
              }
              allContentfulBlogPost {
                edges {
                  node {
                    id
                    slug
                    node_locale
                  }
                }
              }
              allContentfulPage {
                edges {
                  node {
                    id
                    slug
                    node_locale
                    layoutType {
                      noIndex
                    }
                  }
                }
              }
              allContentfulTechnologyPage {
                edges {
                  node {
                    id
                    slug
                    node_locale
                  }
                }
              }
              allContentfulFaqPage {
                edges {
                  node {
                    id
                    slug
                    node_locale
                  }
                }
              }
              allContentfulReviewPage {
                edges {
                  node {
                    id
                    slug
                    node_locale
                  }
                }
              }
              allContentfulBlogPage {
                edges {
                  node {
                    id
                    slug
                    node_locale
                  }
                }
              }
              allContentfulStoresPage {
                edges {
                  node {
                    id
                    slug
                    node_locale
                  }
                }
              }
              allContentfulTextPage {
                edges {
                  node {
                    id
                    slug
                    node_locale
                  }
                }
              }
              allContentfulAboutPage {
                edges {
                  node {
                    id
                    slug
                    node_locale
                  }
                }
              }
          }`,
        mapping: {
          en: {
            allContentfulProduct: {
              sitemap: `products`,
            },
            allContentfulCollection: {
              sitemap: `collections`,
            },
            allContentfulBlogPost: {
              sitemap: `blogs`,
            },
            allContentfulAboutPage: {
              sitemap: `pages`,
            },
            allContentfulTechnologyPage: {
              sitemap: `pages`,
            },
            allContentfulPage: {
              sitemap: `pages`,
            },
            allContentfulFaqPage: {
              sitemap: `pages`,
            },
            allContentfulReviewPage: {
              sitemap: `pages`,
            },
            allContentfulStoresPage: {
              sitemap: `pages`,
            },
            allContentfulTextPage: {
              sitemap: `pages`,
            },
            allContentfulBlogPage: {
              sitemap: `pages`,
            },
          },
          nl: {
            allContentfulProduct: {
              sitemap: `products`,
            },
            allContentfulCollection: {
              sitemap: `collections`,
            },
            allContentfulBlogPost: {
              sitemap: `blogs`,
            },
            allContentfulAboutPage: {
              sitemap: `pages`,
            },
            allContentfulTechnologyPage: {
              sitemap: `pages`,
            },
            allContentfulPage: {
              sitemap: `pages`,
            },
            allContentfulFaqPage: {
              sitemap: `pages`,
            },
            allContentfulReviewPage: {
              sitemap: `pages`,
            },
            allContentfulStoresPage: {
              sitemap: `pages`,
            },
            allContentfulTextPage: {
              sitemap: `pages`,
            },
            allContentfulBlogPage: {
              sitemap: `pages`,
            },
          },
          de: {
            allContentfulProduct: {
              sitemap: `products`,
            },
            allContentfulCollection: {
              sitemap: `collections`,
            },
            allContentfulBlogPost: {
              sitemap: `blogs`,
            },
            allContentfulAboutPage: {
              sitemap: `pages`,
            },
            allContentfulTechnologyPage: {
              sitemap: `pages`,
            },
            allContentfulPage: {
              sitemap: `pages`,
            },
            allContentfulFaqPage: {
              sitemap: `pages`,
            },
            allContentfulReviewPage: {
              sitemap: `pages`,
            },
            allContentfulStoresPage: {
              sitemap: `pages`,
            },
            allContentfulTextPage: {
              sitemap: `pages`,
            },
            allContentfulBlogPage: {
              sitemap: `pages`,
            },
          },
          fr: {
            allContentfulProduct: {
              sitemap: `products`,
            },
            allContentfulCollection: {
              sitemap: `collections`,
            },
            allContentfulBlogPost: {
              sitemap: `blogs`,
            },
            allContentfulAboutPage: {
              sitemap: `pages`,
            },
            allContentfulTechnologyPage: {
              sitemap: `pages`,
            },
            allContentfulPage: {
              sitemap: `pages`,
            },
            allContentfulFaqPage: {
              sitemap: `pages`,
            },
            allContentfulReviewPage: {
              sitemap: `pages`,
            },
            allContentfulStoresPage: {
              sitemap: `pages`,
            },
            allContentfulTextPage: {
              sitemap: `pages`,
            },
            allContentfulBlogPage: {
              sitemap: `pages`,
            },
          },
          'en-GB': {
            allContentfulProduct: {
              sitemap: `products`,
            },
            allContentfulCollection: {
              sitemap: `collections`,
            },
            allContentfulBlogPost: {
              sitemap: `blogs`,
            },
            allContentfulAboutPage: {
              sitemap: `pages`,
            },
            allContentfulTechnologyPage: {
              sitemap: `pages`,
            },
            allContentfulPage: {
              sitemap: `pages`,
            },
            allContentfulFaqPage: {
              sitemap: `pages`,
            },
            allContentfulReviewPage: {
              sitemap: `pages`,
            },
            allContentfulStoresPage: {
              sitemap: `pages`,
            },
            allContentfulTextPage: {
              sitemap: `pages`,
            },
            allContentfulBlogPage: {
              sitemap: `pages`,
            },
          },
        },
        exclude: [
          `/dev-404-page`,
          `/404`,
          `/404.html`,
          `/offline-plugin-app-shell-fallback`,
          `/my-excluded-page`,
          /(\/)?hash-\S*/, // you can also pass valid RegExp to exclude internal tags for example
        ],
        }
    }
]
```
