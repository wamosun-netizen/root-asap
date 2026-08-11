// netlify/functions/news.js
//
// Server-side proxy for the Mediastack news API. Keeps the API key out of
// client-side JS (Mediastack's own docs say not to use the key client-side)
// and gives us a stable same-origin endpoint the front end can call.
//
// Requires a MEDIASTACK_API_KEY environment variable set in Netlify's
// Project configuration > Environment variables.

exports.handler = async function () {
  const API_KEY = process.env.MEDIASTACK_API_KEY;

    if (!API_KEY) {
        return {
              statusCode: 500,
                    headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ error: "MEDIASTACK_API_KEY is not configured" }),
                              };
                                }

                                  // Nigeria, Kenya, Ghana, South Africa, Egypt -- core markets for Root ASAP's diaspora audience
                                    const countries = "ng,ke,gh,za,eg";
                                      const params = new URLSearchParams({
                                          access_key: API_KEY,
                                              countries: countries,
                                                  languages: "en",
                                                      categories: "business,general",
                                                          sort: "published_desc",
                                                              limit: "10",
                                                                });

                                                                  const url = "https://api.mediastack.com/v1/news?" + params.toString();

                                                                    try {
                                                                        const res = await fetch(url);
                                                                            const json = await res.json();

                                                                                if (json.error) {
                                                                                      return {
                                                                                              statusCode: 502,
                                                                                                      headers: { "Content-Type": "application/json" },
                                                                                                              body: JSON.stringify({ error: json.error.message || "Mediastack API error" }),
                                                                                                                    };
                                                                                                                        }
                                                                                                                        
                                                                                                                            const articles = (json.data || [])
                                                                                                                                  .filter(function (a) {
                                                                                                                                          return a && a.title && a.url;
                                                                                                                                                })
                                                                                                                                                      .map(function (a) {
                                                                                                                                                              return {
                                                                                                                                                                        title: a.title,
                                                                                                                                                                                  url: a.url,
                                                                                                                                                                                            source: a.source,
                                                                                                                                                                                                      country: a.country,
                                                                                                                                                                                                                published_at: a.published_at,
                                                                                                                                                                                                                        };
                                                                                                                                                                                                                              });
                                                                                                                                                                                                                              
                                                                                                                                                                                                                                  return {
                                                                                                                                                                                                                                        statusCode: 200,
                                                                                                                                                                                                                                              headers: {
                                                                                                                                                                                                                                                      "Content-Type": "application/json",
                                                                                                                                                                                                                                                              "Cache-Control": "public, max-age=1800",
                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                          body: JSON.stringify({ articles: articles }),
                                                                                                                                                                                                                                                                              };
                                                                                                                                                                                                                                                                                } catch (err) {
                                                                                                                                                                                                                                                                                    return {
                                                                                                                                                                                                                                                                                          statusCode: 500,
                                                                                                                                                                                                                                                                                                headers: { "Content-Type": "application/json" },
                                                                                                                                                                                                                                                                                                      body: JSON.stringify({ error: "Failed to fetch news" }),
                                                                                                                                                                                                                                                                                                          };
                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                            };
                                                                                                                                                                                                                                                                                                            
