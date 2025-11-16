// For folder copies we will need to build mappings of oldPrefix -> newPrefix later.
// Helper to strip _rt/ prefix for provider keys:
export const providerKeyOf = (dbFullPath: string) =>
  dbFullPath?.startsWith("_rt/") ? dbFullPath.slice(4) : dbFullPath;

// Helper to add _rt/ prefix for provider keys:
export const dbFullPathOf = (providerKey?: string) => `_rt/${providerKey ?? ""}`;
