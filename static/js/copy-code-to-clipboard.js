const codeBlocks = document.querySelectorAll("pre.giallo code[data-lang]:not([data-lang='plain'])");

for (const codeBlock of codeBlocks) {
    const preBlock = codeBlock.parentElement;

    // Giallo wraps every line in a .giallo-l span, with optional .giallo-ln spans
    // for line numbers. Extract text from each line span, stripping line numbers.
    const content = [...codeBlock.querySelectorAll(".giallo-l")]
        .map((line) => {
            const clone = line.cloneNode(true);
            clone.querySelectorAll(".giallo-ln").forEach((ln) => ln.remove());
            return clone.textContent;
        })
        .join("\n");

    if (navigator.clipboard !== undefined) {
        const copyButton = document.createElement("button");
        copyButton.classList.add("copy-button");
        copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="var(--background-600)" viewBox="0 0 256 256"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path></svg>`;

        copyButton.addEventListener("click", () => {
            copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="var(--primary-600)" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path></svg>`;
            navigator.clipboard.writeText(content);
            setTimeout(() => {
                copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="var(--background-600)" viewBox="0 0 256 256"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path></svg>`;
            }, 1000);
        });

        preBlock.prepend(copyButton);
    }
}

// document.getElementById("current-path").innerText = "~" + window.location.pathname;

