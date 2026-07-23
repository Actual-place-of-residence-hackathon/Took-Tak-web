"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLocationTree } from "@/shared/config/site-map";

// 건물→층→구역 목록은 자주 안 바뀌므로 꽤 오래 캐시해도 됩니다.
export function useLocationTree() {
  return useQuery({
    queryKey: ["locationTree"],
    queryFn: fetchLocationTree,
    staleTime: 5 * 60 * 1000,
  });
}
