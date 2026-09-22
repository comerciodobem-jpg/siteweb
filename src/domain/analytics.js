function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function periodTotals(records, now = new Date()) {
  const weekStart = startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  let today = 0, week = 0, month = 0;
  for (const record of records ?? []) {
    const when = new Date(record.recorded_at);
    const qty = Number(record.declared_quantity || 0);
    if (sameDay(when, now)) today += qty;
    if (when >= weekStart && when <= now) week += qty;
    if (when >= monthStart && when <= now) month += qty;
  }
  return { today, week, month };
}

export function weeklyBuckets(records, now = new Date()) {
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const buckets = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - offset);
    date.setHours(0,0,0,0);
    const quantity = (records ?? []).reduce((sum, record) => {
      const when = new Date(record.recorded_at);
      return sameDay(when, date) ? sum + Number(record.declared_quantity || 0) : sum;
    }, 0);
    buckets.push({ date: date.toISOString(), label: labels[date.getDay()], quantity });
  }
  return buckets;
}

export function filterRecordsByPeriod(records, period, now = new Date()) {
  if (period === 'today') return records.filter((record) => sameDay(new Date(record.recorded_at), now));
  if (period === 'week') {
    const start = startOfWeek(now);
    return records.filter((record) => new Date(record.recorded_at) >= start && new Date(record.recorded_at) <= now);
  }
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return records.filter((record) => new Date(record.recorded_at) >= start && new Date(record.recorded_at) <= now);
  }
  return records;
}

export function confirmedReviewTotals(reviews, now = new Date()) {
  const weekStart = startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  let today = 0, week = 0, month = 0;
  for (const review of reviews ?? []) {
    const when = new Date(review.reviewed_at);
    const qty = Number(review.confirmed_quantity || 0);
    if (Number.isNaN(when.getTime())) continue;
    if (sameDay(when, now)) today += qty;
    if (when >= weekStart && when <= now) week += qty;
    if (when >= monthStart && when <= now) month += qty;
  }
  return { today, week, month };
}
