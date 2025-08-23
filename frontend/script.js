// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Global state
let notes = [];
let currentPage = 1;
let totalPages = 1;
let isEditing = false;
let editingNoteId = null;
let noteToDelete = null;

// DOM Elements
const elements = {
  noteModal: document.getElementById('noteModal'),
  confirmModal: document.getElementById('confirmModal'),
  noteForm: document.getElementById('noteForm'),
  notesContainer: document.getElementById('notesContainer'),
  loading: document.getElementById('loading'),
  errorMessage: document.getElementById('errorMessage'),
  emptyState: document.getElementById('emptyState'),
  pagination: document.getElementById('pagination'),
  searchInput: document.getElementById('searchInput'),
  sortSelect: document.getElementById('sortSelect'),
  orderSelect: document.getElementById('orderSelect'),
  modalTitle: document.getElementById('modalTitle'),
  noteTitle: document.getElementById('noteTitle'),
  noteContent: document.getElementById('noteContent'),
  pageInfo: document.getElementById('pageInfo'),
  prevPage: document.getElementById('prevPage'),
  nextPage: document.getElementById('nextPage'),
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
  initializeEventListeners();
  loadNotes();
});

// Event Listeners
function initializeEventListeners() {
  // Add note button
  document.getElementById('addNoteBtn').addEventListener('click', function () {
    console.log('Add Note button clicked');
    openModal();
  });

  // Modal controls
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);

  // Form submission
  elements.noteForm.addEventListener('submit', handleFormSubmit);

  // Search functionality
  elements.searchInput.addEventListener('input', debounce(handleSearch, 300));

  // Sort controls
  elements.sortSelect.addEventListener('change', loadNotes);
  elements.orderSelect.addEventListener('change', loadNotes);

  // Pagination
  elements.prevPage.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadNotes();
    }
  });

  elements.nextPage.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadNotes();
    }
  });

  // Confirmation modal
  document
    .getElementById('confirmCancel')
    .addEventListener('click', closeConfirmModal);
  document
    .getElementById('confirmDelete')
    .addEventListener('click', confirmDelete);

  // Close modals when clicking outside
  window.addEventListener('click', function (event) {
    if (event.target === elements.noteModal) {
      closeModal();
    }
    if (event.target === elements.confirmModal) {
      closeConfirmModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeModal();
      closeConfirmModal();
    }
  });
}

// API Functions
async function fetchNotes(
  page = 1,
  searchTerm = '',
  sortBy = 'updatedAt',
  sortOrder = 'desc'
) {
  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: '12',
    sortBy,
    sortOrder,
  });

  const response = await fetch(`${API_BASE_URL}/notes?${searchParams}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

async function createNote(noteData) {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create note');
  }

  return await response.json();
}

async function updateNote(id, noteData) {
  if (!isValidObjectId(id)) {
    throw new Error('Invalid note ID format');
  }

  const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update note');
  }

  return await response.json();
}

async function deleteNote(id) {
  if (!isValidObjectId(id)) {
    throw new Error('Invalid note ID format');
  }

  const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete note');
  }

  return await response.json();
}

// UI Functions
async function loadNotes() {
  try {
    showLoading();
    hideError();

    const searchTerm = elements.searchInput.value.trim();
    const sortBy = elements.sortSelect.value;
    const sortOrder = elements.orderSelect.value;

    console.log(
      `Loading notes - Page: ${currentPage}, Sort: ${sortBy} ${sortOrder}`
    );

    const data = await fetchNotes(currentPage, searchTerm, sortBy, sortOrder);

    console.log('Received notes data:', data);

    // Validate the received data
    if (!data || !Array.isArray(data.notes)) {
      throw new Error('Invalid response format from server');
    }

    notes = data.notes;
    totalPages = data.totalPages;

    renderNotes();
    updatePagination(data);

    // Show empty state if no notes
    if (notes.length === 0 && currentPage === 1) {
      showEmptyState();
    } else {
      hideEmptyState();
    }
  } catch (error) {
    console.error('Error loading notes:', error);
    showError(
      'Failed to load notes. Please check your connection and try again.'
    );
  } finally {
    hideLoading();
  }
}

function renderNotes() {
  if (notes.length === 0) {
    elements.notesContainer.innerHTML = '';
    return;
  }

  // Filter out invalid notes and log any issues
  const validNotes = notes.filter((note) => {
    if (!note || !note._id || !isValidObjectId(note._id)) {
      console.warn('Filtering out invalid note:', note);
      return false;
    }
    return true;
  });

  if (validNotes.length !== notes.length) {
    console.warn(
      `Filtered out ${notes.length - validNotes.length} invalid notes`
    );
  }

  const notesHTML = validNotes.map((note) => createNoteCard(note)).join('');
  elements.notesContainer.innerHTML = notesHTML;
}

function createNoteCard(note) {
  // Validate note data
  if (!note || !note._id || !isValidObjectId(note._id)) {
    console.error('Invalid note data:', note);
    return '<div class="note-card error">Invalid note data</div>';
  }

  const createdDate = new Date(note.createdAt).toLocaleDateString();
  const updatedDate = new Date(note.updatedAt).toLocaleDateString();
  const timeAgo = getTimeAgo(new Date(note.updatedAt));

  // Truncate content for preview
  const maxLength = 200;
  const truncatedContent =
    note.content.length > maxLength
      ? note.content.substring(0, maxLength) + '...'
      : note.content;

  const showExpandButton = note.content.length > maxLength;

  return `
        <div class="note-card" data-note-id="${note._id}">
            <div class="note-header">
                <h3 class="note-title">${escapeHtml(note.title)}</h3>
                <div class="note-actions">
                    <button class="btn btn-small btn-secondary" onclick="editNote('${
                      note._id
                    }')" title="Edit note">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="showDeleteConfirmation('${
                      note._id
                    }')" title="Delete note">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="note-content" id="content-${note._id}">
                ${escapeHtml(truncatedContent)}
            </div>
            ${
              showExpandButton
                ? `
                <button class="expand-btn" onclick="toggleContent('${note._id}')">
                    <span id="expand-text-${note._id}">Show more</span>
                </button>
            `
                : ''
            }
            <div class="note-footer">
                <span>Created: ${createdDate}</span>
                <span title="Updated: ${updatedDate}">${timeAgo}</span>
            </div>
        </div>
    `;
}

function toggleContent(noteId) {
  if (!isValidObjectId(noteId)) {
    console.error('Invalid note ID format:', noteId);
    showError('Invalid note ID. Please refresh the page and try again.');
    return;
  }

  const note = notes.find((n) => n._id === noteId);
  if (!note) {
    console.error('Note not found:', noteId);
    showError('Note not found. Please refresh the page and try again.');
    return;
  }

  const contentElement = document.getElementById(`content-${noteId}`);
  const expandText = document.getElementById(`expand-text-${noteId}`);

  if (contentElement.classList.contains('expanded')) {
    // Collapse
    const maxLength = 200;
    const truncatedContent =
      note.content.length > maxLength
        ? note.content.substring(0, maxLength) + '...'
        : note.content;
    contentElement.innerHTML = escapeHtml(truncatedContent);
    contentElement.classList.remove('expanded');
    expandText.textContent = 'Show more';
  } else {
    // Expand
    contentElement.innerHTML = escapeHtml(note.content);
    contentElement.classList.add('expanded');
    expandText.textContent = 'Show less';
  }
}

function updatePagination(data) {
  if (data.totalPages <= 1) {
    elements.pagination.classList.add('hidden');
    return;
  }

  elements.pagination.classList.remove('hidden');
  elements.pageInfo.textContent = `Page ${data.currentPage} of ${data.totalPages}`;

  elements.prevPage.disabled = data.currentPage <= 1;
  elements.nextPage.disabled = data.currentPage >= data.totalPages;
}

// Modal Functions
function openModal(noteData = null) {
  // Set editing state based on whether we have note data
  isEditing = noteData !== null && noteData !== undefined;

  console.log('Opening modal - isEditing:', isEditing, 'noteData:', noteData);

  if (isEditing) {
    // Validate note data when editing
    if (!noteData || !noteData._id || !isValidObjectId(noteData._id)) {
      console.error('Invalid note data for editing:', noteData);
      showError('Invalid note data. Please refresh the page and try again.');
      return;
    }
    editingNoteId = noteData._id;
    elements.modalTitle.textContent = 'Edit Note';
    elements.noteTitle.value = noteData.title || '';
    elements.noteContent.value = noteData.content || '';
  } else {
    // Creating new note
    editingNoteId = null;
    elements.modalTitle.textContent = 'Add New Note';
    elements.noteForm.reset();
  }

  elements.noteModal.style.display = 'block';
  elements.noteTitle.focus();
}

function closeModal() {
  elements.noteModal.style.display = 'none';
  elements.noteForm.reset();
  isEditing = false;
  editingNoteId = null;
}

function showDeleteConfirmation(noteId) {
  if (!isValidObjectId(noteId)) {
    console.error('Invalid note ID format:', noteId);
    showError('Invalid note ID. Please refresh the page and try again.');
    return;
  }

  noteToDelete = noteId;
  elements.confirmModal.style.display = 'block';
}

function closeConfirmModal() {
  elements.confirmModal.style.display = 'none';
  noteToDelete = null;
}

// Event Handlers
async function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const noteData = {
    title: formData.get('title').trim(),
    content: formData.get('content').trim(),
  };

  if (!noteData.title || !noteData.content) {
    showError('Both title and content are required.');
    return;
  }

  console.log(
    'Form submit - isEditing:',
    isEditing,
    'editingNoteId:',
    editingNoteId
  );

  try {
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    if (isEditing) {
      if (!editingNoteId || !isValidObjectId(editingNoteId)) {
        throw new Error(
          'Invalid note ID for editing. Please refresh and try again.'
        );
      }
      console.log('Updating note with ID:', editingNoteId);
      await updateNote(editingNoteId, noteData);
      showSuccess('Note updated successfully!');
    } else {
      console.log('Creating new note');
      await createNote(noteData);
      showSuccess('Note created successfully!');
    }

    closeModal();
    await loadNotes();
  } catch (error) {
    console.error('Error saving note:', error);
    showError(error.message);
  } finally {
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="fas fa-save"></i> Save Note';
  }
}

async function editNote(noteId) {
  if (!isValidObjectId(noteId)) {
    console.error('Invalid note ID format:', noteId);
    showError('Invalid note ID. Please refresh the page and try again.');
    return;
  }

  const note = notes.find((n) => n._id === noteId);
  if (note) {
    openModal(note);
  } else {
    console.error('Note not found:', noteId);
    showError('Note not found. Please refresh the page and try again.');
  }
}

async function confirmDelete() {
  if (!noteToDelete) return;

  if (!isValidObjectId(noteToDelete)) {
    console.error('Invalid note ID format:', noteToDelete);
    showError('Invalid note ID. Please refresh the page and try again.');
    closeConfirmModal();
    return;
  }

  try {
    const deleteButton = document.getElementById('confirmDelete');
    deleteButton.disabled = true;
    deleteButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Deleting...';

    await deleteNote(noteToDelete);
    showSuccess('Note deleted successfully!');

    closeConfirmModal();
    await loadNotes();
  } catch (error) {
    console.error('Error deleting note:', error);
    showError(error.message);
  } finally {
    const deleteButton = document.getElementById('confirmDelete');
    deleteButton.disabled = false;
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
  }
}

function handleSearch() {
  currentPage = 1; // Reset to first page when searching
  loadNotes();
}

// Utility Functions
function isValidObjectId(id) {
  // Check if the id is a valid MongoDB ObjectId (24 character hex string)
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}

function showLoading() {
  elements.loading.classList.remove('hidden');
  elements.notesContainer.style.opacity = '0.5';
}

function hideLoading() {
  elements.loading.classList.add('hidden');
  elements.notesContainer.style.opacity = '1';
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorMessage.classList.remove('hidden');

  // Auto-hide error after 5 seconds
  setTimeout(() => {
    hideError();
  }, 5000);
}

function hideError() {
  elements.errorMessage.classList.add('hidden');
}

function showSuccess(message) {
  // Create a temporary success message
  const successDiv = document.createElement('div');
  successDiv.className = 'error-message';
  successDiv.style.background = '#c6f6d5';
  successDiv.style.color = '#22543d';
  successDiv.style.borderLeftColor = '#38a169';
  successDiv.textContent = message;

  // Insert after error message
  elements.errorMessage.parentNode.insertBefore(
    successDiv,
    elements.errorMessage.nextSibling
  );

  // Auto-hide after 3 seconds
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

function showEmptyState() {
  elements.emptyState.classList.remove('hidden');
}

function hideEmptyState() {
  elements.emptyState.classList.add('hidden');
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function getTimeAgo(date) {
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
