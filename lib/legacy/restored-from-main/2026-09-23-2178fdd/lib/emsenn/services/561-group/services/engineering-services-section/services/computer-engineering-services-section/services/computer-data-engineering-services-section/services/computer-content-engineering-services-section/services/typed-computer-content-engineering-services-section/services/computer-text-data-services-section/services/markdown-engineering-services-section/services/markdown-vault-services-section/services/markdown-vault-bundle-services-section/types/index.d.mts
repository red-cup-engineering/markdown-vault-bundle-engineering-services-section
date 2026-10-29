export type MarkdownVaultBundleRole = "glossary-terms" | "glossary-topics" | "glossary-concepts" | "articles";

export declare const MARKDOWN_VAULT_BUNDLE_ROLES: readonly MarkdownVaultBundleRole[];
export declare const DEFAULT_MARKDOWN_VAULT_BUNDLE_EXCLUDES: readonly string[];
export declare const DEFAULT_MARKDOWN_VAULT_BUNDLE_WORD_BUDGET: number;
export declare const MAX_MARKDOWN_VAULT_BUNDLE_FILES: number;

export declare function roleOfMarkdownVaultCarrier(path: string): MarkdownVaultBundleRole | null;
export declare function isMarkdownVaultBundleStaging(path: string): boolean;

export interface MarkdownVaultBundleSelection {
  readonly root: string;
  readonly roles: readonly MarkdownVaultBundleRole[];
  readonly carriers: readonly { readonly path: string }[];
  readonly scanned: number;
  readonly excluded: number;
}

export declare function selectMarkdownVaultCarriers(options: {
  readonly root: string;
  readonly roles?: readonly MarkdownVaultBundleRole[];
  readonly excludes?: readonly string[];
  readonly maxScan?: number;
}): Promise<MarkdownVaultBundleSelection>;

export interface RenderedMarkdownVaultCarrier {
  readonly path: string;
  readonly name: string;
  readonly digest: string;
  readonly text: string;
  readonly wordCount: number;
}

export declare function renderMarkdownVaultCarrier(carrier: { readonly path: string; readonly markdown: string }): RenderedMarkdownVaultCarrier;

export interface MarkdownVaultBundleGroup {
  readonly key: string;
  readonly label: string;
  readonly carriers: readonly RenderedMarkdownVaultCarrier[];
}

export declare function groupMarkdownVaultCarriers(
  carriers: readonly RenderedMarkdownVaultCarrier[],
  options?: { readonly rootLabel?: string },
): readonly MarkdownVaultBundleGroup[];

export interface PackedMarkdownVaultBundleFile {
  readonly index: number;
  readonly wordCount: number;
  readonly entries: readonly {
    readonly path: string;
    readonly digest: string;
    readonly groupLabel: string;
    readonly text: string;
    readonly wordCount: number;
    readonly headerNeeded: boolean;
  }[];
}

export declare function packMarkdownVaultBundleFiles(
  groups: readonly MarkdownVaultBundleGroup[],
  options?: { readonly wordBudget?: number; readonly maxFiles?: number },
): readonly PackedMarkdownVaultBundleFile[];

export declare function renderMarkdownVaultBundleFile(options: {
  readonly file: PackedMarkdownVaultBundleFile;
  readonly totalFiles: number;
  readonly title: string;
}): string;

export interface MarkdownVaultBundleManifestCarrier {
  readonly path: string;
  readonly bundleFile: string;
  readonly digest: string;
}

export interface MarkdownVaultBundleManifest {
  readonly root: string;
  readonly rootLabel: string;
  readonly roles: readonly MarkdownVaultBundleRole[];
  readonly wordBudget: number;
  readonly maxFiles: number;
  readonly files: readonly { readonly filename: string; readonly wordCount: number; readonly carrierCount: number }[];
  readonly carriers: readonly MarkdownVaultBundleManifestCarrier[];
  readonly defects: readonly { readonly path: string; readonly reason: string }[];
}

export interface MarkdownVaultBundleFile {
  readonly filename: string;
  readonly text: string;
  readonly wordCount: number;
  readonly carrierCount: number;
}

export interface MarkdownVaultBundleResult {
  readonly files: readonly MarkdownVaultBundleFile[];
  readonly manifest: MarkdownVaultBundleManifest;
  readonly scanned: number;
  readonly excluded: number;
  readonly defects: readonly { readonly path: string; readonly reason: string }[];
}

export declare function bundleMarkdownVaultCarriers(options: {
  readonly root: string;
  readonly roles?: readonly MarkdownVaultBundleRole[];
  readonly excludes?: readonly string[];
  readonly wordBudget?: number;
  readonly maxFiles?: number;
  readonly rootLabel?: string;
}): Promise<MarkdownVaultBundleResult>;
