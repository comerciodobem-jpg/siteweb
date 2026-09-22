export function enqueueRecord(queue, record) {
  if (!record?.idempotency_key) throw new Error('Registro sem chave de idempotência.');
  if (!queue.some((item) => item.idempotency_key === record.idempotency_key)) {
    queue.push(record);
  }
  return queue;
}

export async function flushQueue(queue, sender) {
  for (let index = 0; index < queue.length;) {
    const record = queue[index];
    try {
      const result = await sender(record);
      if (result?.ok === false) throw new Error(result.error || 'Falha na sincronização.');
      queue.splice(index, 1);
    } catch (error) {
      record.last_sync_error = error.message;
      index += 1;
    }
  }
  return queue;
}

export function updateLocalSyncState(state, online = globalThis.navigator?.onLine ?? true) {
  if (!online) return 0;
  let changed = 0;
  for (const record of state.productionRecords ?? []) {
    if (record.sync_status === 'LOCAL_PENDING') {
      record.sync_status = 'SYNCED';
      changed += 1;
    }
  }
  return changed;
}
