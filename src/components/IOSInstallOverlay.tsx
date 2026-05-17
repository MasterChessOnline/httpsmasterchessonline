/**
 * Disabled by product decision: iPhone/iPad users must NEVER see any
 * install prompt, overlay, or "Install App" CTA. Apple's manual
 * Share → Add to Home Screen flow is intentionally not surfaced.
 */
export default function IOSInstallOverlay() {
  return null;
}
