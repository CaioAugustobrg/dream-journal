export type Dream = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export type DreamFilters = {
  from?: string;
  to?: string;
  qTitle?: string;
  qContent?: string;
};
