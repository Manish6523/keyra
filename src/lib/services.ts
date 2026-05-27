export interface Service {
  name: string
  prefix: string | string[]
  color: string
  logo: string
  url: string
}

export const services: Service[] = [
  { name: "OpenAI", prefix: "sk-", color: "#10A37F", logo: "openai", url: "https://platform.openai.com" },
  { name: "Stripe", prefix: ["pk_live_", "sk_live_", "rk_live_"], color: "#635BFF", logo: "stripe", url: "https://dashboard.stripe.com" },
  { name: "Anthropic", prefix: "sk-ant-", color: "#D4A574", logo: "anthropic", url: "https://console.anthropic.com" },
  { name: "GitHub", prefix: "ghp_", color: "#2DA44E", logo: "github", url: "https://github.com/settings/tokens" },
  { name: "Supabase", prefix: "sbp_", color: "#3ECF8E", logo: "supabase", url: "https://app.supabase.com" },
  { name: "Vercel", prefix: "vcc_", color: "#000000", logo: "vercel", url: "https://vercel.com/account/tokens" },
  { name: "AWS", prefix: ["AKIA", "ASIA"], color: "#FF9900", logo: "aws", url: "https://console.aws.amazon.com" },
  { name: "Google Cloud", prefix: ["AIza", "ya29."], color: "#4285F4", logo: "gcp", url: "https://console.cloud.google.com" },
  { name: "DigitalOcean", prefix: "dop_v1_", color: "#0080FF", logo: "digitalocean", url: "https://cloud.digitalocean.com" },
  { name: "Twilio", prefix: "SK", color: "#F22F46", logo: "twilio", url: "https://console.twilio.com" },
  { name: "SendGrid", prefix: "SG.", color: "#1A82E2", logo: "sendgrid", url: "https://app.sendgrid.com" },
  { name: "Mapbox", prefix: "sk.eyJ", color: "#000000", logo: "mapbox", url: "https://account.mapbox.com" },
  { name: "Cloudflare", prefix: ["cft_", "cf_"], color: "#F38020", logo: "cloudflare", url: "https://dash.cloudflare.com" },
  { name: "PlanetScale", prefix: "pscale_", color: "#000000", logo: "planetscale", url: "https://app.planetscale.com" },
  { name: "Neon", prefix: "neon_", color: "#00E599", logo: "neon", url: "https://console.neon.tech" },
  { name: "Railway", prefix: "rwy_", color: "#7C3AED", logo: "railway", url: "https://railway.app" },
  { name: "Fly.io", prefix: "fly_", color: "#7C3AED", logo: "fly", url: "https://fly.io" },
  { name: "Hetzner", prefix: "hezt_", color: "#D50C2D", logo: "hetzner", url: "https://console.hetzner.cloud" },
  { name: "Linear", prefix: "lin_", color: "#5E6AD2", logo: "linear", url: "https://linear.app" },
  { name: "Notion", prefix: "ntn_", color: "#000000", logo: "notion", url: "https://notion.so" },
  { name: "Slack", prefix: "xoxb-", color: "#4A154B", logo: "slack", url: "https://api.slack.com" },
  { name: "Discord", prefix: ["Mz", "Nz"], color: "#5865F2", logo: "discord", url: "https://discord.com/developers" },
  { name: "Replicate", prefix: "r8_", color: "#1B1B1F", logo: "replicate", url: "https://replicate.com" },
  { name: "Hugging Face", prefix: "hf_", color: "#FFD21E", logo: "huggingface", url: "https://huggingface.co/settings/tokens" },
  { name: "Cohere", prefix: "co-", color: "#39594D", logo: "cohere", url: "https://dashboard.cohere.com" },
  { name: "Axiom", prefix: "xapi-", color: "#FF6A00", logo: "axiom", url: "https://app.axiom.co" },
  { name: "Better Stack", prefix: "bst_", color: "#FFD700", logo: "betterstack", url: "https://betterstack.com" },
  { name: "Sentry", prefix: "sntry_", color: "#FB4226", logo: "sentry", url: "https://sentry.io" },
  { name: "Datadog", prefix: "dd_", color: "#632CA6", logo: "datadog", url: "https://app.datadoghq.com" },
  { name: "New Relic", prefix: "NRAK-", color: "#1CE783", logo: "newrelic", url: "https://one.newrelic.com" },
  { name: "Postmark", prefix: "pm-", color: "#FFE01B", logo: "postmark", url: "https://account.postmarkapp.com" },
  { name: "Resend", prefix: "re_", color: "#000000", logo: "resend", url: "https://resend.com" },
  { name: "Loops", prefix: "loops_", color: "#1E1E1E", logo: "loops", url: "https://app.loops.so" },
  { name: "Knock", prefix: "knk_", color: "#FF5C5C", logo: "knock", url: "https://dashboard.knock.app" },
  { name: "Clerk", prefix: "sk_", color: "#6C47FF", logo: "clerk", url: "https://dashboard.clerk.com" },
  { name: "Auth0", prefix: "A0", color: "#EB5424", logo: "auth0", url: "https://manage.auth0.com" },
  { name: "Magic", prefix: "magic_", color: "#6851FF", logo: "magic", url: "https://dashboard.magic.link" },
  { name: "Web3 Storage", prefix: "web3_", color: "#0066FF", logo: "web3storage", url: "https://web3.storage" },
  { name: "IPFS", prefix: "ipfs_", color: "#65C2CB", logo: "ipfs", url: "https://ipfs.tech" },
  { name: "Pinata", prefix: "pin_", color: "#7B3FE4", logo: "pinata", url: "https://app.pinata.cloud" },
  { name: "Livepeer", prefix: "lpt_", color: "#00A55B", logo: "livepeer", url: "https://livepeer.studio" },
  { name: "Infura", prefix: "inf_", color: "#6C47FF", logo: "infura", url: "https://infura.io" },
  { name: "Alchemy", prefix: "alc_", color: "#0066FF", logo: "alchemy", url: "https://dashboard.alchemy.com" },
  { name: "Moralis", prefix: "mor_", color: "#C73BFF", logo: "moralis", url: "https://admin.moralis.io" },
  { name: "QuickNode", prefix: "qn_", color: "#00C9B6", logo: "quicknode", url: "https://www.quicknode.com" },
  { name: "Transloadit", prefix: "tl_", color: "#2B5797", logo: "transloadit", url: "https://transloadit.com" },
  { name: "UploadThing", prefix: "ut_", color: "#7C3AED", logo: "uploadthing", url: "https://uploadthing.com" },
  { name: "Cloudinary", prefix: "cl_", color: "#3448C5", logo: "cloudinary", url: "https://cloudinary.com" },
]

export function detectService(keyValue: string): Service | undefined {
  const allServicesWithPrefixLength = services.flatMap(s => {
    const prefixes = Array.isArray(s.prefix) ? s.prefix : [s.prefix];
    return prefixes.map(p => ({ service: s, prefix: p, length: p.length }));
  });

  allServicesWithPrefixLength.sort((a, b) => b.length - a.length);

  const matched = allServicesWithPrefixLength.find(sp => keyValue.startsWith(sp.prefix));
  return matched?.service;
}
