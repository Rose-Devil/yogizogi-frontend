// src/api/comments.js
// API client for comment-related endpoints
import { apiJson } from "@/api/client";

/**
 * Fetch comments for a post.
 * @param {string|number} postId
 * @returns {Promise<Array>} List of comment objects
 */
export async function getComments(postId) {
    const res = await apiJson(`/api/posts/${postId}/comments`);
    // Assuming the backend returns { success: true, data: [...] }
    return res.data;
}

/**
 * Create a new comment on a post.
 * @param {string|number} postId
 * @param {string} content
 * @returns {Promise<Object>} Created comment
 */
export async function createComment(postId, content) {
    const res = await apiJson(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
    });
    return res.data;
}

/**
 * Create a reply to an existing comment.
 * @param {string|number} postId
 * @param {string|number} commentId
 * @param {string} content
 * @returns {Promise<Object>} Created reply comment
 */
export async function createReply(postId, commentId, content) {
    const res = await apiJson(`/api/comments/${commentId}/reply`, {
        method: "POST",
        body: JSON.stringify({ content, postId }),
    });
    return res.data;
}
/**
 * Update an existing comment.
 * @param {string|number} commentId
 * @param {string} content
 * @returns {Promise<Object>} Updated comment
 */
export async function updateComment(commentId, content) {
    const res = await apiJson(`/api/comments/${commentId}`, {
        method: "PUT",
        body: JSON.stringify({ content }),
    });
    return res.data;
}

/**
 * Delete a comment.
 * @param {string|number} commentId
 * @returns {Promise<void>}
 */
export async function deleteComment(commentId) {
    await apiJson(`/api/comments/${commentId}`, {
        method: "DELETE",
    });
}
