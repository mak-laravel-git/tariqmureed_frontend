import type { LegalPage } from "@/lib/api/types";
import { buildMockLegalPage } from "@/lib/mocks/sections";

/**
 * Built-in Privacy Policy and Cookie page text.
 *
 * This is what visitors see until the page is edited in the admin dashboard (Legal Pages). It describes
 * what the code in this repository actually does (Google Analytics, AdSense, the consent cookie, the
 * newsletter form), so update it in the same change whenever a service is added or removed.
 * The contact card comes from Website Settings, not from this file.
 */

export const LEGAL_LAST_UPDATED = "22 November 2026";

const GOOGLE_PARTNER_SITES_URL = "https://policies.google.com/technologies/partner-sites";
const GOOGLE_PRIVACY_URL = "https://policies.google.com/privacy";
const GOOGLE_AD_SETTINGS_URL = "https://adssettings.google.com";
const GOOGLE_ANALYTICS_OPT_OUT_URL = "https://tools.google.com/dlpage/gaoptout";

const NO_CONTACT: LegalPage["contact"] = { email: "", address: "" };

export function buildPrivacyPolicy(): LegalPage {
  return {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description: "What TMN Sport collects, why we collect it, who we share it with, and the choices available to you.",
    contact: NO_CONTACT,
    privacySettings: true,
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          `TMN Sport ("we", "us") runs this cricket website with live scores, news, statistics and video. This policy explains how we handle information about visitors. Last updated: ${LEGAL_LAST_UPDATED}.`,
        ],
      },
      {
        heading: "What we collect and why",
        paragraphs: ["When you visit the site we or our service providers may receive:"],
        bullets: [
          "Technical data your browser sends automatically, such as your IP address, browser and device type, and the pages you request. We use it to deliver the site, keep it secure and fix faults.",
          "Usage data from Google Analytics, only if you allow analytics cookies. We use it to understand which pages are read and to improve the site.",
          "Advertising data from Google AdSense and its advertising partners, only if you allow advertising cookies. It is used to show and measure ads.",
          "Your email address, only if you subscribe to our newsletter. We use it only to send that newsletter.",
          "Search words you type into our search box. They are used to return results and are not linked to your identity.",
        ],
      },
      {
        heading: "Google Analytics",
        paragraphs: [
          "If you allow analytics cookies, we use Google Analytics, a service of Google. It sets cookies on this website's domain and reports page views and how visitors use the site. We send Google the page address without any query string, and we never put names, email addresses or other personal details in analytics events or page addresses.",
          `You can withdraw your choice at any time with the Privacy settings link at the bottom of every page. Google also offers a [browser add-on to opt out of Google Analytics](${GOOGLE_ANALYTICS_OPT_OUT_URL}).`,
        ],
      },
      {
        heading: "Google AdSense and advertising partners",
        paragraphs: [
          "If you allow advertising cookies, we show ads served by Google AdSense. Google and other third-party advertising partners may place and read cookies, or use web beacons, IP addresses and similar identifiers, on your device when ads are served on this site. They use this to show and measure ads, including ads based on your visits to this and other websites, and to prevent fraud.",
          `To learn how Google uses data when you use our partners' sites or apps, see [How Google uses data when you use our partners' sites or apps](${GOOGLE_PARTNER_SITES_URL}). You can manage ad personalisation in your [Google Ad Settings](${GOOGLE_AD_SETTINGS_URL}). Google's own policy is at [policies.google.com/privacy](${GOOGLE_PRIVACY_URL}).`,
          "If you do not allow advertising cookies, we do not load the AdSense code and no Google advertising cookies are set through this site.",
        ],
      },
      {
        heading: "Your cookie choices",
        paragraphs: [
          "The first time you visit, a banner lets you accept all, decline all, or choose by category. Declining is as easy as accepting, and the site works the same either way. Nothing from Google is loaded until you allow it.",
          "You can change your mind at any time using the Privacy settings link in the footer of every page, or on our Cookie Preferences page. Withdrawing consent stops further collection straight away.",
        ],
      },
      {
        heading: "Who we share information with",
        paragraphs: [
          "We do not sell your personal information. We share information only with:",
        ],
        bullets: [
          "Google, for analytics and advertising, and only for the categories you allow.",
          "Hosting and infrastructure providers that run this site for us, under our instructions.",
          "Our email delivery provider, if you subscribe to the newsletter.",
          "Authorities, when the law requires it.",
        ],
      },
      {
        heading: "Personal information and Google",
        paragraphs: [
          "We do not send information that could identify you personally, such as your name or email address, to Google through ad tags, analytics events or page addresses. The newsletter form sends your email address only to our own servers. We do not load advertising code on search results pages, because their address contains the words you typed.",
        ],
      },
      {
        heading: "Location",
        paragraphs: [
          "We do not collect your precise location (for example GPS, Wi-Fi or mobile-tower data) and no feature of this site asks your browser for it. Like any website, we and Google can infer an approximate location, such as your country or city, from your IP address.",
        ],
      },
      {
        heading: "Children",
        paragraphs: [
          "TMN Sport is a general-audience cricket site. It is not directed at children under 13 and no section is designed for them. We do not knowingly collect personal information from children. If you believe a child has given us personal information, please contact us and we will delete it.",
        ],
      },
      {
        heading: "How long we keep information",
        paragraphs: [
          "Your cookie choice is remembered for 180 days. Server logs are kept for a short period for security and fault-finding. Newsletter addresses are kept until you unsubscribe. Google keeps analytics and advertising data under its own retention settings.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "Depending on where you live, you may have the right to access, correct or delete personal information we hold about you, to object to or restrict its use, and to withdraw consent at any time. Contact us using the details shown on this page and we will respond promptly.",
        ],
      },
      {
        heading: "Changes to this policy",
        paragraphs: [
          "We will update this page when our practices change and show the new date at the top. Significant changes will be highlighted on the site.",
        ],
      },
    ],
  };
}

export function buildCookiePreferences(): LegalPage {
  return {
    slug: "cookie-preferences",
    title: "Cookie Preferences",
    description: "How TMN Sport uses cookies and how you can control them.",
    contact: NO_CONTACT,
    privacySettings: true,
    sections: [
      {
        heading: "Your choices",
        paragraphs: [
          "You can accept, decline or manage cookies by category, and change your mind whenever you like. Use the button on this page or the Privacy settings link in the footer of any page.",
        ],
      },
      {
        heading: "Essential cookies",
        paragraphs: [
          "These keep the site working and remember your choice. They cannot be switched off.",
        ],
        bullets: [
          "tmn_consent: stores your cookie choice on this site for 180 days.",
          "tmn_tz: your device's time zone, so the schedule and live score pages show your own dates, kept for 1 year.",
        ],
      },
      {
        heading: "Analytics cookies",
        paragraphs: [
          "Set by Google Analytics only if you allow analytics. They count visits and show which pages are read.",
        ],
        bullets: ["_ga and _ga_*: distinguish visitors and sessions, kept for up to 2 years."],
      },
      {
        heading: "Advertising cookies",
        paragraphs: [
          `Set by Google AdSense and its advertising partners only if you allow advertising. They are used to show, limit and measure ads. See [how Google uses data when you use our partners' sites or apps](${GOOGLE_PARTNER_SITES_URL}).`,
        ],
        bullets: [
          "__gads, __gpi and similar: set on this site's domain by Google to measure and limit ads.",
          "Cookies on Google and advertising-partner domains: set and controlled by those companies, not by us.",
        ],
      },
      {
        heading: "Managing cookies in your browser",
        paragraphs: [
          "Most browsers let you review, block or delete cookies. Blocking essential cookies may stop parts of the site from working, and we will ask for your choice again.",
        ],
      },
    ],
  };
}

/** The page shown while nothing has been saved for it in the admin dashboard. */
export function builtInLegalPage(slug: string): LegalPage | null {
  if (slug === "privacy-policy") {
    return buildPrivacyPolicy();
  }

  if (slug === "cookie-preferences") {
    return buildCookiePreferences();
  }

  return buildMockLegalPage(slug);
}
