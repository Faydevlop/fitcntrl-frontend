import { useMemo, useState } from "react";
import type { SortConfig } from "@/hooks/useTableControls";

export interface ServerTableControlsOptions {
  pageSize?: number;
  searchFields?: string[];
  defaultSort?: SortConfig | null;
  sortKeyMap?: Record<string, string>;
}

export type TableQueryPayload = {
  filters?: Record<string, unknown>;
  search?: Array<{
    term?: string;
    fields?: string[];
    startsWith?: boolean;
    endsWith?: boolean;
  }>;
  options?: {
    page?: number;
    itemsPerPage?: number;
    sortBy?: string[];
    sortDesc?: boolean[];
  };
};

export const useServerTableControls = (options: ServerTableControlsOptions = {}) => {
  const { pageSize = 10, searchFields = [], defaultSort = null, sortKeyMap = {} } = options;
  const [search, setSearchValue] = useState("");
  const [sort, setSort] = useState<SortConfig | null>(defaultSort);
  const [page, setPage] = useState(1);

  const toggleSort = (key: string) => {
    setSort(prev => {
      if (prev?.key === key) {
        return prev.direction === "asc" ? { key, direction: "desc" } : null;
      }
      return { key, direction: "asc" };
    });
    setPage(1);
  };

  const setSearch = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const toPayload = (filters?: Record<string, unknown>): TableQueryPayload => {
    const payload: TableQueryPayload = {
      filters: filters || {},
      options: {
        page,
        itemsPerPage: pageSize,
      },
    };

    if (search.trim()) {
      payload.search = [
        {
          term: search.trim(),
          fields: searchFields,
        },
      ];
    }

    if (sort) {
      const mappedSortKey = sortKeyMap[sort.key] || sort.key;
      payload.options = {
        ...payload.options,
        sortBy: [mappedSortKey],
        sortDesc: [sort.direction === "desc"],
      };
    }

    return payload;
  };

  return useMemo(
    () => ({
      search,
      setSearch,
      sort,
      toggleSort,
      page,
      setPage,
      pageSize,
      toPayload,
    }),
    [search, sort, page, pageSize, sortKeyMap],
  );
};
