export function calculateNeedProgress(need, reviews = []) {
  if (!need) return null;
  const target = Number(need.target_quantity);
  const confirmed = reviews
    .filter((review) => review.product_id === need.product_id)
    .reduce((sum, review) => sum + Number(review.confirmed_quantity || 0), 0);
  const remaining = Math.max(0, target - confirmed);
  const percent = target > 0 ? Math.min(100, Math.round((confirmed / target) * 100)) : 0;
  return { target, confirmed, remaining, percent };
}

export function activeNeeds(state, companyId) {
  return (state.productionNeeds ?? []).filter((need) => need.company_id === companyId && need.status !== 'COMPLETED' && need.status !== 'CANCELLED');
}

export function needStatus(need, reviews = []) {
  const progress = calculateNeedProgress(need, reviews);
  if (!progress) return 'NONE';
  if (progress.remaining === 0) return 'COMPLETED';
  if (progress.confirmed > 0) return 'IN_PROGRESS';
  return 'OPEN';
}
