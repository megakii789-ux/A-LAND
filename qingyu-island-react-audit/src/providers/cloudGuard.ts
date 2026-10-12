/** These legacy classes contain memory doubles, not deployed Firebase services. */
export function requireImplementedCloudAdapter(): never {
  throw new Error('CLOUD_ADAPTER_NOT_IMPLEMENTED: use a verified implementation, not the legacy memory double');
}
