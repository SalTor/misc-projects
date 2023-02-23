import { useMemo } from "react";

import catalog from "src/pages/api/FGT-Frontend-Take-Home";
import { useCartStore } from "src/stores/cart";

const useRecommendations = () => {
  const currentCart = useCartStore((state) => state.currentCart);

  const recommendations = useMemo(() => {
    const { treeCount, kitCount, hasClips } = Object.values(currentCart).reduce(
      (acc, curr) => {
        if (curr.product.product_type === "Tree")
          return { ...acc, treeCount: acc.treeCount + curr.count };
        if (curr.product.id === 1532751872052)
          return { ...acc, kitCount: curr.count };
        if (curr.product.id === 4813305610302)
          return { ...acc, hasClips: true };
        return acc;
      },
      { treeCount: 0, kitCount: 0, hasClips: false }
    );
    const recClips = treeCount > 0 && !hasClips;
    const recKit = treeCount > kitCount;
    return catalog.recommendations.filter((r) => {
      return !(
        (r.id === 1532751872052 && !recKit) ||
        (r.id === 4813305610302 && !recClips)
      );
    });
  }, [currentCart]);
  return recommendations;
};

export default useRecommendations;
