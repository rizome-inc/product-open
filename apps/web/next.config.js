/** @type {import('next').NextConfig} */

module.exports = {
  // Dev note: Uncomment the below sparingly. It will keep Supabase auth from subscribing multiple times, but
  //           also makes the application lose a lot of purity checks locally
  // reactStrictMode: false,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/projects",
        permanent: false,
      },{
        source: "/login",
        destination: "/signin",
        permanent: false,
      }
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rizo.me"
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net'
      },
      {
        protocol: "https",
        hostname: "supabase.co"
      },
      { // fixme: is this a security concern?
        protocol: "http",
        hostname: "localhost"
      }
    ]
  }
}
