import { apiFetch, apiJson } from "./client";

export async function getChecklists() {
  return apiJson("/api/checklists");
}

export async function createChecklist({ title, description }) {
  return apiJson("/api/checklists", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
}

export async function getChecklistDetail(id) {
  return apiJson(`/api/checklists/${id}`);
}

export async function addChecklistItem(
  checklistId,
  { name, assignedTo, quantity }
) {
  return apiJson(`/api/checklists/${checklistId}/items`, {
    method: "POST",
    body: JSON.stringify({
      name,
      assignedTo: assignedTo || null,
      quantity: quantity ?? 1,
    }),
  });
}

export async function updateChecklistItemStatus(
  checklistId,
  itemId,
  isCompleted
) {
  return apiJson(`/api/checklists/${checklistId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ isCompleted }),
  });
}

export async function removeChecklistItem(checklistId, itemId) {
  const res = await apiFetch(`/api/checklists/${checklistId}/items/${itemId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = data?.message || `HTTP ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
}
