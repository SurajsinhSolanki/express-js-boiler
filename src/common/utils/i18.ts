import path from "node:path";
import type { RequestHandler } from "express";
import i18next from "i18next";
import i18nextHttpMiddleware from "i18next-http-middleware";

// Configure i18next
i18next.use(i18nextHttpMiddleware.LanguageDetector).init({
	fallbackLng: "en",
	preload: ["en", "es"], // Preload all available languages
	ns: ["translation"], // Namespace for translations
	defaultNS: "translation",
	backend: {
		loadPath: path.join(__dirname, "../locales/{{lng}}/{{ns}}.json"),
	},
	detection: {
		order: ["header", "querystring", "cookie"],
		caches: ["cookie"],
	},
	debug: false, // Set to true for debugging i18next
	interpolation: {
		escapeValue: false, // React already escapes values
	},
});

const i18nextMiddleware: RequestHandler = i18nextHttpMiddleware.handle(i18next);
export default i18nextMiddleware;
