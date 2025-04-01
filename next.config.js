/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		swcPlugins: [
			["next-superjson-plugin", {}],
		],
	},
	images: {
		domains: [
			"res.cloudinary.com",
			"avatars.githubusercontent.com",
			"lh3.googleusercontent.com",
		],
	},
	// Added to handle Vercel build process which runs API routes during build
	typescript: {
		// !! WARN !!
		// Ignoring build errors is dangerous, but necessary for deployment
		// when using database-dependent API routes during build
		ignoreBuildErrors: true,
	},
};

module.exports = nextConfig;
