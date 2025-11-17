import helmet from "helmet";

const helmetMiddleware = helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'"],
			styleSrc: ["'self'"],
			fontSrc: ["'self'"],
			imgSrc: ["'self'"],
		},
	},
	xssFilter: true,
	noSniff: true,
	referrerPolicy: { policy: "strict-origin-when-cross-origin" },
	hsts: {
		maxAge: 31536000,
		includeSubDomains: true,
		preload: true,
	},
});

export default helmetMiddleware;
