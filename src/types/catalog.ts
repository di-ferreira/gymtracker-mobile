export interface CatalogVersion {
  id: string;
  version_major: number;
  version_minor: number;
  checksum: string;
  status: string;
  description: string | null;
  checksum_algorithm: string;
  sync_metadata: string | null;
  created_at: string;
  updated_at: string;
}
