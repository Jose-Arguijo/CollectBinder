import { useCallback, useEffect, useState } from 'react';
import { supabase, type Collection, type Card, type CollectionWithStats } from '@/lib/supabase';

export function useCollectionData() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    const [colRes, cardRes] = await Promise.all([
      supabase.from('collections').select('*').order('created_at', { ascending: true }),
      supabase.from('cards').select('*').order('created_at', { ascending: false }),
    ]);

    if (colRes.error || cardRes.error) {
      setError('Failed to load data. Try again.');
      setLoading(false);
      return;
    }

    setCollections(colRes.data ?? []);
    setCards(cardRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const buildTree = useCallback((): CollectionWithStats[] => {
    const byParent = new Map<string | null, Collection[]>();
    for (const c of collections) {
      const key = c.parent_id;
      const list = byParent.get(key) ?? [];
      list.push(c);
      byParent.set(key, list);
    }

    const buildNode = (col: Collection): CollectionWithStats => {
      const children = (byParent.get(col.id) ?? []).map(buildNode);
      const directCards = cards.filter((card) => card.collection_id === col.id);
      const childCardCount = children.reduce((sum, c) => sum + c.cardCount, 0);
      const childValue = children.reduce((sum, c) => sum + c.totalValue, 0);
      const directValue = directCards.reduce((sum, c) => sum + c.value * c.quantity, 0);

      return {
        ...col,
        cardCount: directCards.length + childCardCount,
        totalValue: directValue + childValue,
        childCollections: children,
      };
    };

    return (byParent.get(null) ?? []).map(buildNode);
  }, [collections, cards]);

  const tree = buildTree();

  const getCollection = useCallback(
    (id: string): Collection | undefined => collections.find((c) => c.id === id),
    [collections],
  );

  const getCardsInCollection = useCallback(
    (id: string): Card[] => cards.filter((c) => c.collection_id === id),
    [cards],
  );

  const getSubcollections = useCallback(
    (id: string): Collection[] => collections.filter((c) => c.parent_id === id),
    [collections],
  );

  const getDescendantCollectionIds = useCallback(
    (id: string): string[] => {
      const result: string[] = [id];
      const queue = [id];
      while (queue.length > 0) {
        const current = queue.shift()!;
        const children = collections.filter((c) => c.parent_id === current);
        for (const child of children) {
          result.push(child.id);
          queue.push(child.id);
        }
      }
      return result;
    },
    [collections],
  );

  const getCardsInCollectionTree = useCallback(
    (id: string): Card[] => {
      const ids = new Set(getDescendantCollectionIds(id));
      return cards.filter((c) => ids.has(c.collection_id));
    },
    [cards, getDescendantCollectionIds],
  );

  const addCollection = useCallback(
    async (name: string, icon: string, color: string, parentId: string | null) => {
      await supabase.from('collections').insert({ name, icon, color, parent_id: parentId });
      await loadData();
    },
    [loadData],
  );

  const updateCollection = useCallback(
    async (id: string, updates: Partial<Pick<Collection, 'name' | 'icon' | 'color' | 'parent_id'>>) => {
      await supabase.from('collections').update(updates).eq('id', id);
      await loadData();
    },
    [loadData],
  );

  const deleteCollection = useCallback(
    async (id: string) => {
      await supabase.from('collections').delete().eq('id', id);
      await loadData();
    },
    [loadData],
  );

  const addCard = useCallback(
    async (card: Omit<Card, 'id' | 'created_at'>) => {
      await supabase.from('cards').insert(card);
      await loadData();
    },
    [loadData],
  );

  const updateCard = useCallback(
    async (id: string, updates: Partial<Omit<Card, 'id' | 'created_at'>>) => {
      await supabase.from('cards').update(updates).eq('id', id);
      await loadData();
    },
    [loadData],
  );

  const deleteCard = useCallback(
    async (id: string) => {
      await supabase.from('cards').delete().eq('id', id);
      await loadData();
    },
    [loadData],
  );

  const moveCollection = useCallback(
    async (id: string, newParentId: string | null) => {
      await supabase.from('collections').update({ parent_id: newParentId }).eq('id', id);
      await loadData();
    },
    [loadData],
  );

  return {
    collections,
    cards,
    tree,
    loading,
    error,
    getCollection,
    getCardsInCollection,
    getCardsInCollectionTree,
    getSubcollections,
    addCollection,
    updateCollection,
    deleteCollection,
    addCard,
    updateCard,
    deleteCard,
    moveCollection,
    reload: loadData,
  };
}

export function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
