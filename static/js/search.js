(function () {
  let index = null;
  let selectedIndex = -1;

  function initIndex() {
    if (!index && window.elasticlunr && window.searchIndex) {
      index = elasticlunr.Index.load(window.searchIndex);
    }
    return index;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function highlightMatches(text, query) {
    if (!text || !query) return escapeHtml(text);
    const words = query
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (words.length === 0) return escapeHtml(text);

    const regex = new RegExp(`(${words.join('|')})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  function getSnippet(body, query, maxLength = 100) {
    if (!body) return '';
    const cleanBody = body.replace(/[\r\n\t]+/g, ' ').trim();
    const words = query
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);

    let matchIdx = -1;
    for (const word of words) {
      const idx = cleanBody.toLowerCase().indexOf(word.toLowerCase());
      if (idx !== -1 && (matchIdx === -1 || idx < matchIdx)) {
        matchIdx = idx;
      }
    }

    if (matchIdx === -1) {
      const snippet = cleanBody.slice(0, maxLength);
      return highlightMatches(snippet + (cleanBody.length > maxLength ? '…' : ''), query);
    }

    const start = Math.max(0, matchIdx - 30);
    const end = Math.min(cleanBody.length, matchIdx + maxLength - 30);
    let snippet = cleanBody.slice(start, end);

    if (start > 0) snippet = '…' + snippet;
    if (end < cleanBody.length) snippet = snippet + '…';

    return highlightMatches(snippet, query);
  }

  function closeSuggestions(resultsContainer, input) {
    resultsContainer.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    selectedIndex = -1;
  }

  function openSuggestions(resultsContainer, input) {
    resultsContainer.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function updateActiveSuggestion(items) {
    items.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add('active', 'selected');
        item.setAttribute('aria-selected', 'true');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active', 'selected');
        item.setAttribute('aria-selected', 'false');
      }
    });
  }

  function setupSearch() {
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchSuggestions = document.getElementById('search-suggestions');

    if (!searchContainer || !searchInput || !searchResults || !searchSuggestions) {
      return;
    }

    function performSearch() {
      const query = searchInput.value.trim();
      selectedIndex = -1;

      if (!query) {
        closeSuggestions(searchResults, searchInput);
        searchSuggestions.innerHTML = '';
        return;
      }

      const searchIdx = initIndex();
      if (!searchIdx) {
        return;
      }

      const results = searchIdx.search(query, {
        fields: {
          title: { boost: 3 },
          body: { boost: 1 },
        },
        bool: 'OR',
        expand: true,
      });

      searchSuggestions.innerHTML = '';

      if (results.length === 0) {
        const noResults = document.createElement('li');
        noResults.className = 'search-suggestion-item search-no-results';
        noResults.setAttribute('role', 'status');
        noResults.textContent = `No results found for "${query}"`;
        searchSuggestions.appendChild(noResults);
        openSuggestions(searchResults, searchInput);
        return;
      }

      const maxSuggestions = 8;
      const suggestionsToShow = results.slice(0, maxSuggestions);

      suggestionsToShow.forEach((res, idx) => {
        const doc = res.doc || searchIdx.documentStore.getDoc(res.ref);
        if (!doc) return;

        const li = document.createElement('li');
        li.className = 'search-suggestion-item';
        li.setAttribute('role', 'option');
        li.setAttribute('id', `search-suggestion-${idx}`);

        const link = document.createElement('a');
        link.className = 'search-suggestion-link';
        link.href = doc.id || res.ref;

        const titleDiv = document.createElement('div');
        titleDiv.className = 'search-suggestion-title';
        titleDiv.innerHTML = highlightMatches(doc.title || 'Untitled', query);

        const snippetDiv = document.createElement('div');
        snippetDiv.className = 'search-suggestion-snippet';
        snippetDiv.innerHTML = getSnippet(doc.body || '', query);

        link.appendChild(titleDiv);
        link.appendChild(snippetDiv);
        li.appendChild(link);
        searchSuggestions.appendChild(li);
      });

      openSuggestions(searchResults, searchInput);
    }

    searchInput.addEventListener('input', performSearch);

    searchInput.addEventListener('focus', function () {
      if (searchInput.value.trim().length > 0 && searchSuggestions.children.length > 0) {
        openSuggestions(searchResults, searchInput);
      }
    });

    searchInput.addEventListener('keydown', function (e) {
      const items = searchSuggestions.querySelectorAll(
        '.search-suggestion-item:not(.search-no-results)'
      );

      if (e.key === 'ArrowDown') {
        if (searchResults.hidden) {
          performSearch();
          return;
        }
        e.preventDefault();
        if (items.length > 0) {
          selectedIndex = (selectedIndex + 1) % items.length;
          updateActiveSuggestion(items);
        }
      } else if (e.key === 'ArrowUp') {
        if (searchResults.hidden) return;
        e.preventDefault();
        if (items.length > 0) {
          selectedIndex = (selectedIndex - 1 + items.length) % items.length;
          updateActiveSuggestion(items);
        }
      } else if (e.key === 'Enter') {
        if (!searchResults.hidden && items.length > 0) {
          e.preventDefault();
          const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
          const targetLink = items[targetIndex].querySelector('a');
          if (targetLink) {
            targetLink.click();
          }
        }
      } else if (e.key === 'Escape') {
        closeSuggestions(searchResults, searchInput);
      }
    });

    document.addEventListener('click', function (e) {
      if (!searchContainer.contains(e.target)) {
        closeSuggestions(searchResults, searchInput);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSearch);
  } else {
    setupSearch();
  }
})();
