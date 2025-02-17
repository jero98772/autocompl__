class TrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        for (const char of word) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char);
        }
        node.isEndOfWord = true;
    }

    searchPrefix(prefix) {
        let node = this.root;
        for (const char of prefix) {
            if (!node.children.has(char)) {
                return null;
            }
            node = node.children.get(char);
        }
        return node;
    }

    autocomplete(prefix, maxResults = 10) {
        const results = [];
        const node = this.searchPrefix(prefix);
        if (!node) return results;

        const dfs = (currentNode, currentWord) => {
            if (results.length >= maxResults) return;

            if (currentNode.isEndOfWord) {
                results.push(currentWord);
            }

            for (const [char, childNode] of currentNode.children) {
                if (results.length < maxResults) {
                    dfs(childNode, currentWord + char);
                }
            }
        };

        dfs(node, prefix);
        return results;
    }
}

const trie = new Trie();
const errorDiv = document.getElementById("error");
const statusDiv = document.getElementById("status");

async function loadWordsFromFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const words = text.split(/\r?\n/);
        words.forEach(word => {
            if (word.trim()) trie.insert(word.trim().toLowerCase());
        });
        console.log(`Loaded ${words.length} words into Trie`);
        errorDiv.textContent = `Loaded ${words.length} words successfully`;
    } catch (error) {
        console.error("Error loading words:", error);
        errorDiv.textContent = `Error loading words: ${error.message}. Ensure words.txt exists in the same directory.`;
    }
}

let completedFiles = 0;
const files = ['data/words.txt', 'data/words_en.txt', 'data/words_ge.txt'];
for (var i = files.length - 1; i >= 0; i--) {
    statusDiv.textContent = `Loaded ${completedFiles}/${files.length} word files`;
    loadWordsFromFile(files[i]);
    completedFiles++;
    statusDiv.textContent = `Loaded ${completedFiles}/${files.length} word files`;
}

const inputField = document.getElementById("search");
const suggestionsList = document.getElementById("suggestions");

inputField.addEventListener("input", () => {
    const query = inputField.value.toLowerCase().trim();
    suggestionsList.innerHTML = "";

    if (query.length > 1) {
        const suggestions = trie.autocomplete(query);
        suggestions.forEach(word => {
            const li = document.createElement("li");
            li.textContent = word;
            li.addEventListener("click", () => {
                inputField.value = word;
                suggestionsList.innerHTML = "";
            });
            suggestionsList.appendChild(li);
        });
    }
});