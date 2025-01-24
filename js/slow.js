        class TrieNode {
            constructor() {
                this.children = {};
                this.isEndOfWord = false;
            }
        }

        class Trie {
            constructor() {
                this.root = new TrieNode();
            }

            // Insert a word into the Trie
            insert(word) {
                let node = this.root;
                for (const char of word) {
                    if (!node.children[char]) {
                        node.children[char] = new TrieNode();
                    }
                    node = node.children[char];
                }
                node.isEndOfWord = true;
            }

            // Search for a prefix in the Trie
            searchPrefix(prefix) {
                let node = this.root;
                for (const char of prefix) {
                    if (!node.children[char]) {
                        return null;
                    }
                    node = node.children[char];
                }
                return node;
            }

            // Get all words starting with a given prefix
            autocomplete(prefix) {
                const results = [];
                const node = this.searchPrefix(prefix);
                if (!node) return results;

                const dfs = (currentNode, currentWord) => {
                    if (currentNode.isEndOfWord) {
                        results.push(currentWord);
                    }
                    for (const [char, childNode] of Object.entries(currentNode.children)) {
                        dfs(childNode, currentWord + char);
                    }
                };

                dfs(node, prefix);
                return results;
            }
        }

        const trie = new Trie();
        const filename = "data/words.txt"
        async function loadWordsFromFile(filePath) {
            const response = await fetch(filePath);
            const text = await response.text();
            const words = text.split(/\r?\n/); // Split words by newlines
            words.forEach(word => {
                if (word.trim()) trie.insert(word.trim().toLowerCase()); // Insert non-empty words
            });
            console.log("Words loaded into Trie");
        }

        // Load words from a sample file
        loadWordsFromFile(filename);

        const inputField = document.getElementById("search");
        const suggestionsList = document.getElementById("suggestions");

        // Fetch autocomplete suggestions in real-time
        inputField.addEventListener("input", () => {
            const query = inputField.value.toLowerCase().trim();
            suggestionsList.innerHTML = ""; // Clear previous suggestions

            if (query.length > 0) {
                const suggestions = trie.autocomplete(query);
                suggestions.forEach(word => {
                    const li = document.createElement("li");
                    li.textContent = word;
                    li.addEventListener("click", () => {
                        inputField.value = word; // Fill input field on click
                        suggestionsList.innerHTML = ""; // Clear suggestions
                    });
                    suggestionsList.appendChild(li);
                });
            }
        });
