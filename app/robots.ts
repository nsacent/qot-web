import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/account/",
                    "/admin/",
                    "/login",
                    "/register",
                    "/forgot-password",
                    "/reset-password",
                    "/verification",
                    "/post-ad",
                    "/messages/",
                    "/my-ads/",
                    "/my-listings/",
                    "/notifications",
                    "/recently-viewed",
                    "/saved-searches",
                ],
            },
        ],
        sitemap: "https://qot.ug/sitemap.xml",
        host: "https://qot.ug",
    };
}
