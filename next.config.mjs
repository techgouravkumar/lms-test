/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
				pathname: "/**", // This allows all paths in Cloudinary
			},
			{
				protocol: "https",
				hostname: "plus.unsplash.com",
				pathname: "/**", // This allows all paths in Unsplash
			},
			{
				protocol: "https",
				hostname: "encrypted-tbn0.gstatic.com",
				pathname: "/**", // This allows all paths on encrypted-tbn0.gstatic.com
			},
		],
	},
	output: 'standalone'
};

export default nextConfig;
