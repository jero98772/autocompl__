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


const globalTrie = new Trie();
const errorDiv = document.getElementById("error");
const statusDiv = document.getElementById("status");

async function createParallelLoader(maxThreads = 3) {
    const files = ['data/words.txt', 'data/words_en.txt', 'data/words_ge.txt'];
    let completedFiles = 0;
    const taskQueue = [...files]; // Queue of files to process
    const activeWorkers = [];

    // Helper function to process a single file
    async function processFile(fileName) {
        try {
            const response = await fetch(fileName);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            const words = text.split(/\r?\n/)
                .filter(word => word.trim())
                .map(word => word.trim().toLowerCase());

            words.forEach(word => globalTrie.insert(word));

            completedFiles++;
            statusDiv.textContent = `Loaded ${completedFiles}/${files.length} word files`;
        } catch (error) {
            errorDiv.textContent += `\nError loading ${fileName}: ${error.message}`;
        }
    }

    // Worker function to consume tasks from the queue
    async function worker() {
        while (taskQueue.length > 0) {
            const fileName = taskQueue.shift(); // Get the next file to process
            await processFile(fileName);
        }
    }

    // Create worker threads
    for (let i = 0; i < maxThreads; i++) {
        activeWorkers.push(worker());
    }

    // Wait for all workers to finish
    await Promise.all(activeWorkers);

    // Final status update
    if (completedFiles === files.length) {
        statusDiv.textContent = 'All word files loaded successfully';
    }
}


// Initiate parallel loading
createParallelLoader();

const inputField = document.getElementById("search");
const suggestionsList = document.getElementById("suggestions");

inputField.addEventListener("input", () => {
    const query = inputField.value.toLowerCase().trim();
    suggestionsList.innerHTML = "";

    if (query.length > 1) {
        const suggestions = globalTrie.autocomplete(query);
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